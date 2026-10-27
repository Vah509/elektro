// scripts/process-deletes.js
// ============================================================
// Видалення файлів зі списку. Окремий механізм поруч із
// process-update.js (ZIP-оновлення) — його не чіпає.
//
// Як користуватись:
//   1. Створити текстовий файл (.txt) зі шляхами файлів, які треба
//      видалити — по одному шляху на рядок, від кореня репозиторію,
//      без слеша на початку: public/images/hrshch/photo.jpg
//      Порожні рядки та рядки, що починаються з #, ігноруються.
//   2. Завантажити цей .txt у папку ai-deletes/ (GitHub → Add file →
//      Upload files).
//   3. GitHub Actions (delete-files.yml) запускає цей скрипт:
//        - перевіряє шляхи (див. правила безпеки нижче);
//        - робить копію проекту (staging), видаляє файли там і
//          запускає тестову збірку (npm run build);
//        - збірка ОК  → видаляє файли в реальному репозиторії;
//        - збірка не ОК → НІЧОГО не видаляє, шле помилку в Telegram;
//        - сам .txt з ai-deletes/ видаляється завжди.
//
// Пробний запуск (нічого не видаляє, лише звіт): назвати файл
//   dry-<будь-що>.txt   або   першим рядком написати  # dry-run
//
// ПРАВИЛА БЕЗПЕКИ:
//   - дозволені лише шляхи, що починаються з public/, src/ або docs/;
//   - заборонені «..», абсолютні шляхи, зворотні слеші, символічні
//     посилання, а також ключові файли (див. PROTECTED);
//   - видаляються лише ФАЙЛИ. Папка у списку = пропуск з попередженням
//     (щоб одним рядком не знести цілий каталог);
//   - не більше MAX_FILES файлів за один .txt.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { createStaging, cleanupStaging } from './lib/staging.js';
import { testBuild } from './lib/test-build.js';
import { sendTelegramMessage } from './lib/send-telegram.js';

const REPO_ROOT = process.cwd();
const DELETES_DIR = path.join(REPO_ROOT, 'ai-deletes');
const ALLOWED_PREFIXES = ['public/', 'src/', 'docs/'];
const PROTECTED = new Set([
  'src/config.ts',
  'src/content/config.ts',
  'src/data/tags-registry.ts',
  'src/data/lastmod-map.json',
  'public/robots.txt',
  'public/js/em-site.js',
]);
const MAX_FILES = 300;

/** Розбирає .txt: повертає { dryRun, lines } */
export function parseList(text, fileName = '') {
  const raw = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const firstNonEmpty = raw.map((l) => l.trim()).find((l) => l) || '';
  const dryRun =
    /^dry-/i.test(fileName) || /^#\s*dry-?run\b/i.test(firstNonEmpty);
  const lines = raw.map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  return { dryRun, lines };
}

/**
 * Перевіряє один шлях. Повертає { ok: true, rel } або { ok: false, reason }.
 * Нічого не чіпає на диску, крім читання (lstat).
 */
export function validatePath(line, repoRoot = REPO_ROOT) {
  if (line.includes('\0')) return { ok: false, reason: 'недопустимий символ' };
  if (line.includes('\\')) return { ok: false, reason: 'зворотний слеш' };
  if (line.startsWith('/')) return { ok: false, reason: 'шлях має бути від кореня репозиторію, без / на початку' };
  if (/^[a-zA-Z]:/.test(line)) return { ok: false, reason: 'абсолютний шлях' };
  if (line.split('/').includes('..')) return { ok: false, reason: 'містить ..' };
  if (/["'`]/.test(line)) return { ok: false, reason: 'лапки у шляху' };

  const rel = path.posix.normalize(line);
  if (!ALLOWED_PREFIXES.some((p) => rel.startsWith(p))) {
    return { ok: false, reason: 'дозволено лише public/, src/, docs/' };
  }
  if (PROTECTED.has(rel)) return { ok: false, reason: 'захищений файл' };

  const abs = path.resolve(repoRoot, rel);
  if (!abs.startsWith(path.resolve(repoRoot) + path.sep)) {
    return { ok: false, reason: 'вихід за межі репозиторію' };
  }

  let st;
  try {
    st = fs.lstatSync(abs);
  } catch {
    return { ok: false, missing: true, reason: 'файлу вже немає' };
  }
  if (st.isSymbolicLink()) return { ok: false, reason: 'символічне посилання' };
  if (st.isDirectory()) return { ok: false, dir: true, reason: 'це папка (видаляються лише файли)' };
  return { ok: true, rel };
}

/** Видаляє порожні батьківські папки (лише всередині дозволених префіксів). */
function pruneEmptyDirs(root, rel) {
  let dir = path.posix.dirname(rel);
  while (dir && dir !== '.' && ALLOWED_PREFIXES.some((p) => (dir + '/').startsWith(p) && dir + '/' !== p)) {
    const abs = path.join(root, dir);
    try {
      if (fs.readdirSync(abs).length === 0) fs.rmdirSync(abs);
      else break;
    } catch {
      break;
    }
    dir = path.posix.dirname(dir);
  }
}

function shortList(items, max = 25) {
  const head = items.slice(0, max).join('\n');
  return items.length > max ? `${head}\n… і ще ${items.length - max}` : head;
}

async function processOne(txtPath) {
  const name = path.basename(txtPath);
  const { dryRun, lines } = parseList(fs.readFileSync(txtPath, 'utf-8'), name);
  const time = new Date().toISOString().slice(0, 16).replace('T', ' ');
  console.log(`\n=== ${name}: ${lines.length} рядків${dryRun ? ' (dry-run)' : ''} ===`);

  if (lines.length > MAX_FILES) {
    await sendTelegramMessage(
      `🔴 *Видалення файлів*: ${name}\nУ списку ${lines.length} шляхів — більше ліміту ${MAX_FILES}. Нічого не видалено. Розбийте на кілька файлів.`
    );
    return false;
  }

  const ok = [];
  const missing = [];
  const rejected = [];
  const seen = new Set();
  for (const line of lines) {
    const r = validatePath(line);
    if (r.ok) {
      if (!seen.has(r.rel)) {
        seen.add(r.rel);
        ok.push(r.rel);
      }
    } else if (r.missing) missing.push(line);
    else rejected.push(`${line}  ← ${r.reason}`);
  }

  let header = `Файл: ${name}\nЧас: ${time} UTC\nДо видалення: ${ok.length}, вже немає: ${missing.length}, відхилено: ${rejected.length}`;
  let ready = true;

  if (rejected.length > 0) {
    // Будь-який відхилений шлях = помилка в списку: не видаляємо нічого,
    // щоб не отримати «частково виконаний» результат.
    ready = false;
  }
  if (ok.length === 0) ready = false;

  if (dryRun || !ready) {
    const why = dryRun ? '🟡 *Видалення (dry-run)* — нічого не видалено' : '🔴 *Видалення скасовано* — нічого не видалено';
    let msg = `${why}\n${header}`;
    if (rejected.length) msg += `\n\nВідхилені рядки:\n\`\`\`\n${shortList(rejected)}\n\`\`\``;
    if (ok.length && dryRun) msg += `\n\nБуло б видалено:\n\`\`\`\n${shortList(ok)}\n\`\`\``;
    if (!ok.length && !rejected.length) msg += '\n\nУ списку немає жодного існуючого файлу.';
    await sendTelegramMessage(msg);
    console.log(msg);
    return dryRun || ok.length === 0 && rejected.length === 0;
  }

  // --- реальне видалення: спершу staging + тестова збірка ---
  let success = false;
  let errorSummary = null;
  try {
    const staging = createStaging(REPO_ROOT);
    for (const rel of ok) fs.rmSync(path.join(staging, rel), { force: true });
    console.log('Тестова збірка без цих файлів...');
    const b = testBuild(staging);
    success = b.success;
    errorSummary = b.errorSummary;
  } finally {
    cleanupStaging();
  }

  if (!success) {
    await sendTelegramMessage(
      `🔴 *Видалення скасовано: збірка падає без цих файлів*\n${header}\n\n\`\`\`\n${errorSummary}\n\`\`\`\nНічого не видалено.`
    );
    return false;
  }

  for (const rel of ok) {
    fs.rmSync(path.join(REPO_ROOT, rel), { force: true });
    pruneEmptyDirs(REPO_ROOT, rel);
  }
  await sendTelegramMessage(
    `🟢 *Видалено файлів: ${ok.length}*\n${header}\n\n\`\`\`\n${shortList(ok, 15)}\n\`\`\``
  );
  return true;
}

async function main() {
  if (!fs.existsSync(DELETES_DIR)) {
    console.log('Папки ai-deletes/ немає — завершення без дій.');
    return 0;
  }
  const txts = fs
    .readdirSync(DELETES_DIR)
    .filter((f) => f.toLowerCase().endsWith('.txt'))
    .sort();
  if (txts.length === 0) {
    console.log('У ai-deletes/ немає .txt — завершення без дій.');
    return 0;
  }

  let allOk = true;
  for (const f of txts) {
    const p = path.join(DELETES_DIR, f);
    try {
      if (!(await processOne(p))) allOk = false;
    } catch (err) {
      allOk = false;
      console.error('Неочікувана помилка:', err);
      await sendTelegramMessage(`🔴 *Видалення файлів*: неочікувана помилка у ${f}\n\`\`\`\n${String(err.message || err).slice(0, 500)}\n\`\`\``);
    } finally {
      // Сам список видаляється ЗАВЖДИ, щоб workflow не запускався вдруге.
      fs.rmSync(p, { force: true });
    }
  }
  return allOk ? 0 : 1;
}

if (process.argv[1] && process.argv[1].endsWith('process-deletes.js')) {
  main().then((code) => process.exit(code));
}
