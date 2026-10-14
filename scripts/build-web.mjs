import { cp, mkdir, rm } from 'node:fs/promises';

const files = [
  'index.html',
  'styles.css',
  'app.js',
  'products.js',
  'creator-upload.js',
  'supabase-config.js',
  'app.webmanifest',
  'app-icon.svg',
  'service-worker.js',
  'SUPABASE_SETUP.md',
  'supabase-setup.sql',
];

await rm('www', { recursive: true, force: true });
await mkdir('www', { recursive: true });

for (const file of files) {
  await cp(file, `www/${file}`);
}

console.log(`Prepared ${files.length} web assets in www/`);
