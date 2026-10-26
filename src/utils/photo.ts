// ============================================================
// photo.ts — пошук фото для astro:assets за рядком-шляхом.
// Сторінки пишуть шляхи як і раніше: '/images/hrshch/xxx.jpg'.
// Файл фізично лежить у src/assets/images/hrshch/xxx.jpg.
// Якщо файл не знайдено — збірка падає (щоб не загубити фото мовчки).
// ============================================================
import { getImage } from 'astro:assets';

const files = import.meta.glob<ImageMetadata>(
  '/src/assets/images/**/*.{jpg,jpeg,JPG,JPEG}',
  { import: 'default', eager: true }
);

export function resolvePhoto(path: string): ImageMetadata {
  const key = '/src/assets' + path;
  const meta = files[key];
  if (!meta) {
    throw new Error(`[photo] Файл не знайдено: ${path} (очікується ${key})`);
  }
  return meta;
}

/**
 * URL великої версії для лайтбокса: найбільший WebP із srcset (до 1200 px).
 * Береться через той самий getImage із тими ж параметрами, що й <Photo>,
 * тому це той самий файл (без дублікатів у збірці).
 */
export async function fullUrl(path: string): Promise<string> {
  const meta = resolvePhoto(path);
  const maxW = Math.min(1200, meta.width);
  const widths = [...new Set([...[480, 800].filter(w => w < maxW), maxW])];
  const img = await getImage({ src: meta, widths, sizes: '100vw', format: 'webp', quality: 78 });
  const values = img.srcSet.values;
  return values[values.length - 1].url;
}
