# Руководство: как создаются страницы

Главный рабочий документ для чата, который делает страницы. Сверено с кодом 2026-10-28.
Общие правила: обсудить структуру → получить явное подтверждение → собрать ZIP (без корневой папки, repo-relative пути, ≤ 2 МБ; подробно в `deploy-and-sitemap.md`).

Типы страниц и что использовать:

| Тип | Layout | Раздел этого документа |
|---|---|---|
| Новая продуктовая страница (щит, услуга с галереей) | `ProductLayout` | A |
| Обычная страница (о компании, контакты, хаб, спец-страница) | `BaseLayout` | B |
| RU-версия любой страницы | тот же layout | C (+ `ru-section.md`) |
| Карточка портфолио | `[slug].astro` (шаблон) + `.md` | D (+ `portfolio/card-creation-rules.md`) |

---

## A. Новая продуктовая страница (ProductLayout)

### A1. Решить и зафиксировать
1. **slug** (латиница, дефисы, как у существующих: `hrshch`, `dymovydalennia`, `dvyhuny`, `shuz`, `krm`, `zenitni-lihtari`, `ahro`, `plk`; `elektromontazh` — не на ProductLayout).
2. **URL:** `/posluhy-ta-produktsiia/<slug>/`. **Файл:** `src/pages/posluhy-ta-produktsiia/<slug>.astro`.
3. **RU-slug** и RU-файл `src/pages/ru/uslugi-i-produktsiya/<ru-slug>.astro` (транслитерация русского названия, `ru-section.md`).
4. **`page.section`:** `produktsiia` (меню «Продукція»); `posluhy` — для программирования/монтажа (меню «Послуги», как `plk`, `elektromontazh`). Выбор решает, в какое подменю шапки попадёт страница и какая вкладка подсветится.
5. **Папка фото** `src/assets/images/<slug>/` (если папки нет — создаётся ZIP-ом) и **тип портфолио** (совпадает ли slug с ключом `TYPE_LABELS`; если нужен новый type — отдельная правка `tags-registry.ts`).

### A2. Объект `page` (обязательные поля)
```js
const page = {
  lang: 'uk' as const,
  altUrl: '/ru/uslugi-i-produktsiya/<ru-slug>/',        // обязателен, если делаем RU-версию
  section: 'produktsiia',
  title: 'Виготовлення … на замовлення | elektroschit.com.ua',   // ≤ 60 симв.
  description: '…',                                      // ориентир 150–160 симв.
  canonical: `${SITE_CANONICAL}/posluhy-ta-produktsiia/<slug>/`, // всегда через SITE_CANONICAL, со слешем в конце
  crumbs: [
    { label: 'Головна',   href: '/' },
    { label: 'Продукція', href: '/posluhy-ta-produktsiia/' },
    { label: 'Короткое название' },                      // последний — без href
  ],
};
```
`styles` НЕ указывать — `em-hrshch` добавит ProductLayout. Импорты: `SITE_CANONICAL` из `'../../config'`, `ProductLayout` из `'../../layouts/ProductLayout.astro'`.

### A3. Данные блоков (количество — по фактическому коду существующих страниц)
| Объект | Что | Сколько | Примечание |
|---|---|---|---|
| `hero` | `tag` («Виготовлення · Київ та область»), `h1`, `lead`, `badges`, `collage` | **4 фото** в коллаже | H1 начинается с «Виготовлення» (у ПЛК — «Програмування»). `badges` — HTML-строки `'<strong>від 2 тижнів</strong> — виготовлення'`; обычно 4: срок/параметр, 12 міс. гарантія, 25 років досвід |
| `gallery` | `h2`, `items` | **8 фото**: 1 `large: true` (первое) + 7 малых | у каждого `src`, `alt`, `caption` (caption показывается в лайтбоксе) |
| `objects` | `label`, `h2`, `lead?`, `cards` | **6** (у `dymovydalennia` — 5) | `num: '01'…'06'`, `title`, `text` |
| `specs` | `h2`, `rows` | 8–11 строк (у `plk` — 4) | `label`/`value` |
| `brands` | `main[]`, `eco[]` | — | основные: ETI, Hager, Schneider Electric, Eaton; эконом: E-Next, Asko, Chint. Для услуг без оборудования (как `plk`) **не передавать** — вместо блока будет `<hr>` |
| `steps` | `h2`, `items` | **5** | нумерация 01–05 автоматическая |
| `why` | `h2`, `cards` | **6** | `title`, `text` |
| `faq` | `sectionTitle`, `items` | 7 (у `hrshch` — 9) | `a` — простой текст без HTML. Если не заданы клиентом — генерируются по специфике продукта |
| `contactTitle` | строка | — | «Готові обговорити ваше замовлення — [название]» |

### A4. Скелет файла
```astro
---
import { SITE_CANONICAL } from '../../config';
import ProductLayout from '../../layouts/ProductLayout.astro';
const page = {…}; const hero = {…}; const gallery = {…}; const objects = {…};
const specs = {…}; const brands = {…}; const steps = {…}; const why = {…}; const faq = {…};
---
<ProductLayout {page} slug="<slug>" {hero} {gallery} {objects} {specs} {brands} {steps} {why} {faq}
  contactTitle="Готові обговорити ваше замовлення — …" />
```
Дополнительные блоки: `<section slot="extra1" class="em-section">…</section>` (белый, между «Застосування» и «Характеристики») и `<div slot="extra2" class="em-section-alt"><div class="em-section-alt-inner">…</div></div>` (зелёный). Слот может нарушить чередование фонов — после добавления проверить порядок цветов; при двух одинаковых подряд поставить `<hr class="em-divider">`.

### A5. Чередование фонов (строгое правило)
зелёный hero → белый → зелёный → … (порядок и цвета блоков — в `layouts-and-components.md`, п. 2). Страница сама фоны не задаёт, кроме содержимого слотов.

### A6. Фото
- Комплект: **4 коллажа (`-c1…-c4`) + 8 галереи (`-01…-08`) = 12 JPG** в `src/assets/images/<slug>/`.
- Имя: `<тема>-<дескриптор>-kyiv-2026-MM-c1.jpg` / `-01.jpg` (латиница, дефисы). Первое фото галереи — большое.
- В страницах пути — строки `/images/<slug>/<файл>.jpg` (не `src/assets/…`, не `import`).
- Каждый файл ≤ 1,9 МБ; ZIP ≤ 2 МБ → фото по пачкам, код-ZIP **последним**.
- Подробнее: `photos-pipeline.md`.

### A7. Что ОБЯЗАТЕЛЬНО обновить в других файлах при добавлении продукта
| Файл | Что добавить |
|---|---|
| `src/components/AlsoMake.astro` | запись в `allProducts` (slug, UA/RU href, title, desc) и пару в `ruSlugs` |
| `src/components/Header.astro` | пункт в `menuProducts` (или `menuServices`) — и UA-, и RU-ссылка |
| `src/pages/index.astro` и `src/pages/ru/index.astro` | карточка продукта в блоке продуктов главной |
| `src/pages/posluhy-ta-produktsiia/index.astro` и `src/pages/ru/uslugi-i-produktsiya/index.astro` | карточка в хабе (`em-hub-card`) |
| `src/data/tags-registry.ts` | `TYPE_LABELS`, если под продукт будут карточки портфолио (отдельный согласованный ZIP) |
| GTM (панель, не код) | таблица `Product Slug` — добавить пару URL→slug, иначе событие `contact_click` придёт без `product` |
| `docs/` | `docs/changelog.md` + строки в таблицах slug-ов (`architecture.md`, `ru-section.md`) |
Sitemap и `lastmod-map.json` обновляются автоматически; `robots.txt` менять не нужно.

### A8. Чек-лист перед отдачей ZIP
- [ ] slug совпадает во всех местах: имя файла, `canonical`, `slug=` в ProductLayout, `AlsoMake`, `Header`, папка фото.
- [ ] H1 начинается с «Виготовлення» («Програмування» для ПЛК).
- [ ] `title` ≤ 60; `description` ≈ 150–160; canonical через `SITE_CANONICAL` со слешем.
- [ ] `crumbs`: последний без `href`; RU — `/ru/…`.
- [ ] `section` верный (`produktsiia` / `posluhy`); `altUrl` взаимный с RU-страницей.
- [ ] Коллаж ровно 4, галерея ровно 8 (первое `large`), `num` карточек 01…
- [ ] Все пути фото существуют (`/images/<slug>/…jpg` ↔ `src/assets/images/<slug>/…jpg`); только `.jpg`.
- [ ] Контакты не прописаны текстом в ссылках (только через config).
- [ ] Чередование фонов не нарушено (слоты, отсутствие `brands`).
- [ ] RU-версия создана (или осознанно отложена — тогда `altUrl` не ставить на одной стороне).
- [ ] Правки в AlsoMake/Header/главные/хабы внесены (A7), все эти файлы внутри ZIP.
- [ ] Размер ZIP ≤ 2 МБ, порядок загрузки фото → код.
- [ ] После загрузки: пришло 🟢 в Telegram; открыть страницу UA и RU, лайтбокс (коллаж и галерея), FAQ, меню на мобильном.

---

## B. Обычная страница (BaseLayout)

1. Файл в `src/pages/…`, `export`-данных нет; в frontmatter: `import BaseLayout`, `SITE_CANONICAL`, объект `page` (таблица полей — `layouts-and-components.md`).
2. `styles`: добавить нужные CSS (`['em-hrshch']`, `['em-hrshch','em-pro-nas']` и т. д.). Новый CSS — файл в `public/css/em-<имя>.css` + имя в `styles` страницы. Свои мелкие стили — `<style slot="head">`.
3. Контент внутри `<BaseLayout {page}> … </BaseLayout>`; в конце `<script is:inline src="/js/em-site.js"></script>` (меню, FAQ, лайтбокс). Если на странице есть галерея — вставить `<Lightbox />`.
4. Обычно в конце: `<ContactBlock title="…" />` и при необходимости `<AlsoMake currentSlug="" />`.
5. Фото — только через `<Photo src="/images/…" alt sizes … />` (`photos-pipeline.md`); `width/height` Astro проставит сам.
6. Чередование фонов сохранять так же.
7. Sitemap подхватит сам; для верхнеуровневой страницы и крошек — шаблон из `pro-nas.astro`/`kontakty.astro`.

---

## C. RU-версия
См. `ru-section.md`, п. 2 и 4: копия с `lang:'ru'`, `altUrl`, RU-canonical, переводом, RU-slug-ами.

---

## D. Карточка портфолио
Страница не создаётся — карточка это один `.md` + фото. Правила, поля, примеры, YAML-ловушки: `portfolio/card-creation-rules.md`. Список допустимых `types/tags/properties`: `portfolio/tags-registry.md`.

---

## E. Шаблон первого сообщения для нового чата (замена `page-template.md`)

```
Ты — эксперт по веб-разработке (Astro) и B2B-маркетингу для промышленной компании.
Сайт elektroschit.com.ua. Контекст — в docs/ репозитория Vah509/elektro и в файлах Project.
Общаемся по-русски, язык сайта — украинский (+ /ru/).
Порядок: обсуждение → моё явное подтверждение → ZIP.

Задача: создать страницу продукта [НАЗВАНИЕ].
slug: [slug]  ·  RU-slug: [ru-slug]  ·  section: [produktsiia | posluhy]
UA: /posluhy-ta-produktsiia/[slug]/  ·  RU: /ru/uslugi-i-produktsiya/[ru-slug]/
Файлы: src/pages/posluhy-ta-produktsiia/[slug].astro, src/pages/ru/uslugi-i-produktsiya/[ru-slug].astro

Прикладываю: [ZIP актуального кода / не нужен — клонируй репозиторий (только чтение)], [контент MD/HTML], [фото: 4 для коллажа + 8 для галереи]

Данные: H1, Title (≤60), Description (150–160), особенности/характеристики, FAQ («дай свои» или список), бренды (основные/эконом или «без блока»).
Фото в ZIP — по одной папке, ≤ 2 МБ на архив, код-ZIP последним.
Следуй docs/site/page-creation-guide.md (раздел A) и чек-листу A8.
```

---
*elektroschit.com.ua | docs/site/page-creation-guide.md | 2026-10-28*
