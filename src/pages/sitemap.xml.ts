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
//
// При додаванні нової сторінки .astro — вона підхоплюється
// автоматично при наступному білді, руками правити нічого не треба.
// Виняток: файли з іменем у квадратних дужках (динамічні роути)
// та admin_509.astro — вони свідомо виключені.
// ============================================================

import { getCollection } from 'astro:content';
import { SITE_CANONICAL } from '../config';

// Сторінки, які НІКОЛИ не повинні потрапляти в sitemap
const EXCLUDED_NAMES = ['admin_509'];

// Витягує «чисті» шляхи (без .astro та без квадратних дужок)
// зі списку ключів, які повертає import.meta.glob
function extractPaths(globEntries: Record<string, unknown>, prefix: string): string[] {
  return Object.keys(globEntries)
    .map((filePath) => {
      // filePath виглядає як './kontakty.astro' або './posluhy-ta-produktsiia/hrshch.astro'
      const fileName = filePath.split('/').pop()!.replace(/\.astro$/, '');

      if (fileName.startsWith('[')) return null; // динамічний роут — пропускаємо
      if (EXCLUDED_NAMES.includes(fileName)) return null;

      if (fileName === 'index') return prefix; // корінь розділу
      return prefix ? `${prefix}/${fileName}` : fileName;
    })
    .filter((path): path is string => path !== null);
}

export async function GET() {
  // 1. Сторінки верхнього рівня: src/pages/*.astro
  const topLevelPages = import.meta.glob('./*.astro');
  const topLevelPaths = extractPaths(topLevelPages, '');

  // 2. Сторінки продукції: src/pages/posluhy-ta-produktsiia/*.astro
  const productPages = import.meta.glob('./posluhy-ta-produktsiia/*.astro');
  const productPaths = extractPaths(productPages, 'posluhy-ta-produktsiia');

  // 3. Розділ «Виконані роботи» — корінь + картки з Content Collection
  const works = await getCollection('vykonani-roboty');
  const workPaths = works.map((work) => `vykonani-roboty/${work.slug}`);

  // 4. Русскоязычные страницы /ru/
  const ruPages = import.meta.glob('./ru/**/*.astro');
  const ruPaths = Object.keys(ruPages)
    .map((filePath) => {
      // filePath: './ru/index.astro' или './ru/posluhy-ta-produktsiia/hrshch.astro'
      const parts = filePath.replace(/^\.\//, '').replace(/\.astro$/, '').split('/');
      const last = parts[parts.length - 1];
      if (last.startsWith('[')) return null;
      if (last === 'index') parts.pop();
      return parts.join('/');
    })
    .filter((p): p is string => p !== null);

  const allPaths = [
    ...topLevelPaths,
    ...productPaths,
    'vykonani-roboty',
    ...workPaths,
    ...ruPaths,
    'ru/vykonani-roboty',
  ];

  // Прибираємо можливі дублікати
  const uniquePaths = Array.from(new Set(allPaths));

  const urls = uniquePaths.map((path) => {
    const clean = path.replace(/^\/+|\/+$/g, '');
    return clean ? `${SITE_CANONICAL}/${clean}/` : `${SITE_CANONICAL}/`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=UTF-8' },
  });
}
