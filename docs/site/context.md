# КОНТЕКСТ — elektroschit.com.ua
> Єдиний консолідований довідник для нового чату. Замінює собою окремі
> context-project.md (x2, дублікат) та context-updates.md.
> Мова сайту: українська. Спілкуємось: російською.
> Актуально станом на: 2026-07-12

---

## ПРО КОМПАНІЮ

- Виробництво силових електрощитів та щитів керування на замовлення
- Силові щити (ГРЩ, ВРЩ): до 630А
- Щити керування: насосами, вентиляцією, двигунами, засувками (ШУЗ), АВР, КРМ
- Досвід з 1999 року (25+ років)
- Компоненти основні: ETI, Hager, Schneider Electric, Eaton
- Компоненти економ: E-Next, Asko, Chint
- Гарантія 12 місяців, терміни від 2 тижнів
- Географія: Київ, Київська область, вся Україна
- Контакти: +38 (098) 152-75-55 | elektroschit.info@gmail.com | Київ, вул. Печенізька, 35/43, оф. 168
- НЕ наша аудиторія: житловий сектор, квартири, котеджі

⚠️ **Помічено, потребує уточнення:** у `Footer.astro` та `BaseLayout.astro` (неактивний файл)
досі стоїть підпис «© 2026 Електромонтаж». Якщо це навмисно (та сама компанія,
просто новий домен) — нормально. Якщо ні — треба поправити на «Елektroschit».

---

## ТЕХНІЧНИЙ СТЕК

| Що | Як |
|---|---|
| Фреймворк | Astro 4.15, `output: 'static'` |
| Хостинг | Cloudflare Pages |
| Репо | GitHub: Vah509/elektro |
| Деплой | Ручне завантаження ZIP через GitHub UI → автодеплой |
| CSS | Кастомна система, префікс `em-`, файли в `public/css/` |
| JS | Ваніла JS, `public/js/em-site.js` |
| Шрифти | Geologica (заголовки 700) + Manrope (текст 400/500/600) |
| Sitemap | Власний `src/pages/sitemap.xml.ts` (БЕЗ пакету `@astrojs/sitemap` — падав з помилкою `reduce` через динамічний роут) |

---

## СТРУКТУРА СТОРІНОК САЙТУ (актуальна, перевірено білдом)

```
src/pages/
  index.astro                          → /
  kontakty.astro                       → /kontakty
  pro-nas.astro                        → /pro-nas
  admin_509.astro                      → /admin_509  (виключено з sitemap і robots.txt)
  sitemap.xml.ts                       → /sitemap.xml (службова, не сторінка)
  posluhy-ta-produktsiia/
    index.astro                        → /posluhy-ta-produktsiia/
    hrshch.astro                       → /posluhy-ta-produktsiia/hrshch    (ЕТАЛОН шаблону)
    dymovydalennia.astro
    dvyhuny.astro
    shuz.astro
    krm.astro
    zenitni-lihtari.astro
    ahro.astro
    plk.astro
    elektromontazh.astro
  vykonani-roboty/
    index.astro                        → /vykonani-roboty/  (каталог з фільтрами)
    [slug].astro                       → /vykonani-roboty/[slug]/  (детальна картка)
```

⚠️ **Важливо:** `src/layouts/BaseLayout.astro` існує в репозиторії, але
**НЕ використовується жодною сторінкою**. Кожна сторінка верстає повний
`<!DOCTYPE html>` самостійно і підключає `Header`/`Footer` напряму.
Усередині BaseLayout — застарілі посилання (`/produktsiia/`, `/posluhy/`),
яких не існує. Рекомендація: видалити файл через `delete.txt`, якщо не
плануєте переходити на нього, щоб він не вводив в оману в майбутньому.

---

## КОМПОНЕНТИ (src/components/) — АКТУАЛЬНИЙ СПИСОК

### Загальні (є на кожній сторінці)

| Файл | Пропси | Призначення |
|---|---|---|
| `Header.astro` | `activePage` ('produktsiia' / 'posluhy' / 'vykonani-roboty' / 'pro-nas' / 'kontakty') | Шапка з навігацією. Імпортує `PHONE`, `PHONE_DISPLAY` з config |
| `Footer.astro` | — | Футер. Імпортує `PHONE`, `PHONE_DISPLAY`, `EMAIL` з config |
| `Breadcrumbs.astro` | `current`, `parentLabel?`, `parentHref?`, `simple?` | Хлібні крихти (schema.org). `simple=true` → 2 рівні (для верхньорівневих сторінок), без — 3 рівні (для підсторінок продукції) |
| `FaqAccordion.astro` | `items: {q,a}[]`, `sectionTitle?` | FAQ акордеон |
| `AlsoMake.astro` | `currentSlug` | Блок «Також виготовляємо» — показує всі продукти крім поточного |
| `ContactBlock.astro` | `title?` | Контакти + месенджери. Імпортує ВСЕ з config (PHONE, EMAIL, ADDRESS, MAPS_URL, VIBER, TELEGRAM, WHATSAPP, WORK_HOURS) |
| `Lightbox.astro` | — | Лайтбокс з листанням ←/→, свайпом, нескінченним циклом |

### Спеціальні для карток «Виконані роботи» (НЕ були задокументовані раніше)

| Файл | Пропси | Призначення |
|---|---|---|
| `WorkPhotos.astro` | `photos: {src, caption}[]`, `title` | Головне фото на всю ширину + мініатюри, підключення до лайтбоксу |
| `WorkDescription.astro` | `title`, `types: string[]`, `tags: string[]`, + slot для тексту опису | Теги + H1 + опис (рендериться через `<Content />` з Markdown) |
| `WorkSpecs.astro` | `specs: {label, value}[]` | Блок технічних характеристик картки |
| `WorkBrands.astro` | `brands: string[]` | Прості пігулки брендів, без поділу на групи основні/економ |
| `WorkSimilar.astro` | `currentSlug`, `types: string[]`, `tags?` | «Схожі роботи» — алгоритм: збіг типу = 2 очки, збіг тегу = 1 очко, топ-3 за датою |

---

## ФАЙЛ КОНФІГУРАЦІЇ — src/config.ts

**Єдине місце для всіх контактів та домену.** При зміні контактів — правити тільки цей файл.
Станом на 2026-07-12 всі значення актуальні і бойові:

```typescript
export const SITE_PREVIEW    = 'https://elektro-4a1.pages.dev';
export const SITE_CANONICAL  = 'https://elektroschit.com.ua';
export const GITHUB_CONTENT_BASE = 'https://github.com/Vah509/elektro/edit/main/src/content/vykonani-roboty';

export const PHONE         = '+380981527555';
export const PHONE_DISPLAY = '+38 (098) 152-75-55';
export const EMAIL         = 'elektroschit.info@gmail.com';
export const ADDRESS       = 'Київ, вул. Печенізька, 35/43, оф. 168';
export const MAPS_URL      = 'https://www.google.com/maps/search/?api=1&query=Київ,+вул.+Печенізька,+35/43';
export const VIBER         = 'viber://chat?number=%2B380981527555';
export const TELEGRAM      = 'https://t.me/+380981527555';
export const WHATSAPP      = 'https://wa.me/380981527555';
export const WORK_HOURS    = 'робочі дні з 9:00 до 17:00';
```

### Правила імпорту (перевірено, працює у всіх файлах):

```astro
// Компоненти (src/components/) → ../config
import { PHONE, PHONE_DISPLAY, EMAIL } from '../config';

// Сторінки верхнього рівня (src/pages/) → ../config
import { SITE_CANONICAL, PHONE, PHONE_DISPLAY } from '../config';

// Сторінки у підпапках (src/pages/posluhy-ta-produktsiia/, vykonani-roboty/) → ../../config
import { SITE_CANONICAL, PHONE, PHONE_DISPLAY } from '../../config';
```

**Правило без винятків:** жодна сторінка чи компонент не повинні містити
телефон/email/адресу/домен прямим текстом у робочих посиланнях (`tel:`,
`mailto:`, `canonical`, месенджери). Виняток — природний текст у
meta-description (описова фраза, не посилання) можна лишати як є.

---

## СХЕМА КОЛЕКЦІЇ «ВИКОНАНІ РОБОТИ» (src/content/config.ts)

```typescript
const vykonaniRoboty = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.number(),                                    // YYMMDDHHMMSS або YYMMDDN
    title: z.string(),
    date: z.date(),
    types: z.array(z.enum(validTypes)).min(1),
    tags: z.array(z.enum(validTags)).default([]),
    properties: z.array(z.enum(validProperties)).default([]),
    description: z.string(),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    brands: z.array(z.string()).default([]),
    photos: z.array(z.object({ src: z.string(), caption: z.string() })).min(1),
    seoTitle: z.string().optional(),
  }),
});
```

`types`, `tags`, `properties` валідуються по `src/data/tags-registry.ts` —
єдине джерело істини для допустимих значень. При додаванні нового типу/тега —
редагувати тільки цей файл.

**URL картки:** `work.slug` (стандартний Astro slug з імені файлу),
формується як `https://elektroschit.com.ua/vykonani-roboty/${work.slug}/`
(з завершальним слешем).

---

## SLUGS ПРОДУКТІВ (для AlsoMake.currentSlug та Header activePage)

`hrshch` | `dymovydalennia` | `dvyhuny` | `shuz` | `krm` | `zenitni-lihtari` | `ahro` | `plk` | `elektromontazh`

---

## СТРУКТУРА СТОРІНКИ ПРОДУКТУ (порядок блоків, еталон — hrshch.astro)

```
<Header activePage="produktsiia" />
<Breadcrumbs current="Назва сторінки" />

<!-- HERO — em-hero-product (зелений фон) -->
  Текст: H1 (починається з «Виготовлення»), лід, бейджи, кнопка → #kontakty-blok
  Фото: .em-hero-collage (2×2 grid, 4 фото, object-fit:cover, aspect-ratio:1/1)

<!-- ГАЛЕРЕЯ — em-section (білий) -->
  .em-product-gallery: 1 велике (.em-gallery-item-large) + 7 малих
  Кожен item: data-full="/images/slug/filename.jpg" data-caption="..."

<!-- ДЕ ЗАСТОСОВУЄТЬСЯ — em-section-alt (зелений) -->
  .em-objects-grid: 6 карток .em-object-card (num + h3 + p)

<!-- ХАРАКТЕРИСТИКИ — em-section (білий) -->
  .em-specs-table: рядки em-specs-label / em-specs-value

<!-- КОМПОНЕНТИ — em-section-alt (зелений) -->
  .em-brands: 2 групи (основні / економ), .em-brand-pill (.secondary для економ)

<!-- ЯК МИ ПРАЦЮЄМО — em-section (білий) -->
  .em-steps-row: 5 кроків .em-step (num + h3 + p)

<!-- ПЕРЕВАГИ — em-section-alt (зелений) -->
  .em-why-grid: 6 карток .em-why-card (h3 + p)

<FaqAccordion items={faqItems} sectionTitle="Питання про ..." />        (білий)
<ContactBlock title="Готові обговорити ваше замовлення — [назва]" />    (зелений)
<AlsoMake currentSlug="slug" />                                        (білий)
<Footer />
<Lightbox />
<script is:inline src="/js/em-site.js"></script>
```

Чергування фонів — **суворе правило без винятків**: зелений → білий → зелений → ...
Якщо структура блоків створює два однакових підряд — тонкий розділювач `<hr class="em-divider">`.

---

## СТРУКТУРА КАРТКИ ПОРТФОЛІО (vykonani-roboty/[slug].astro)

```
<Header activePage="vykonani-roboty" />
<Breadcrumbs current={data.title} parentLabel="Виконані роботи" parentHref="/vykonani-roboty/" />

<WorkPhotos photos={data.photos} title={data.title} />
<WorkDescription title=... types=... tags=...>{Content}</WorkDescription>
<WorkSpecs specs={data.specs} />
<WorkBrands brands={data.brands} />
<WorkSimilar currentSlug={work.slug} types={data.types} />

<ContactBlock />
<Footer />
<Lightbox />
```

---

## ФОТОГРАФІЇ — ПРАВИЛА РОБОТИ

- Pillow: `quality=82`, `progressive=True`, `optimize=True`, `max 1200px` довга сторона, EXIF transpose
- Колаж hero: суфікс `-c1`…`-c4`, перші 2 — `loading="eager"`, решта — `lazy`
- Галерея: суфікс `-01` (велике) … `-08` (малі)
- SEO назва: `[slug]-[дескриптор]-kyiv-2026-06-[номер або c1-c4].jpg`
- Лайтбокс несумісний з `src/assets/` (Astro хешує імена файлів) — залишатись на `public/images/` до повної скриптованої міграції

---

## РОБОТА З ВИХІДНИМИ МАТЕРІАЛАМИ (MD + HTML)

1. Читати обидва файли — MD і HTML з WordPress
2. HTML має пріоритет над MD при розбіжностях
3. Порівнювати і обговорювати розбіжності перед генерацією
4. Типові розбіжності: кількість карток, питань FAQ, унікальні блоки

---

## ПРАВИЛА ДОСТАВКИ ЗМІН (ZIP)

- Формат: ZIP-архів, без кореневої папки — файли лежать одразу в корені
- Шляхи: repo-relative (напр. `src/pages/posluhy-ta-produktsiia/dvyhuny.astro`)
- Завантаження: через GitHub UI → автодеплой Cloudflare Pages
- **Workflow:** обговорення структури → явне підтвердження → генерація ZIP. Ніколи не будувати ZIP до підтвердження
- `delete.txt`: строго це ім'я, строго в корені ZIP, один шлях на рядок від кореня проекту, без лапок/пробілів/слешу на початку/коментарів

---

## БРЕЙКПОІНТИ

| Назва | Значення |
|---|---|
| Десктоп | 900px+ |
| Планшет | 600px – 899px |
| Мобільний | < 600px |

---

## SEO ШАБЛОН

- **Title:** `Виготовлення [назва] на замовлення — [ампераж або особливість] | elektroschit.com.ua`
- **Description:** 150–160 символів
- **H1:** обов'язково починається з «Виготовлення» (або «Програмування» для ПЛК)
- **canonical:** через `SITE_CANONICAL` з config.ts, завжди

---

## SITEMAP ТА ROBOTS.TXT (перевірено реальним білдом 2026-07-12)

- Власний файл `src/pages/sitemap.xml.ts` — без пакету `@astrojs/sitemap`
- Автоматично сканує `src/pages/*.astro` та `src/pages/posluhy-ta-produktsiia/*.astro` через `import.meta.glob`
- Виключає `admin_509` та динамічні роути (`[slug]`)
- Картки портфоліо підтягуються автоматично через `getCollection('vykonani-roboty')`
- Нову сторінку `.astro` — підхоплює сам при наступному білді
- Нову картку портфоліо — підхоплює сам, нічого правити не треба
- `public/robots.txt` містить `Sitemap: https://elektroschit.com.ua/sitemap.xml`
- URL: `https://elektroschit.com.ua/sitemap.xml`

---

*Проект: elektroschit.com.ua | context-project v3.0 (консолідований) | 2026-07-12*
