// src/utils/similarWorksGraph.ts
//
// Глобальний граф перелінковки для карток «Виконані роботи».
// Рахується ОДИН РАЗ на весь білд (у getStaticPaths), а не на кожній
// сторінці окремо — це і дає можливість врахувати загальну картину
// (хто вже отримав вхідні посилання) і уникнути карток-сиріт.
//
// Результат для кожної картки — ДВА ряди:
//   row1 (relatedTop)  — реально схожі роботи (types+tags, або хоча б types)
//   row2 (moreWorks)   — інші роботи, з пріоритетом для тих, у кого
//                        менше вхідних посилань (захист від сиріт)
//
// Налаштування нижче можна міняти без зміни логіки — все винесено
// в опції, щоб алгоритм лишався коректним і при 100–150+ картках.

import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'vykonani-roboty'>;

export interface SimilarWorksOptions {
  /** Скільки карток показувати у Ряду 1 («Схожі роботи») */
  row1Count?: number;
  /** Скільки карток показувати у Ряду 2 («Інші наші роботи») */
  row2Count?: number;
  /** Очки за співпадіння одного types */
  typeWeight?: number;
  /** Очки за співпадіння одного tags */
  tagWeight?: number;
  /**
   * Якщо після types+tags не набралось row1Count — добираємо картки
   * з тим самим основним types (без урахування tags). true за замовчуванням.
   */
  fallbackToSameType?: boolean;
}

const DEFAULT_OPTIONS: Required<SimilarWorksOptions> = {
  row1Count: 4,
  row2Count: 4,
  typeWeight: 2,
  tagWeight: 1,
  fallbackToSameType: true,
};

export interface SimilarWorksResult {
  relatedTop: Work[];  // Ряд 1 — «Схожі роботи»
  moreWorks:  Work[];  // Ряд 2 — «Інші наші роботи»
}

/**
 * Рахує score схожості between двома картками:
 * +typeWeight за кожен спільний type, +tagWeight за кожен спільний tag.
 */
function scoreBetween(
  a: Work,
  b: Work,
  opts: Required<SimilarWorksOptions>,
): number {
  let score = 0;
  const aTypes = a.data.types ?? [];
  const bTypes = b.data.types ?? [];
  for (const t of aTypes) {
    if (bTypes.includes(t)) score += opts.typeWeight;
  }
  const aTags = a.data.tags ?? [];
  const bTags = b.data.tags ?? [];
  for (const t of aTags) {
    if (bTags.includes(t)) score += opts.tagWeight;
  }
  return score;
}

/** true, якщо a і b мають хоча б один спільний type (без урахування tags) */
function sharesType(a: Work, b: Work): boolean {
  const aTypes = a.data.types ?? [];
  const bTypes = b.data.types ?? [];
  return aTypes.some((t) => bTypes.includes(t));
}

function byDateDesc(a: Work, b: Work): number {
  return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
}

function byDateAsc(a: Work, b: Work): number {
  return new Date(a.data.date).getTime() - new Date(b.data.date).getTime();
}

/**
 * Будує повний граф перелінковки для всіх карток одразу.
 * Викликати ОДИН РАЗ у getStaticPaths(), результат — Map<slug, SimilarWorksResult>.
 */
export async function getGlobalSimilarWorksMap(
  customOptions: SimilarWorksOptions = {},
): Promise<Map<string, SimilarWorksResult>> {
  const opts: Required<SimilarWorksOptions> = { ...DEFAULT_OPTIONS, ...customOptions };
  const allWorks = await getCollection('vykonani-roboty');

  // ─── ФАЗА 1: Ряд 1 («Схожі роботи») для кожної картки ─────────
  // Рахуємо незалежно для кожної картки — тут порядок обробки не
  // впливає на результат, бо ряд 1 не залежить від стану інших карток.

  const row1Map = new Map<string, Work[]>();

  for (const current of allWorks) {
    const candidates = allWorks.filter((w) => w.slug !== current.slug);

    const scored = candidates
      .map((candidate) => ({
        work: candidate,
        score: scoreBetween(current, candidate, opts),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return byDateDesc(a.work, b.work);
      });

    let top = scored.slice(0, opts.row1Count).map((x) => x.work);

    // Фолбек: не вистачило по types+tags — добираємо по самому types
    if (top.length < opts.row1Count && opts.fallbackToSameType) {
      const existing = new Set(top.map((w) => w.slug));
      const sameTypeExtra = candidates
        .filter((w) => !existing.has(w.slug) && sharesType(current, w))
        .sort(byDateDesc);

      for (const w of sameTypeExtra) {
        if (top.length >= opts.row1Count) break;
        top.push(w);
        existing.add(w.slug);
      }
    }

    row1Map.set(current.slug, top);
  }

  // ─── ФАЗА 2: Ряд 2 («Інші наші роботи») з захистом від сиріт ──
  // Обробляємо картки в порядку від найстарішої до найновішої:
  // так найстаріші (найбільш «забуті») картки першими отримують
  // шанс поповнити свій список пріоритетними сиротами, а inboundCount
  // одразу оновлюється — наступні картки в цьому ж проході вже
  // бачать актуальну картину і не дублюють турботу про вже «врятовані».

  const inboundCount = new Map<string, number>();
  for (const w of allWorks) inboundCount.set(w.slug, 0);
  for (const list of row1Map.values()) {
    for (const w of list) {
      inboundCount.set(w.slug, (inboundCount.get(w.slug) ?? 0) + 1);
    }
  }

  const row2Map = new Map<string, Work[]>();
  const processingOrder = [...allWorks].sort(byDateAsc);

  for (const current of processingOrder) {
    const row1Slugs = new Set((row1Map.get(current.slug) ?? []).map((w) => w.slug));

    const candidates = allWorks.filter(
      (w) => w.slug !== current.slug && !row1Slugs.has(w.slug),
    );

    // Пріоритет: менше вхідних посилань — вище; при рівності — новіші вище.
    const sorted = candidates.sort((a, b) => {
      const ia = inboundCount.get(a.slug) ?? 0;
      const ib = inboundCount.get(b.slug) ?? 0;
      if (ia !== ib) return ia - ib;
      return byDateDesc(a, b);
    });

    const row2 = sorted.slice(0, opts.row2Count);
    row2Map.set(current.slug, row2);

    for (const w of row2) {
      inboundCount.set(w.slug, (inboundCount.get(w.slug) ?? 0) + 1);
    }
  }

  // ─── Складаємо фінальний результат ────────────────────────────
  const result = new Map<string, SimilarWorksResult>();
  for (const w of allWorks) {
    result.set(w.slug, {
      relatedTop: row1Map.get(w.slug) ?? [],
      moreWorks:  row2Map.get(w.slug) ?? [],
    });
  }

  return result;
}
