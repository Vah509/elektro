# Архитектура сайта — elektroschit.com.ua

Проверено по коду репозитория `Vah509/elektro` (ветка `main`), 2026-10-28. Это источник правды о том, «что где лежит».
Язык общения в чатах: русский. Язык сайта: украинский (+ раздел `/ru/`). Любой текст для посетителя пишется на языке страницы.

---

## 1. О компании (для текстов)

- Производство силовых электрощитов и щитов управления на заказ. Опыт с 1999 года («25 лет»).
- Силовые щиты ГРЩ/ВРЩ до 630 А. Щиты управления: насосы, вентиляция, двигатели, задвижки (ШУЗ), АВР, КРМ, дымоудаление, зенитные фонари, агро.
- Комплектующие основные: ETI, Hager, Schneider Electric, Eaton. Эконом: E-Next, Asko, Chint.
- Гарантия 12 месяцев, срок от 2 недель. Киев, Киевская область, вся Украина.
- Контакты — только из `src/config.ts` (см. п. 4). НЕ целевая аудитория: жильё, квартиры, коттеджи.

## 2. Стек и инфраструктура

| Что | Как |
|---|---|
| Фреймворк | Astro (`package.json`: `^4.15.0`, установлено 4.16.19), `output: 'static'`, без интеграций (`astro.config.mjs` — 4 строки) |
| Хостинг | Cloudflare Pages (автодеплой при push в `main`; команда сборки — стандартная `npm run build`, настройки проверять в панели Cloudflare) |
| Репозиторий | GitHub `Vah509/elektro`, основная ветка `main` |
| Доставка изменений | ZIP через GitHub UI в `ai-updates/` → GitHub Actions (подробно: `deploy-and-sitemap.md`) |
| Удаление файлов | список `.txt` в `ai-deletes/` → GitHub Actions (подробно: `deploy-and-sitemap.md`) |
| Фото | `astro:assets` + `sharp` (WebP q78), оригиналы в `src/assets/images/` (подробно: `photos-pipeline.md`) |
| CSS | собственная система, префикс `em-`, файлы в `public/css/`, вшиваются inline в `<head>` на этапе сборки |
| JS | ванильный, `public/js/em-site.js` и `public/js/em-work-lightbox.js` |
| Шрифты | self-host в `public/fonts/` (Geologica 700 — заголовки, Manrope 400–600 — текст), `font-display: swap`, БЕЗ `preload` (preload ухудшал LCP) |
| Sitemap | собственный `src/pages/sitemap.xml.ts` (пакет `@astrojs/sitemap` не используется: падал на динамическом роуте) |
| Аналитика | GTM `GTM-PZSRTZ2T`, GA4 `G-BQR848YQKK` (см. `marketing/gtm-ga4-tags.md`); Clarity не подключён (`CLARITY_ID = ''`) |
| Node в Actions | 20; `npm install` перед скриптами |

Особенности репозитория (не чинить без отдельного решения владельца):
- В git лежат `node_modules/` (~9 900 файлов) и `dist/` (~380 файлов), `.gitignore` нет. При сверке и `git status` их игнорировать.
- `sharp` в `package.json` не объявлен: приходит транзитивно с Astro; скрипты деплоя импортируют его напрямую.
- В `dependencies` есть `playwright-core` — в коде сайта и скриптов деплоя не используется (вероятно, остаток от локальных замеров).
- Страница 404 — только `public/404.html` (Cloudflare берёт её из сборки). Корневой `404.html` и компонент `Breadcrumbs.astro` удалены при чистке репозитория 2026-10-28.

## 3. Дерево репозитория («где что лежит»)

```
.github/workflows/
  unzip-and-update.yml     — обработка ZIP из ai-updates/ (push на ai-updates/**.zip)
  delete-files.yml         — обработка списков из ai-deletes/ (push на ai-deletes/*.txt)
  audit-contacts.yml       — ручной (workflow_dispatch) поиск старых контактов в src/ (legacy)
ai-updates/                — сюда загружается ZIP (скрипт удаляет его после обработки). (служебный `backups/backup-rollback.zip` удалён при чистке)
ai-deletes/                — сюда загружается .txt со списком файлов на удаление
docs/                      — документация (этот каталог)
scripts/
  process-update.js        — оркестратор ZIP-обновления
  process-deletes.js       — удаление по списку
  lib/                     — read-archive, lastmod, staging, optimize-photos, test-build, send-telegram
public/                    — отдаётся как есть
  css/ em-home em-hrshch em-kontakty em-pro-nas em-work main
  js/  em-site.js em-work-lightbox.js
  fonts/  favicon.* apple-touch-icon.png icon-192.png  robots.txt  404.html
  images/og-default.jpg    — ЕДИНСТВЕННОЕ фото в public/ (og:image)
src/
  assets/images/<папка>/   — ВСЕ фото сайта (оригиналы .jpg), см. photos-pipeline.md
  components/              — Header, Footer, FaqAccordion, AlsoMake, ContactBlock, Lightbox,
                             Photo, WorkPhotos, WorkDescription, WorkSpecs, WorkBrands, WorkSimilar
  config.ts                — контакты, домены, GTM/Clarity
  content/config.ts        — схема коллекции «Виконані роботи»
  content/vykonani-roboty/ — карточки портфолио (*.md), сейчас 39
  data/tags-registry.ts    — допустимые types / tags / properties (источник правды)
  data/lastmod-map.json    — даты для sitemap (пишет скрипт, руками не править)
  layouts/                 — BaseLayout, ProductLayout
  pages/                   — страницы (см. п. 5)
  utils/photo.ts           — поиск фото по строке-пути
  utils/similarWorksGraph.ts — граф «Схожих работ»
README.md (указатель на docs/), package.json, package-lock.json, astro.config.mjs
```

Папки с фото в `src/assets/images/` (323 файла): `home`(12), `hrshch`(12), `dymovydalennia`(14), `dvyhuny`(12), `shuz`(12), `krm`(12), `zenitni-lihtari`(12), `ahro`(12), `plk`(12), `vykonani-roboty/<slug>/`(213 в 39 папках).

## 4. `src/config.ts` — единственное место контактов и доменов

| Константа | Значение (на 2026-10-28) | Для чего |
|---|---|---|
| `SITE_CANONICAL` | `https://elektroschit.com.ua` | canonical, og, sitemap, JSON-LD |
| `SITE_PREVIEW` | `https://elektro-4a1.pages.dev` | служебный (pages.dev); больше нигде не используется в ссылках |
| `GITHUB_CONTENT_BASE` | `https://github.com/Vah509/elektro/edit/main/src/content/vykonani-roboty` | кнопки «редактировать» в `admin_509` |
| `PHONE` / `PHONE_DISPLAY` | `+380981527555` / `+38 (098) 152-75-55` | `tel:` и отображение |
| `EMAIL` | `elektroschit.info@gmail.com` | `mailto:` |
| `ADDRESS` / `ADDRESS_RU` | `Київ, вул. Печенізька, 35/43, оф. 168` / `Киев, ул. Печенежская, 35/43, оф. 168` | ContactBlock, kontakty |
| `ADDRESS_STREET`, `ADDRESS_CITY` | `вул. Печенізька, 35/43, оф. 168`, `Київ` | JSON-LD LocalBusiness |
| `MAPS_URL` | Google Maps search по адресу | ссылка «на карте» |
| `VIBER` | `viber://chat?number=%2B380733058694` | отдельный номер Viber (намеренно отличается от основного телефона; подтверждено владельцем) |
| `TELEGRAM` / `WHATSAPP` | `https://t.me/+380981527555` / `https://wa.me/380981527555` | мессенджеры |
| `WORK_HOURS` / `WORK_HOURS_RU` | `робочі дні з 9:00 до 17:00` / `рабочие дни с 9:00 до 17:00` | ContactBlock |
| `GTM_ID` / `CLARITY_ID` | `GTM-PZSRTZ2T` / `''` | пустая строка = скрипт не вставляется |

**Правило без исключений:** телефон, email, адрес, домен, мессенджеры в `tel:`/`mailto:`/canonical/ссылках — только через импорт из `config.ts`. Допустим «живой» текст в meta-description.
Пути импорта: из `src/components` и `src/layouts` → `'../config'`; из `src/pages/*.astro` → `'../config'`; из `src/pages/<папка>/*.astro` → `'../../config'`; из `src/pages/ru/<папка>/*.astro` → `'../../../config'`.

## 5. Карта страниц и URL

Trailing slash во всех canonical обязателен. Astro генерирует `/<путь>/index.html`.

### Украинская версия
| Файл | URL | Layout | `page.section` |
|---|---|---|---|
| `pages/index.astro` | `/` | BaseLayout | `''` |
| `pages/kontakty.astro` | `/kontakty/` | BaseLayout | `kontakty` |
| `pages/pro-nas.astro` | `/pro-nas/` | BaseLayout | `pro-nas` |
| `pages/posluhy-ta-produktsiia/index.astro` | `/posluhy-ta-produktsiia/` (хаб) | BaseLayout | `produktsiia` |
| `pages/posluhy-ta-produktsiia/<slug>.astro` (8 шт.) | `/posluhy-ta-produktsiia/<slug>/` | ProductLayout | `produktsiia`; для `plk` — `posluhy` |
| `pages/posluhy-ta-produktsiia/elektromontazh.astro` | `/posluhy-ta-produktsiia/elektromontazh/` | BaseLayout (свой hero, без галереи) | `posluhy` |
| `pages/vykonani-roboty/index.astro` | `/vykonani-roboty/` (каталог) | BaseLayout | `vykonani-roboty` |
| `pages/vykonani-roboty/[slug].astro` | `/vykonani-roboty/<slug>/` (карточки) | BaseLayout | `vykonani-roboty` |
| `pages/admin_509.astro` | `/admin_509/` | НЕ использует BaseLayout (свой HTML, `noindex`, Google Fonts). За Cloudflare Access. Нет в sitemap, закрыт в robots.txt | — |
| `pages/sitemap.xml.ts` | `/sitemap.xml` | служебный эндпоинт | — |

Продуктовые slug-и (8 на ProductLayout): `hrshch`, `dymovydalennia`, `dvyhuny`, `shuz`, `krm`, `zenitni-lihtari`, `ahro`, `plk`; девятый — `elektromontazh`.
Меню «Продукція» = hrshch, dymovydalennia, dvyhuny, shuz, krm, zenitni-lihtari, ahro. Меню «Послуги» = plk, elektromontazh.

### Русская версия — см. `ru-section.md`.

## 6. Страницы, где продукты перечислены вручную

Новый продукт = править ВСЕ эти места (подробно: `page-creation-guide.md`): `components/AlsoMake.astro`, `components/Header.astro` (UA и RU меню), `pages/index.astro`, `pages/ru/index.astro`, `pages/posluhy-ta-produktsiia/index.astro` (хаб), `pages/ru/uslugi-i-produktsiya/index.astro`, при необходимости `data/tags-registry.ts` (TYPE_LABELS) и таблица `Product Slug` в GTM.

## 7. CSS: что и где подключается

`BaseLayout` всегда вставляет inline `main.css` (31 КБ: переменные, база, шапка, футер, кнопки, секции, лайтбокс, контактный блок), затем inline файлы из `page.styles` (имена без `.css`, порядок = порядок в `<head>`), затем содержимое `<slot name="head">`.
Неизвестное имя в `styles` = ошибка сборки (защита от потери стилей).

| Файл | Кто подключает |
|---|---|
| `em-hrshch.css` (12 КБ: hero, галерея, объекты, specs, бренды, шаги, why, FAQ, контакты, AlsoMake) | ProductLayout автоматически; `index`, `ru/index`, `pro-nas`(UA/RU), хаб (UA/RU), `elektromontazh`(UA/RU), `vykonani-roboty/index`, `[slug]` — явно в `styles` |
| `em-home.css` | `index`, `ru/index` |
| `em-pro-nas.css` | `pro-nas` (UA/RU) |
| `em-kontakty.css` | `kontakty` (UA/RU) |
| `em-work.css` | каталог и карточки портфолио |

Переменные (`main.css :root`): `--c-accent #0f5c30`, `--c-accent-hover`, `--c-accent-faint`, `--c-accent-border`, `--c-accent-mid`, `--c-bg #fff`, `--c-bg2 #f2f7f4`, `--c-panel`, `--c-text`, `--c-head`, `--c-muted`, `--c-divider`, `--radius 12px`, `--radius-sm 8px`, `--radius-xs 6px`, `--ff` (Geologica), `--ff-body` (Manrope), `--shadow-*`, `--transition`, `--header-h 64px`.
Брейкпоинты: десктоп ≥ 900 px, планшет 600–899, мобильный < 600.
Правило: scoped-стили Astro (`<style>` без `is:global`) не действуют на `<img>`, который рисует дочерний компонент (`Photo`) — для таких случаев используется `:global(...)`.

## 8. SEO-стандарты

- `title` ≤ 60 символов; шаблон `Виготовлення [название] на замовлення — [ампераж/особенность] | elektroschit.com.ua` (на практике многие страницы короче).
- `description` 150–160 символов (на практике в текущем коде у большинства страниц 120–145; ориентир, а не блокер).
- H1: для продуктов начинается с «Виготовлення» (для ПЛК — «Програмування»); один H1 на страницу.
- `canonical` — всегда через `SITE_CANONICAL`, с завершающим `/`.
- JSON-LD (BaseLayout): LocalBusiness + BreadcrumbList (из `page.crumbs`); FaqAccordion добавляет FAQPage. Крошки на странице рисует BaseLayout.
- hreflang генерируется автоматически, если передан `page.altUrl` (`ru-section.md`).
- `og:image` везде `public/images/og-default.jpg` (1200×630).

---
*elektroschit.com.ua | docs/site/architecture.md | 2026-10-28 | сверено с кодом*
