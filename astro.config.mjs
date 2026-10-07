// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import { parse } from 'yaml';

// site.yaml の redirects を /go/<キー>/ → URL の転送に変換する（印刷物のQRコード用。docs/utm.md 参照）
const site = parse(fs.readFileSync(new URL('./src/data/site.yaml', import.meta.url), 'utf8'));
const redirects = Object.fromEntries(
  Object.entries(site.redirects ?? {}).map(([key, to]) => [`/go/${key}`, String(to)]),
);

// 公開URL（OGP・canonical・sitemap に使われます）
export default defineConfig({
  site: 'https://2026.kphpug.jp',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  redirects,
  server: {
    host: true,
    port: 4321,
  },
});
