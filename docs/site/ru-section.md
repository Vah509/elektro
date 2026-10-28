# Раздел `/ru/` (русская версия)

Сверено с `src/pages/ru/**`, `Header.astro`, `AlsoMake.astro`, `BaseLayout.astro`, 2026-10-28.
Русская версия — **зеркало украинской** с другими URL и переведёнными текстами. Одни и те же фото, те же layouts и компоненты, переключение по `page.lang`.

---

## 1. Файлы и URL

| UA-страница (`src/pages/…`) | RU-страница (`src/pages/ru/…`) | RU URL |
|---|---|---|
| `index.astro` | `index.astro` | `/ru/` |
| `kontakty.astro` | `kontakty.astro` | `/ru/kontakty/` |
| `pro-nas.astro` | `pro-nas.astro` | `/ru/pro-nas/` |
| `posluhy-ta-produktsiia/index.astro` | `uslugi-i-produktsiya/index.astro` | `/ru/uslugi-i-produktsiya/` |
| `posluhy-ta-produktsiia/hrshch.astro` | `uslugi-i-produktsiya/grshch-i-vrshch.astro` | `/ru/uslugi-i-produktsiya/grshch-i-vrshch/` |
| `…/dymovydalennia.astro` | `…/shchity-dymoudaleniya.astro` | `…/shchity-dymoudaleniya/` |
| `…/dvyhuny.astro` | `…/shchity-upravleniya-dvigatelyami.astro` | `…/shchity-upravleniya-dvigatelyami/` |
| `…/shuz.astro` | `…/shuz.astro` | `…/shuz/` |
| `…/krm.astro` | `…/krm.astro` | `…/krm/` |
| `…/zenitni-lihtari.astro` | `…/zenitnyye-fonari.astro` | `…/zenitnyye-fonari/` |
| `…/ahro.astro` | `…/elektroschity-dlya-agro.astro` | `…/elektroschity-dlya-agro/` |
| `…/plk.astro` | `…/programmirovanie-plk.astro` | `…/programmirovanie-plk/` |
| `…/elektromontazh.astro` | `…/elektromontazh.astro` | `…/elektromontazh/` |
| `vykonani-roboty/index.astro` | `vykonani-roboty/index.astro` (заглушка) | `/ru/vykonani-roboty/` |

Всего 14 RU-файлов (включая заглушку `vykonani-roboty`). Карточек портфолио на русском нет.

Эта же таблица RU-slug-ов зашита в `AlsoMake.astro` (`ruSlugs`) и в `Header.astro` (меню). **При добавлении продукта правятся оба файла.** Продуктовая папка RU: `/ru/uslugi-i-produktsiya/` (UA: `/posluhy-ta-produktsiia/`).

## 2. Поля страницы

RU-страница отличается от UA в объекте `page`:
```js
const page = {
  lang:      'ru' as const,
  altUrl:    '/posluhy-ta-produktsiia/hrshch/',      // путь UA-версии
  section:   'produktsiia',                          // те же значения, что в UA
  title:     'Изготовление ГРЩ и ВРЩ до 630А | elektroschit.com.ua',
  description: '…',
  canonical: `${SITE_CANONICAL}/ru/uslugi-i-produktsiya/grshch-i-vrshch/`,
  crumbs: [{label:'Главная',href:'/ru/'},{label:'Продукция',href:'/ru/uslugi-i-produktsiya/'},{label:'ГРЩ и ВРЩ'}],
};
```
- Импорты config: на один уровень глубже (`'../../../config'`, layouts `'../../../layouts/…'`).
- `altUrl` у UA-страницы указывает на RU-версию, у RU — на UA; **пары должны быть взаимными** (проверено: сейчас все пары взаимны). От `altUrl` зависят hreflang (`uk`, `ru`, `x-default`) и переключатель УКР/РУС в шапке.
- Для `kontakty` RU импортирует `ADDRESS_RU as ADDRESS`; ContactBlock сам берёт `ADDRESS_RU`/`WORK_HOURS_RU` при `lang='ru'`.
- Фото: пути `/images/<папка>/…` те же, что в UA (русские страницы файлов не дублируют). `alt`, `caption`, тексты — по-русски.
- ProductLayout для RU передаёт `lang` в `FaqAccordion`, `ContactBlock`, `AlsoMake` автоматически; строки интерфейса выбирает сам.
- Название разделов навигации: Продукция, Услуги, Выполненные работы, О нас, Контакты; CTA «Оставить заявку»; логотип «Сборка электрощитов».
- `og:locale` = `ru_UA`.

## 3. `/ru/vykonani-roboty/` — заглушка

Страница «Раздел недоступен на русском языке» со ссылкой на UA-версию. Скрипт читает параметр `?from=<slug>` и меняет ссылку на `/vykonani-roboty/<slug>/` (в текущем коде нигде не формируется такой URL — задел).
- Исключена из `sitemap.xml` (`EXCLUDED_PATHS = ['ru/vykonani-roboty']`) и закрыта в `robots.txt`.
- Ссылка «Переглянути роботи →/Посмотреть работы →» на RU-продуктовых страницах ведёт сюда (`/ru/vykonani-roboty/`).
- Title 63 символа (немного > 60) — известное мелкое замечание.

## 4. Как создать RU-версию новой страницы

1. Скопировать UA-страницу в `src/pages/ru/uslugi-i-produktsiya/<ru-slug>.astro` (RU-slug — по транслитерации русского названия, как в таблице).
2. Поменять `lang`, `altUrl`, `canonical`, `crumbs`, все тексты (hero, gallery alt/caption, objects, specs, brands не переводятся, steps, why, FAQ, `contactTitle`).
3. Исправить относительные импорты (+ один `../`).
4. В UA-странице прописать `altUrl` на RU. Добавить пару slug-ов в `AlsoMake.ruSlugs`/`allProducts` и в Header RU-меню.
5. Sitemap подхватит сам.

---
*elektroschit.com.ua | docs/site/ru-section.md | 2026-10-28*
