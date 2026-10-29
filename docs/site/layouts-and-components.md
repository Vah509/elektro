# Layouts и компоненты

Сверено с кодом `src/layouts/` и `src/components/`, 2026-10-28.

Иерархия: `Страница.astro` → (`ProductLayout`) → `BaseLayout` → `Header` / `<slot/>` / `Footer`.
Для непродуктовых страниц (`index`, `kontakty`, `pro-nas`, хабы, `elektromontazh`, каталог и карточки портфолио, `ru/vykonani-roboty`) используется `BaseLayout` напрямую. Исключение: `admin_509.astro` — самостоятельный HTML.

---

## 1. BaseLayout (`src/layouts/BaseLayout.astro`)

Один layout на весь сайт. Принимает единственный проп `page`.

### Поля `page`

| Поле | Тип | Обяз. | Описание |
|---|---|---|---|
| `section` | string | ✅ | `activePage` для Header: `produktsiia` / `posluhy` / `vykonani-roboty` / `pro-nas` / `kontakty` / `''` (главная) |
| `title` | string | ✅ | `<title>`, также og/twitter title. ≤ 60 символов |
| `description` | string | ✅ | meta, og, twitter. Ориентир 150–160 |
| `canonical` | string | ✅ | полный URL с `/` на конце, через `SITE_CANONICAL` |
| `crumbs` | `{label, href?}[]` | ✅ | `[]` — крошки не рисуются. Последний элемент (текущая страница) без `href` |
| `lang` | `'uk'\|'ru'` | ❌ | по умолчанию `uk`. Влияет на `<html lang>`, og:locale (`uk_UA`/`ru_UA`), тексты Header/Footer/крошек |
| `altUrl` | string | ❌ | путь (`/ru/...` или `/...`) той же страницы на другом языке. Если передан — hreflang-теги (uk, ru, x-default) и переключатель УКР/РУС в шапке |
| `ogType` | `'website'\|'article'` | ❌ | по умолчанию `website`; карточки портфолио — `article` |
| `verifyMeta` | `{name, content}[]` | ❌ | мета верификации (Search Console и т. п.) |
| `styles` | string[] | ❌ | имена файлов из `public/css/` без `.css`; вшиваются inline после `main.css` в указанном порядке. Неизвестное имя = ошибка сборки |

### Что BaseLayout делает сам
- `<head>`: meta, canonical, hreflang, Open Graph, Twitter Card, favicon (svg/ico/apple-touch), `verifyMeta`, GTM (если `GTM_ID`), Clarity (если `CLARITY_ID`), `@font-face` inline (без preload), `main.css` inline, `page.styles` inline, затем `<slot name="head"/>`.
- `<body>`: GTM noscript, `<Header>`, крошки (визуальные, без microdata), `<slot/>`, `<Footer>`.
- JSON-LD: LocalBusiness (контакты из config, часы пн–пт 9–17) и BreadcrumbList (из `crumbs`).
- В `<slot name="head">` страница может положить собственные `<style slot="head">` (используют хаб, `elektromontazh`, каталог) — они идут ПОСЛЕ `page.styles`.
- Скрипты `em-site.js` страница подключает сама (`<script is:inline src="/js/em-site.js">` в конце); в ProductLayout это уже сделано.

### Пример страницы (не продукт)
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE_CANONICAL } from '../config';
const page = {
  lang: 'uk' as const,
  altUrl: '/ru/pro-nas/',
  section: 'pro-nas',
  title: '...',
  description: '...',
  canonical: `${SITE_CANONICAL}/pro-nas/`,
  crumbs: [{ label: 'Головна', href: '/' }, { label: 'Про нас' }],
  styles: ['em-hrshch', 'em-pro-nas'],
};
---
<BaseLayout {page}> ... </BaseLayout>
```

---

## 2. ProductLayout (`src/layouts/ProductLayout.astro`)

Шаблон 8 продуктовых страниц (UA и RU = 16 файлов). Страница передаёт только данные; разметку строит layout. Сам добавляет `em-hrshch` в `page.styles`, подключает `Lightbox` и `em-site.js`.
Не используют: `elektromontazh` (UA/RU) — другая структура.

### Порядок блоков и фоны (суровое правило: зелёный ↔ белый, без исключений)
```
1  Hero             зелёный  .em-hero-product  (текст + коллаж 2×2 из 4 фото)
2  Галерея          белый    .em-section       (1 большое + 7 малых = 8)
3  Применение       зелёный  .em-section-alt   (objects, 6 карточек)
   [extra1]         белый    — слот страницы (класс em-section задаёт сама страница)
   [extra2]         зелёный  — слот страницы (em-section-alt + em-section-alt-inner)
5  Характеристики   белый    specs-таблица
6  Компоненты       зелёный  brands (если не передан — вместо блока <hr class="em-divider">)
7  Как работаем     белый    steps (5 шагов, нумерация 01..05 автоматическая)
8  Преимущества     зелёный  why (6 карточек)
9  FAQ              белый    FaqAccordion
10 ContactBlock     зелёный
11 AlsoMake         белый
```
Если из-за слотов/отсутствия brands подряд окажутся два блока одного цвета — ставится `<hr class="em-divider">`.

### Пропсы
| Пропс | Обяз. | Содержимое |
|---|---|---|
| `page` | ✅ | как в BaseLayout (+ `lang`, `altUrl`); `styles` не нужен |
| `slug` | ✅ | slug продукта → `AlsoMake.currentSlug` |
| `hero` | ✅ | `{ tag, h1, lead, badges: string[] (HTML-строки <strong>…</strong> — …), collage: [{src, alt}] × 4 }` |
| `gallery` | ✅ | `{ h2, items: [{src, alt, caption, large?}] × 8 }`, `large: true` у первого |
| `objects` | ✅ | `{ label, h2, lead?, cards: [{num:'01', title, text}] × 6 }` |
| `specs` | ✅ | `{ h2, rows: [{label, value}] }` |
| `brands` | ❌ | `{ main: string[], eco: string[] }`; у `plk` не передаётся |
| `steps` | ✅ | `{ h2, items: [{title, text}] × 5 }` |
| `why` | ✅ | `{ h2, cards: [{title, text}] × 6 }` |
| `faq` | ✅ | `{ sectionTitle, items: [{q, a}] }` |
| `contactTitle` | ✅ | заголовок ContactBlock («Готові обговорити ваше замовлення — …») |

Слоты: `head` (доп. `<style>`/meta), `extra1` (белый), `extra2` (зелёный).
Кто использует слоты: `dymovydalennia`, `dvyhuny` — `extra1`; `plk` — `extra1` + `extra2` (UA и RU одинаково).

Строки интерфейса (кнопки «Замовити…», «Де застосовується», «Характеристики», «Компоненти…» и т. д.) ProductLayout выбирает по `page.lang` (`uk`/`ru`) — переводить их в страницах не нужно.
Коллаж: первые 2 фото `loading=eager`, первое с `fetchpriority=high`; остальные `lazy`. Галерея — все `lazy`. У коллажа `Photo` вызывается с `full` (на `<img>` ставится `data-full`), у галереи `data-full` лежит на обёртке `.em-gallery-item`.
Подробнее про размеры/WebP — `photos-pipeline.md`.

### Пример без extra-слотов
```astro
---
import ProductLayout from '../../layouts/ProductLayout.astro';
import { SITE_CANONICAL } from '../../config';
const page = { lang:'uk' as const, altUrl:'/ru/uslugi-i-produktsiya/shuz/', section:'produktsiia', title:'…', description:'…',
  canonical:`${SITE_CANONICAL}/posluhy-ta-produktsiia/shuz/`,
  crumbs:[{label:'Головна',href:'/'},{label:'Продукція',href:'/posluhy-ta-produktsiia/'},{label:'Щити керування засувками (ШУЗ)'}] };
const hero = {…}; const gallery = {…}; /* objects, specs, brands, steps, why, faq */
---
<ProductLayout {page} slug="shuz" {hero} {gallery} {objects} {specs} {brands} {steps} {why} {faq}
  contactTitle="Готові обговорити ваше замовлення — ШУЗ" />
```
С extra: `<section slot="extra1" class="em-section">…</section>`, `<div slot="extra2" class="em-section-alt"><div class="em-section-alt-inner">…</div></div>`.

---

## 3. Общие компоненты

| Компонент | Пропсы | Заметки |
|---|---|---|
| `Header.astro` | `activePage`, `lang` (`uk`/`ru`), `altUrl` | Меню «Продукція» (7 пунктов) и «Послуги» (plk, elektromontazh) — массивы `menuProducts`/`menuServices` внутри файла, URL для UK и RU. Телефон/CTA `#kontakty-blok`. Переключатель языка только при `altUrl`. Логотип «Збірка / електрощитів» |
| `Footer.astro` | `lang` | «© 2026 Elektroschit — виробництво електрощитів, Київ та область» (RU-вариант тоже). Телефон и email из config |
| `ContactBlock.astro` | `title?`, `lang` | `id="kontakty-blok"` (якорь для всех CTA), зелёный фон. Всё из config; для RU — `ADDRESS_RU`, `WORK_HOURS_RU` |
| `FaqAccordion.astro` | `items:{q,a}[]`, `sectionTitle?`, `lang` | белый фон, добавляет JSON-LD FAQPage. Ответ `a` — простой текст (без HTML) |
| `AlsoMake.astro` | `currentSlug`, `lang` | Все продукты кроме текущего; список и таблица RU-slug-ов `ruSlugs` — внутри файла. Пустой `currentSlug=""` на каталоге и карточках — показать все 9 |
| `Lightbox.astro` | — | разметка оверлея (`.em-lightbox`); логика в `em-site.js` / `em-work-lightbox.js` |
| `Photo.astro` | `src`, `alt`, `sizes` (обяз.), `widths?` (`[480,800,1200]`), `loading?` (`lazy`), `fetchpriority?`, `class?`, `full?` | единственный способ вывести фото; `src` — строка `/images/<папка>/<файл>.jpg` |

### Компоненты карточек портфолио
| Компонент | Пропсы | Фон |
|---|---|---|
| `WorkPhotos` | `photos: {src, caption}[]`, `title` | главное фото (eager + high priority, `sizes (max-width:900px) 100vw, 800px`) + миниатюры (240/480); клик по миниатюре подменяет главное фото на WebP до 1200 px и убирает `srcset`; клик по главному — лайтбокс |
| `WorkDescription` | `title`, `types`, `tags`, `properties` + `<slot/>` (тело из Markdown) | выводит теги/types, H1 (`title`), properties, текст |
| `WorkSpecs` | `specs: {label,value}[]` | зелёный; если пусто — блок не выводится |
| `WorkBrands` | `brands: string[]` | белый; простые «пилюли» без групп основные/эконом; если пусто — не выводится |
| `WorkSimilar` | `relatedTop`, `moreWorks` (готовые списки), `currentTypeLabel?` | зелёный; чисто отображение, фото через `Photo` (480/800, lazy) |

Каталог `vykonani-roboty/index.astro` использует `Photo` напрямую (ширины 480/800; первые 3 карточки `eager`, остальные `lazy`).
Скрытие карточек 16+: в HTML у карточек с индексом ≥ 15 стоит `style="display:none"`, JS (`render()` в index.astro) показывает по 15 на страницу (`PER_PAGE = 15`), фильтры по type/tag и параметры `?type=` / `?tag=`.

### «Схожие работы» (`src/utils/similarWorksGraph.ts`)
Считается ОДИН раз на сборку в `getStaticPaths()` карточки:
- Ряд 1 (`relatedTop`, 4 карточки): очки = 2 за каждый общий type + 1 за каждый общий tag; ничья — новее; если не хватает — добор по общему type (fallback).
- Ряд 2 (`moreWorks`, 4 карточки): остальные карточки; приоритет — у кого меньше входящих ссылок (защита от «сирот»), затем новее. Обработка идёт от старых карточек к новым с обновлением счётчика.
- Параметры: `row1Count`, `row2Count`, `typeWeight`, `tagWeight`, `fallbackToSameType` (задаются в `[slug].astro`).

---

## 4. JS

| Файл | Что делает |
|---|---|
| `public/js/em-site.js` (защищён от удаления в `ai-deletes`) | бургер-меню, FAQ-аккордеон (одновременно открыт один), раскрывашки мобильного меню, лайтбокс (←/→, свайп, цикл): собирает `.em-gallery-item[data-full]` и `.em-hero-collage-item img[data-full]`; кнопка «Вгору». Всё внутри `DOMContentLoaded`, поэтому `defer` не нужен |
| `public/js/em-work-lightbox.js` | лайтбокс карточки портфолио: `window.emOpenWorkLightbox(photos, idx)`; массив `photos` приходит из inline-скрипта `WorkPhotos` (WebP 1200) |

---

*elektroschit.com.ua | docs/site/layouts-and-components.md | 2026-10-28*
