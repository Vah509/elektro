// src/pages/sitemap.xml.ts
// ============================================================
// Власна карта сайту — БЕЗ пакету @astrojs/sitemap.
// Причина: @astrojs/sitemap падає з помилкою
// "Cannot read properties of undefined (reading 'reduce')"
// через динамічний роут vykonani-roboty/[slug].astro
// в середовищі GitHub Actions.
//
// Цей файл сам формує повний список посилань під час білду:
//  1. Статичні сторінки верхнього рівня — src/pages/*.astro
//  2. Сторінки продукції — src/pages/posluhy-ta-produktsiia/*.astro
//  3. Картки портфоліо — через getCollection('vykonani-roboty')
//  4. Русскоязычные страницы /ru/
//
// При додаванні нової сторінки .astro — вона підхоплюється
// автоматично при наступному білді, руками правити нічого не треба.
// Виняток: файли з іменем у квадратних дужках (динамічні роути)
// та admin_509.astro — вони свідомо виключені.
//
// ============================================================
// lastmod ТЕПЕР БЕРЕТЬСЯ З GIT-ІСТОРІЇ КОЖНОГО ФАЙЛУ ОКРЕМО
// ============================================================
// Раніше lastmod = дата білду для ВСІХ сторінок одразу. Це вводило
// Google в оману: сторінка, яку не редагували місяцями, щодня
// показувала "оновлено сьогодні" тільки тому, що був передеплой
// (навіть якщо змінювався лише layout/компонент/config, а не сам
// контент сторінки).
//
// Тепер для кожного URL береться дата ОСТАННЬОГО РЕАЛЬНОГО КОМІТУ,
// що торкнувся САМЕ ЦЬОГО файлу (git log -1 --format=%cs -- <файл>).
// Це працює коректно навіть при масовому "git add ." в CI-workflow,
// бо git порівнює вміст файлу, а не сам факт наявності в архіві —
// файл, що не змінився побайтово, у комміт не потрапляє.
//
// Вимога: крок checkout у workflow повинен мати fetch-depth: 0
// (повна історія). У поточному unzip-and-update.yml це вже так.
//
// Фолбек: якщо git недоступний (напр. локальний `astro dev` без
// репозиторію) або файл ще не закомічений — використовується
// дата білду, щоб sitemap ніколи не ламався і не падав.
// ============================================================

import { execSync } from 'node:child_process';
import { getCollection } from 'astro:content';
import { SITE_CANONICAL } from '../config';

// Сторінки, які НІКОЛИ не повинні потрапляти в sitemap
const EXCLUDED_NAMES = ['admin_509'];

// Фолбек-дата — використовується ТІЛЬКИ якщо git-дату отримати не вдалося
const FALLBACK_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Кеш, щоб не викликати git log двічі для одного файлу
const gitDateCache = new Map<string, string>();

// Повертає дату останнього коміту, що торкнувся конкретного файлу.
// filePath — шлях від кореня репозиторію, напр. 'src/pages/kontakty.astro'
function getLastModDate(filePath: string): string {
  if (gitDateCache.has(filePath)) return gitDateCache.get(filePath)!;

  let result = FALLBACK_DATE;
  try {
    const out = execSync(`git log -1 --format=%cs -- "${filePath}"`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) result = out; // якщо файл ще не закомічений — out буде порожній, лишаємо фолбек
  } catch {
    // git недоступний (немає репозиторію, немає бінарника тощо) — тихо йдемо на фолбек
  }

  gitDateCache.set(filePath, result);
  return result;
}

// Витягує «чисті» шляхи (без .astro та без квадратних дужок)
// зі списку ключів, які повертає import.meta.glob, і одразу
// повертає пару [url-шлях, реальний файловий шлях для git]
function extractPathsWithFiles(
  globEntries: Record<string, unknown>,
  prefix: string,
  fileDirPrefix: string,
): { urlPath: string; filePath: string }[] {
  return Object.keys(globEntries)
    .map((filePath) => {
      // filePath виглядає як './kontakty.astro' або './posluhy-ta-produktsiia/hrshch.astro'
      const relative = filePath.replace(/^\.\//, '');
      const fileName = relative.split('/').pop()!.replace(/\.astro$/, '');

      if (fileName.startsWith('[')) return null; // динамічний роут — пропускаємо
      if (EXCLUDED_NAMES.includes(fileName)) return null;

      const urlPath = fileName === 'index'
        ? prefix
        : (prefix ? `${prefix}/${fileName}` : fileName);

      const realFilePath = `${fileDirPrefix}/${relative}`.replace(/\/\.\//g, '/');

      return { urlPath, filePath: realFilePath };
    })
    .filter((entry): entry is { urlPath: string; filePath: string } => entry !== null);
}

export async function GET() {
  // 1. Сторінки верхнього рівня: src/pages/*.astro
  const topLevelPages = import.meta.glob('./*.astro');
  const topLevelEntries = extractPathsWithFiles(topLevelPages, '', 'src/pages');

  // 2. Сторінки продукції: src/pages/posluhy-ta-produktsiia/*.astro
  const productPages = import.meta.glob('./posluhy-ta-produktsiia/*.astro');
  const productEntries = extractPathsWithFiles(productPages, 'posluhy-ta-produktsiia', 'src/pages');

  // 3. Розділ «Виконані роботи» — корінь (index.astro) + картки з Content Collection
  const workIndexPages = import.meta.glob('./vykonani-roboty/index.astro');
  const workIndexEntries = extractPathsWithFiles(workIndexPages, 'vykonani-roboty', 'src/pages');

  const works = await getCollection('vykonani-roboty');
  const workEntries = works.map((work) => ({
    urlPath: `vykonani-roboty/${work.slug}`,
    filePath: `src/content/vykonani-roboty/${work.id}`, // work.id — це ім'я файлу з розширенням
  }));

  // 4. Русскоязычные страницы /ru/
  const ruPages = import.meta.glob('./ru/**/*.astro');
  const ruEntries = Object.keys(ruPages)
    .map((filePath) => {
      // filePath: './ru/index.astro' або './ru/posluhy-ta-produktsiia/hrshch.astro'
      const relative = filePath.replace(/^\.\//, '');
      const parts = relative.replace(/\.astro$/, '').split('/');
      const last = parts[parts.length - 1];
      if (last.startsWith('[')) return null;
      if (EXCLUDED_NAMES.includes(last)) return null;

      const urlParts = [...parts];
      if (last === 'index') urlParts.pop();

      return {
        urlPath: urlParts.join('/'),
        filePath: `src/pages/${relative}`,
      };
    })
    .filter((entry): entry is { urlPath: string; filePath: string } => entry !== null);

  const allEntries = [
    ...topLevelEntries,
    ...productEntries,
    ...workIndexEntries,
    ...workEntries,
    ...ruEntries,
  ];

  // Прибираємо можливі дублікати за urlPath (лишаємо перше входження)
  const seen = new Set<string>();
  const uniqueEntries = allEntries.filter((entry) => {
    if (seen.has(entry.urlPath)) return false;
    seen.add(entry.urlPath);
    return true;
  });

  const urlObjects = uniqueEntries.map(({ urlPath, filePath }) => {
    const clean = urlPath.replace(/^\/+|\/+$/g, '');
    const loc = clean ? `${SITE_CANONICAL}/${clean}/` : `${SITE_CANONICAL}/`;
    const lastmod = getLastModDate(filePath);
    return { loc, lastmod };
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlObjects.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=UTF-8' },
  });
}
