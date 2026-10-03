# PHPカンファレンス関西2026 公式サイト

https://2026.kphpug.jp/

[Astro](https://astro.build/) 製の静的サイトです。`npm run build` で `dist/` に純粋な HTML/CSS/画像 が出力され、どのサーバーにもそのまま置けます。

## 起動方法

### Docker（推奨: ローカルに Node が無くてもOK）

```bash
docker compose up              # 開発サーバー → http://localhost:4321
docker compose run --rm build  # 静的HTMLを dist/ に書き出し
```

### Node 直接（Node 22 以上）

```bash
npm install      # 初回のみ
npm run dev      # 開発サーバー → http://localhost:4321
npm run build    # dist/ に書き出し
npm run preview  # dist/ の内容を確認
```

## ページ構成

| URL | 内容 |
|---|---|
| `/` | トップ（LP）。下記セクションを縦に並べたもの |
| `/coc/` | 行動規範・プライバシーポリシー |
| `/timetable/` | タイムテーブル。fortee にデータが入ると自動で表示される（空の間は「準備中」） |

### トップページのセクション（上から順）

| セクション | コンポーネント | 表示切替 | 内容・データ元 |
|---|---|---|---|
| ヒーロー | `Hero.astro` | 常時 | ロゴ・日付画像（`public/images/`）、参加申し込みボタン（`links.register`） |
| NEWS | `News.astro` | `sections.news` | fortee の NEWS ＋ `news.yaml` を日付順に表示 |
| 開催概要（実行委員長の挨拶） | `Message.astro` | 常時 | `message.*`。ナビの「開催概要」はここに飛ぶ |
| 参加資格・会場 | `Overview.astro` | 常時（会場カードは `overview.show_venue_card`） | `overview.eligibility`、`venue.*`（Googleマップ埋め込み） |
| プロポーザル | `Proposal.astro` | `sections.proposal` | `proposal.*`、`links.proposal` |
| スポンサー | `Sponsors.astro` | `sections.sponsors` | `sponsors.yaml` ＋ `src/assets/sponsors/` のロゴ |
| スタッフ | `Staff.astro` | `sections.staff` | fortee のスタッフAPI ＋ `staff.yaml` |
| リンク集「絶賛募集中！」 | `Recruit.astro` | `sections.recruit` | `recruit.items`（プロポーザル / スポンサー / リクエストトーク） |
| フッター | `Footer.astro` | 常時 | 丘の背景、マスコット、SNS、過去開催リンク、`footer.*` |

## ディレクトリ構成

```
src/
  data/
    site.yaml        … イベント情報・各種URL・文言・セクション表示切替・スポンサーランク・リンク集・フッター
    sponsors.yaml    … スポンサー一覧（追加・削除はここ）
    news.yaml        … サイト独自のお知らせ（fortee のNEWSと合算表示）
    staff.yaml       … スタッフの補助設定（fortee 未登録者の追加・非表示・並び順）
  assets/
    sponsors/        … スポンサーロゴ画像（自動でリサイズ・WebP化）
    staff/           … fortee 未登録スタッフの写真
  components/        … 各セクション（上の表を参照）
    icons/           … X / note / リンク集アイコン / 矢印（インラインSVG、色は文字色に追従）
    Cloud.astro      … 雲の装飾（public/images/cloud.svg を表示）
    CocContent.astro … 行動規範の本文（ページからもモーダルからも使えるよう分離）
    Timetable.astro  … タイムテーブル本体（fortee API）
  layouts/Base.astro … 共通レイアウト（head・OGP・ヘッダー・フッター）
  lib/
    data.ts          … YAML 読み込みと型定義
    fortee.ts        … fortee API からの取得（ビルド時）
    slots.ts         … public/images の画像スロット
    assets.ts        … src/assets の画像をファイル名で引く
  pages/
    index.astro      … トップ（LP）
    coc.astro        … 行動規範 (/coc/)
    timetable.astro  … タイムテーブル (/timetable/)
  styles/global.css  … 配色トークン・共通スタイル
public/
  images/            … ロゴ・マスコット・日付・雲・OGP などの画像スロット（README.md 参照）
  favicon-32.png, apple-touch-icon.png
```

## よくある更新作業

すべて **編集 → 再ビルド** で反映されます。

### セクションを表示 / 非表示にする

`src/data/site.yaml` の `sections` を `true` / `false` にします。非表示にしたセクションはナビのリンクも消えます。

```yaml
sections:
  news: true
  proposal: false   # プロポーザル
  sponsors: false   # スポンサー
  staff: false      # スタッフ
  recruit: true     # リンク集「絶賛募集中！」
  timetable: false  # ナビの「タイムテーブル」リンク
```

### リンク集「絶賛募集中！」を変える

`site.yaml` の `recruit.items` を編集します。1項目 = 1カードです。

```yaml
- icon: proposal            # proposal / sponsor / request（アイコンの種類）
  title: "プロポーザル"
  deadline: "締切：2026年10月18日（日）"
  button: "forteeで応募"
  url: "https://..."
  # wide: true              # 1列で横いっぱいに表示したいとき
  # description: |          # 説明文を入れたいとき
```

### スポンサーを追加・削除する

1. `src/assets/sponsors/` にロゴ画像を置く（例: `example.png`）
2. `src/data/sponsors.yaml` に追記する

```yaml
- name: "株式会社サンプル"
  tier: gold           # platinum / gold / silver / bronze
  url: "https://example.com/"
  logo: "example.png"  # 1. で置いたファイル名
```

削除は該当ブロックを消すだけです。ロゴが未着の間は社名入りのグレー枠が表示されます。
ランクごとの1行あたりの枚数や見出しは `site.yaml` の `sponsor_tiers` で変えられます。

### スタッフを追加・削除する

**fortee のスタッフ管理画面で登録・削除**すれば、再ビルド時に自動で反映されます（名前・リンク・アバターは fortee のもの）。
fortee に登録しない人を載せたい場合だけ `src/data/staff.yaml` の `extra` に追記します。

### お知らせを出す

fortee の NEWS に投稿すれば再ビルドで反映されます。fortee を使わない場合は `src/data/news.yaml` に追記します。

### URL・文言を変える

`src/data/site.yaml` を編集します。

| キー | 内容 |
|---|---|
| `url` | 公開URL（OGP・canonical に使用） |
| `links.register` | 参加申し込みボタンのリンク先（**現在ダミー**） |
| `links.proposal` | 「forteeで応募する」のリンク先 |
| `links.timetable_external` | タイムテーブル（外部）のリンク先 |
| `links.x` / `links.note` | SNS |
| `timetable.mode` | `auto`（fortee にデータがあればサイト内ページ） / `internal` / `external` |
| `message.title` / `lead` / `body` / `signature` | 実行委員長の挨拶（＝開催概要）。`body` は1要素1段落 |
| `overview.eligibility` | 参加資格の見出しと本文 |
| `overview.show_venue_card` | 会場・アクセスのカード（日時・住所・地図）を出すか |
| `venue.*` | 会場名・住所・アクセス・Googleマップ埋め込みURL |
| `proposal.*` | プロポーザルセクションの本文・ボタン |
| `recruit.*` | リンク集 |
| `footer.*` | 運営団体名・コピーライト・過去開催リンク |

### デザイン画像を差し込む

`public/images/` に決まったファイル名で置くだけです。一覧は [public/images/README.md](public/images/README.md) を参照してください。
現在入っているもの: ヒーローロゴ、日付、ヘッダーロゴ、雲、フッターマスコット、OGP、favicon。
**街並みシルエット（`skyline.*`）は未着**で、今は単純な丘の形を表示しています。

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

## 実装メモ

- Astro のスコープ付きCSSは子コンポーネントの要素には効きません。`Cloud` のような子コンポーネントの位置は `style` 属性か `:global()` で指定しています
- `Header.astro` はビルド時に fortee のタイムテーブルを見て、ナビの「タイムテーブル」のリンク先（サイト内 / fortee）を自動で切り替えます
- 行動規範をモーダル表示に切り替える場合は `CocContent.astro` をそのまま流用できます

## 今後の予定（メモ）

- 参加申し込みURLの確定（`links.register`）
- 街並みシルエット画像の差し替え（`public/images/skyline.svg`）
- プロポーザル / スポンサー / スタッフ セクションの公開（`sections` を `true` に）
- 公開先・リポジトリが決まり次第、デプロイ設定（GitHub Actions など）を追加
