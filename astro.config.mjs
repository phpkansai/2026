// @ts-check
import { defineConfig } from 'astro/config';

// 公開URLが決まったら site を設定してください（OGP・canonical に使われます）。
// 例: site: 'https://2026.kphpug.jp'
export default defineConfig({
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
