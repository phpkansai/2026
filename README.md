# PHPカンファレンス関西2026 公式サイト

[Astro](https://astro.build/) 製の静的サイトです。`npm run build` で `dist/` に純粋な HTML/CSS が出力され、どのサーバーにもそのまま置けます。

## 起動方法

### Docker（推奨: ローカルに Node が無くてもOK）

```bash
docker compose up            # 開発サーバー → http://localhost:4321
docker compose run --rm build  # 静的HTMLを dist/ に書き出し
```

### Node 直接（Node 22 以上）

```bash
npm install
npm run dev      # 開発サーバー → http://localhost:4321
npm run build    # dist/ に書き出し
npm run preview  # dist/ の内容を確認
```

## ディレクトリ構成

```
src/
  data/
    site.yaml       … イベント情報・各種URL・文言・スポンサーランク定義・フッター
    sponsors.yaml   … スポンサー一覧（追加・削除はここ）
    news.yaml       … サイト独自のお知らせ（fortee のNEWSと合算表示）
    staff.yaml      … スタッフの補助設定（fortee 未登録者の追加・非表示・並び順）
  assets/
    sponsors/       … スポンサーロゴ画像（自動でリサイズ・WebP化）
    staff/          … fortee 未登録スタッフの写真
  components/       … 各セクション（Hero / News / Message / Overview / Proposal / Sponsors / Staff …）
  layouts/Base.astro… 共通レイアウト（head・ヘッダー・フッター）
  lib/
    data.ts         … YAML 読み込み
    fortee.ts       … fortee API からの取得（ビルド時）
    slots.ts        … public/images の画像スロット
  pages/
    index.astro     … トップ（LP）
    coc.astro       … 行動規範 (/coc/)
    timetable.astro … タイムテーブル (/timetable/)
  styles/global.css … 配色トークン・共通スタイル
public/
  images/           … ロゴ・マスコット等の画像スロット（README.md 参照）
```

## よくある更新作業

### スポンサーを追加・削除する

1. `src/assets/sponsors/` にロゴ画像を置く（例: `example.png`）
2. `src/data/sponsors.yaml` に追記する

```yaml
- name: "株式会社サンプル"
  tier: gold           # platinum / gold / silver / bronze
  url: "https://example.com/"
  logo: "example.png"  # 1. で置いたファイル名
```

3. 再ビルド（`docker compose run --rm build`）

削除は該当ブロックを消すだけです。ロゴが未着の間は社名入りのグレー枠が表示されます。

### スタッフを追加・削除する

**fortee のスタッフ管理画面で登録・削除**すれば、再ビルド時に自動で反映されます（名前・リンク・アバターは fortee のもの）。
fortee に登録しない人を載せたい場合だけ `src/data/staff.yaml` の `extra` に追記します。

### お知らせを出す

fortee の NEWS に投稿すれば再ビルドで反映されます。fortee を使わない場合は `src/data/news.yaml` に追記します。

### URL・文言を変える

`src/data/site.yaml` を編集します。

| キー | 内容 |
|---|---|
| `links.register` | 参加申し込みボタンのリンク先 |
| `links.proposal` | 「forteeで応募する」のリンク先 |
| `links.timetable_external` | タイムテーブル（外部）のリンク先 |
| `links.x` / `links.note` | SNS |
| `timetable.mode` | `auto`（fortee にデータがあればサイト内ページ） / `internal` / `external` |
| `venue.map_embed_url` | Googleマップ埋め込みURL |
| `message.*` / `proposal.*` | 本文テキスト |
| `url` | 公開URL（決まったら設定。OGP・canonical に使用） |

### デザイン画像を差し込む

`public/images/` に決まったファイル名で置くだけです。一覧は [public/images/README.md](public/images/README.md) を参照してください。

## fortee 連携について

ビルド時に以下の公開APIを取得し、HTMLに焼き込みます。取得に失敗した場合は空扱いになり、ビルドは失敗しません。

- `https://fortee.jp/phpcon-kansai2026/api/news`
- `https://fortee.jp/phpcon-kansai2026/api/staff?type=simple`
- `https://fortee.jp/phpcon-kansai2026/api/timetable`

fortee 側の更新は **再ビルドするまで反映されません**。公開先が決まったら、定期ビルド（例: GitHub Actions の cron）を設定するのがおすすめです。

## 配色

| 用途 | 値 |
|---|---|
| 紫（メイン） | `#8568CD` |
| ピンク（ボタン） | `#FF4D8B` |
| 薄ピンク（背景） | `#FDEFFC` |

`src/styles/global.css` の `:root` で定義しています。

## 今後の予定（メモ）

- 行動規範をモーダル表示に切り替える場合は `src/components/CocContent.astro` を流用する
- タイムテーブルは fortee にデータが入ると `/timetable/` に自動表示される（デザイン調整は `src/components/Timetable.astro`）
- 公開先・リポジトリが決まり次第、デプロイ設定を追加する
