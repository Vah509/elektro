# Документация — elektroschit.com.ua

Рабочая документация проекта. **Источник правды — эта папка `docs/` в репозитории `Vah509/elektro` (ветка `main`).** Копии в файлах claude.ai Project — только для быстрого чтения; при расхождении верить репозиторию. Не автогенерируется: обновляется вручную при значимых изменениях (+ строка в `changelog.md`).
Актуально на 2026-10-28, сверено с кодом (чистый клон `main`, сборка 68 страниц без ошибок).

Правило против дублей: **у каждого документа одно место.** Старые файлы в корне `docs/` (`context-project*.md`, `layouts*.md`, `sitemap-and-deploy-process.md`, `gtm-ga4-events-setup.md`) удалены; новые версии не создавать под старыми именами и не класть второй копией в другой подпапке.

---

## Что где искать

### `site/` — как устроен сайт
| Файл | О чём | Читать, когда |
|---|---|---|
| [site/architecture.md](site/architecture.md) | стек, дерево репозитория («где что лежит»), `config.ts`, карта страниц/URL, CSS, SEO-стандарты | любой вопрос об устройстве сайта |
| [site/layouts-and-components.md](site/layouts-and-components.md) | `BaseLayout`, `ProductLayout`, все компоненты, пропсы, JS, «Схожие работы» | правка/создание страниц и компонентов |
| [site/page-creation-guide.md](site/page-creation-guide.md) | **пошагово: как создать страницу**, что обновить, чек-лист, шаблон первого сообщения | создание любой страницы |
| [site/photos-pipeline.md](site/photos-pipeline.md) | где лежат фото, имена, `Photo`/`photo.ts`, `sizes`, добавить/заменить/удалить | всё, что связано с фото |
| [site/deploy-and-sitemap.md](site/deploy-and-sitemap.md) | доставка ZIP (`ai-updates/`), удаление (`ai-deletes/`), Telegram-статусы, sitemap, `lastmod-map.json` | загрузка и удаление файлов, вопросы по датам в sitemap |
| [site/ru-section.md](site/ru-section.md) | русская версия: маппинг slug-ов, `altUrl`/hreflang, заглушка портфолио | RU-страницы |
| [site/tools.md](site/tools.md) | `audit-site.mjs`, `psi-report-v3.mjs`, локальная проверка | проверки после деплоя |

### `portfolio/` — карточки «Виконані роботи» (для отдельного проекта карточек)
| Файл | О чём |
|---|---|
| [portfolio/card-creation-rules.md](portfolio/card-creation-rules.md) | **правила создания карточек**: пути, поля, YAML, фото, доставка, ошибки, чек-лист |
| [portfolio/tags-registry.md](portfolio/tags-registry.md) | допустимые `types` / `tags` / `properties` (из `src/data/tags-registry.ts`) |

### `marketing/`
| Файл | О чём |
|---|---|
| [marketing/gtm-ga4-tags.md](marketing/gtm-ga4-tags.md) | 12+1 событий GTM/GA4, известные нюансы, данные (v4.0, 2026-09-26) |

### В корне
- [changelog.md](changelog.md) — хронология значимых изменений (код, аналитика, структура).

---

## Какие файлы держать в claude.ai Project

| Проект | Файлы |
|---|---|
| «Фабрика Страниц» (страницы сайта) | `architecture.md`, `layouts-and-components.md`, `page-creation-guide.md`, `photos-pipeline.md`, `deploy-and-sitemap.md`, `ru-section.md`, `tags-registry.md`, `changelog.md` + `gtm-ga4-tags.md` при вопросах по аналитике. Файлы `context.md`, `layouts.md`, `deploy-and-sitemap-v2.md`, `docs-pointer.md`, `page-template.md`, `sitemap-process-description.md` в Project заменить: шаблон первого сообщения теперь в `page-creation-guide.md`, раздел E |
| Проект карточек портфолио | `portfolio/card-creation-rules.md`, `portfolio/tags-registry.md`, `site/photos-pipeline.md`, раздел 1–2 `site/deploy-and-sitemap.md`, `src/content/config.ts`, `src/data/tags-registry.ts`, эталонная карточка, `audit-site.mjs` |

## Как добавлять / менять документацию
1. Определить раздел: `site/` (код, архитектура, процессы), `portfolio/` (карточки), `marketing/` (SEO, аналитика, реклама).
2. Править существующий файл; новый файл — добавить строку в таблицу выше.
3. Значимое изменение — строка в `changelog.md`.
4. Доставка: ZIP с путями `docs/...` (без корневой папки) в `ai-updates/`. Удаление устаревших файлов — через `ai-deletes/` (папка `docs/` разрешена). Заметка: `.md` из ZIP попадают в `lastmod-map.json` лишними ключами — на sitemap не влияет.
5. Если в чате документ изменён — синхронизировать копию в Project (и наоборот), иначе версии разойдутся.

## Что изменилось в ревизии 2026-10-28 (главное)
- **Фото:** оригиналы в `src/assets/images/`, пути-строки `/images/…`, `Photo.astro` + `photo.ts` (WebP q78); `public/images/` — только `og-default.jpg`. (Старое «Pillow q82», «фото в public/», «лайтбокс несовместим с src/assets» — неверно.)
- **Деплой:** `ai-updates/` (ZIP → `process-update.js`, staging, сборка, Telegram) и `ai-deletes/` (`process-deletes.js`). `delete.txt` не работает.
- **`BaseLayout` используют ВСЕ страницы** (кроме `admin_509`), старое «не используется» — неверно; `page.styles` вшивает CSS inline.
- **`WorkSimilar`** принимает готовые списки (`relatedTop`/`moreWorks`/`currentTypeLabel`), граф считается один раз в `similarWorksGraph.ts`.
- **Реестр:** 10 types, 3 tags, 8 properties.
- **Раздел `/ru/`:** 14 файлов, маппинг slug-ов, hreflang через `altUrl`, заглушка `/ru/vykonani-roboty/` вне sitemap.
- **Каталог:** карточки с 16-й скрыты в HTML, пагинация по 15.
- **Открытые вопросы к владельцу** — в отчёте о ревизии (лишние файлы фото; мелкие SEO-замечания).

---
*elektroschit.com.ua | docs/README | 2026-10-28*
