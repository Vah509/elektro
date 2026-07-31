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
// lastmod ТЕПЕР БЕРЕТЬСЯ З ГОТОВОЇ КАРТИ src/data/lastmod-map.json,
// А НЕ З ПРЯМОГО git log УСЕРЕДИНІ ЦЬОГО ФАЙЛУ
// ============================================================
// РАНІШЕ (два попередні підходи, обидва замінені):
//  1. lastmod = дата білду для ВСІХ сторінок одразу — вводило Google
//     в оману: сторінка, яку не редагували місяцями, щодня показувала
//     "оновлено сьогодні" тільки тому, що був передеплой.
//  2. Прямий git log -1 усередині ЦЬОГО файлу під час білду на
//     Cloudflare Pages. Технічно працював (Cloudflare клонує з
//     достатньою історією), але мав дві слабкі сторони:
//       - залежав від того, що git-бінарник і повна історія взагалі
//         доступні в оточенні білду Cloudflare — це деталь чужої
//         інфраструктури, яка не гарантована документально і може
//         змінитися без попередження;
//       - для файлів, щойно перенесених з архіву в GitHub Actions
//         (ai-updates/*.zip), git log ще не бачив сьогоднішній
//         коміт на момент старого прорахунку carty дат — це окрема
//         проблема, яку ми вже вирішили на рівні GitHub Actions
//         (див. нижче).
//
// ТЕПЕР: дати рахуються ОДИН РАЗ, у GitHub Actions
// (scripts/lib/lastmod.js, викликається з scripts/process-update.js),
// де є гарантовано повна git-історія (fetch-depth: 0) і де вже
// вирішено питання "файл щойно з архіву, коміту ще нема" — там дата
// примусово підставляється сьогоднішня для файлів зі списку архіву,
// а для решти рахується справжній git log ДО перенесення файлів.
// Результат зберігається у src/data/lastmod-map.json і потрапляє в
// реальний репозиторій одним комітом разом з рештою змін.
//
// Цей файл (sitemap.xml.ts) просто ЧИТАЄ вже готовий JSON — жодних
// звернень до git під час білду на Cloudflare більше не робиться.
// Простіше, швидше, не залежить від деталей чужого середовища білду.
//
// Фолбек: якщо для якогось файлу запису в мапі немає (наприклад,
// файл існував ще до впровадження цього механізму і жодного разу
// не проходив через ai-updates/ відтоді) — використовується дата
// білду, щоб sitemap ніколи не ламався і не падав.
// ============================================================

import { getCollection } from 'astro:content';
import { SITE_CANONICAL } from '../config';
import lastmodMap from '../data/lastmod-map.json';

// Сторінки, які НІКОЛИ не повинні потрапляти в sitemap (за іменем файлу)
const EXCLUDED_NAMES = ['admin_509'];

// Сторінки, які НІКОЛИ не повинні потрапляти в sitemap (за повним urlPath,
// бо ім'я файлу — 'index', як і в усіх інших розділів, тому виключити
// за іменем не можна)
const EXCLUDED_PATHS = ['ru/vykonani-roboty'];

// Фолбек-дата — використовується ТІЛЬКИ якщо для файлу немає запису
// у lastmod-map.json (наприклад, мапа ще не встигла його підхопити)
const FALLBACK_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Повертає дату останнього оновлення файлу з готової карти дат.
// filePath — шлях від кореня репозиторію, напр. 'src/pages/kontakty.astro'
// (той самий формат ключів, що пише scripts/lib/lastmod.js)
function getLastModDate(filePath: string): string {
  const map = lastmodMap as Record<string, string>;
  return map[filePath] ?? FALLBACK_DATE;
}

// Витягує «чисті» шляхи (без .astro та без квадратних дужок)
// зі списку ключів, які повертає import.meta.glob, і одразу
// повертає пару [url-шлях, реальний файловий шлях для пошуку в мапі]
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

  const finalEntries = uniqueEntries.filter(
    (entry) => !EXCLUDED_PATHS.includes(entry.urlPath),
  );

  const urlObjects = finalEntries.map(({ urlPath, filePath }) => {
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
