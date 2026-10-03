// @ts-check
import { defineConfig } from 'astro/config';

// 公開URL（OGP・canonical・sitemap に使われます）
export default defineConfig({
  site: 'https://2026.kphpug.jp',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  server: {
    host: true,
    port: 4321,
  },
});
