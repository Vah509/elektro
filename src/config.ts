// ============================================================
// КОНФІГ САЙТУ — elektroschit.com.ua
// src/config.ts
// ============================================================

// ── ДОМЕНИ ──────────────────────────────────────────────────

export const SITE_PREVIEW    = 'https://elektro-4a1.pages.dev';
export const SITE_CANONICAL  = 'https://elektroschit.com.ua';

// ── GITHUB ───────────────────────────────────────────────────

export const GITHUB_CONTENT_BASE = 'https://github.com/Vah509/elektro/edit/main/src/content/vykonani-roboty';

// ── КОНТАКТИ ─────────────────────────────────────────────────

export const PHONE         = '+380981527555';
export const PHONE_DISPLAY = '+38 (098) 152-75-55';
export const EMAIL         = 'elektroschit.info@gmail.com';

// Повна адреса — для ContactBlock, kontakty.astro (залишається)
export const ADDRESS       = 'Київ, вул. Печенізька, 35/43, оф. 168';
// Роздільно — для JSON-LD LocalBusiness у BaseLayout
export const ADDRESS_STREET = 'вул. Печенізька, 35/43, оф. 168';
export const ADDRESS_CITY   = 'Київ';

export const MAPS_URL      = 'https://www.google.com/maps/search/?api=1&query=Київ,+вул.+Печенізька,+35/43';

export const VIBER         = 'viber://chat?number=%2B380733058694';
export const TELEGRAM      = 'https://t.me/+380981527555';
export const WHATSAPP      = 'https://wa.me/380981527555';

export const WORK_HOURS    = 'робочі дні з 9:00 до 17:00';

// ── АНАЛІТИКА ────────────────────────────────────────────────
// Порожній рядок = скрипт не вставляється в HTML.
// Заповни коли отримаєш реальні ID у GTM / Clarity.

export const GTM_ID     = 'GTM-PZSRTZ2T';
export const CLARITY_ID = '';   // напр. 'abcdef1234'
