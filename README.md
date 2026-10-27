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
| `/proposal_countdown/` | プロポーザル募集締切カウントダウン。応募数・新着3件をブラウザから fortee API で10秒ごとに更新。締切・本文は `site.yaml` の `proposal_countdown`。OGP画像は残り日数に応じて `public/images/ogp-countdown/<残り日数>.png` に切り替わる（ビルド時の日付で決まるため毎日自動再ビルド） |
| `/timetable/` | タイムテーブル。fortee にデータが入ると自動で表示される（空の間は「準備中」） |

### トップページのセクション（上から順）

| セクション | コンポーネント | 表示切替 | 内容・データ元 |
|---|---|---|---|
| ヒーロー | `Hero.astro` | 常時 | ロゴ・日付画像（`public/images/`）、参加申し込みボタン（`links.register`） |
| NEWS | `News.astro` | `sections.news` | fortee の NEWS ＋ `news.yaml` を日付順に表示 |
| 開催概要（実行委員長の挨拶） | `Message.astro` | 常時 | `message.*`。ナビの「開催概要」はここに飛ぶ |
| 参加資格・会場 | `Overview.astro` | 常時（会場カードは `overview.show_venue_card`） | `overview.eligibility`、`venue.*`（Googleマップ埋め込み） |
| プロポーザル | `Proposal.astro` | `sections.proposal` | `proposal.*`、`links.proposal` |
| リンク集「絶賛募集中！」 | `Recruit.astro` | `sections.recruit` | `recruit.items`（プロポーザル / スポンサー / リクエストーク） |
| スポンサー | `Sponsors.astro` | `sections.sponsors` | fortee のスポンサーAPI（ランク分け・ロゴ）＋ `sponsors.yaml`（ロゴ補完・手動追加）。見出し文言は `sponsors.*`、ランクは `sponsor_tiers` |
| スピーカー | `Speakers.astro` | `sections.speakers` | fortee の採択済みプロポーザルから自動生成。文言は `speakers.*` |
| 個人スポンサー | `IndividualSponsors.astro` | `sections.individual_sponsors` | fortee のスポンサーAPIのうち `individual_sponsors.plans` のプラン。文言は `individual_sponsors.*` |
| スタッフ | `Staff.astro` | `sections.staff` | fortee のスタッフAPI ＋ `staff.yaml`（実行委員長・副実行委員長の指定、追加・非表示）。文言は `staff.*` |
| フッター | `Footer.astro` | 常時 | 丘の背景、マスコット、SNS、過去開催リンク、`footer.*` |

## ディレクトリ構成

```
src/
  data/
    site.yaml        … イベント情報・各種URL・文言・セクション表示切替・スポンサーランク・リンク集・フッター
    sponsors.yaml    … スポンサーの補助設定（fortee にロゴが無いときのロゴ指定、fortee 未登録スポンサーの追加）
    news.yaml        … サイト独自のお知らせ（fortee のNEWSと合算表示）
    staff.yaml       … スタッフの補助設定（実行委員長・副実行委員長の指定、fortee 未登録者の追加・非表示・グループの並び順）
  assets/
    sponsors/        … スポンサーロゴ画像（自動でリサイズ・WebP化）
    staff/           … fortee 未登録スタッフの写真
  components/        … 各セクション（上の表を参照）
    icons/           … X / note / リンク集アイコン / 矢印（インラインSVG、色は文字色に追従）
    Cloud.astro      … 雲の装飾（public/images/cloud.svg を表示）
    CocContent.astro … 行動規範の本文（ページからもモーダルからも使えるよう分離）
    Timetable.astro  … タイムテーブル本体（fortee API）
    PeopleGrid.astro … 丸いアイコン＋名前の人物グリッド（スピーカー / 個人スポンサー / スタッフで共用）
  layouts/Base.astro … 共通レイアウト（head・OGP・ヘッダー・フッター）
  lib/
    data.ts          … YAML 読み込みと型定義
    fortee.ts        … fortee API からの取得（ビルド時）
    people.ts        … 人物カードの型と、X の URL から @ハンドルを取り出すヘルパー
    dummy.ts         … 開発サーバー専用のダミーデータ（preview.dummy_data）
    countdown-ogp.ts … カウントダウンページの OGP 画像を残り日数から選ぶ
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
  proposal: false            # プロポーザル
  recruit: true              # リンク集「絶賛募集中！」
  sponsors: true             # スポンサー
  speakers: true             # スピーカー
  individual_sponsors: true  # 個人スポンサー
  staff: true                # スタッフ
  timetable: false           # ナビの「タイムテーブル」リンク
```

### データがまだ無いセクションの見た目を確認する（開発サーバーのみ）

`site.yaml` の `preview.dummy_data` を `true` にすると、**開発サーバー（`npm run dev` / `docker compose up`）でだけ**、
データが空のところ（スピーカー、個人スポンサー、当日スタッフ、スポンサーの空ランクなど）がグレーの仮要素で埋まります。
`npm run build` には影響しないので、true のままでも公開物にダミーは出ません。

### リンク集「絶賛募集中！」を変える

`site.yaml` の `recruit.items` を編集します。1項目 = 1カードです。

```yaml
- icon: proposal            # proposal / sponsor / request（アイコンの種類）
  title: "プロポーザル"
  deadline: "締切：2026年10月31日（土）"
  button: "forteeで応募"
  url: "https://..."
  # wide: true              # 1列で横いっぱいに表示したいとき
  # description: |          # 説明文を入れたいとき
```

### スポンサーを追加・削除する

**fortee のスポンサー管理画面で登録・削除**すれば、再ビルド時に自動で反映されます（社名・URL・ロゴは fortee のもの）。
fortee のプラン名（gold / silver / bronze など）は `site.yaml` の `sponsor_tiers[].plans` でサイト上のランクに対応づけています。
新しいプラン名を fortee 側で作ったら、ここに追加してください（対応の無いプランはビルドログに警告が出て表示されません）。
個人スポンサーは `individual_sponsors.plans` に挙げたプラン名の人が、丸いアイコンで別セクションに出ます。

fortee にロゴがまだ無い会社に仮ロゴを出したいとき、または fortee を使わず手で載せたいときは `sponsors.yaml` を使います。

1. `src/assets/sponsors/` にロゴ画像を置く（例: `example.png`）
2. `src/data/sponsors.yaml` に追記する（fortee に同じ社名があればロゴ・URLの補完に、無ければ追加表示になります）

```yaml
- name: "株式会社サンプル"   # fortee の社名と同じにする
  tier: gold           # platinum / gold / silver / bronze
  url: "https://example.com/"
  logo: "example.png"  # 1. で置いたファイル名
```

ロゴがどこにも無い間は社名入りのグレー枠が表示されます。
ランクごとの1行あたりの枚数や見出しは `site.yaml` の `sponsor_tiers` で変えられます。

### スピーカーを載せる

fortee でプロポーザルを**採択**すると、再ビルド時に自動でスピーカーセクションに載ります（名前・@ハンドル・アバターは fortee のもの、リンク先はプロポーザル）。手作業は不要です。

### スタッフを追加・削除する

**fortee のスタッフ管理画面で登録・削除**すれば、再ビルド時に自動で反映されます（名前・リンク・アバターは fortee のもの）。
fortee のグループ名（コアスタッフ / 当日スタッフ …）がそのまま小見出しになり、並び順は `staff.yaml` の `role_order` です。

実行委員長・副実行委員長は `staff.yaml` の `leaders` に X のハンドルで指定します。該当する人が fortee のどのグループにいても、先頭に大きく役職バッジ付きで表示されます。

```yaml
leaders:
  - role: "実行委員長"
    twitter: "YKanoh65"
  - role: "副実行委員長"
    twitter: "ippey_s"
```

fortee に登録しない人を載せたい場合だけ `extra` に追記します。fortee に同じハンドルか同じ名前の人が登録されると `extra` 側は自動で無視されるので、二重表示にはなりません。

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
| `sponsors.*` / `speakers.*` / `individual_sponsors.*` / `staff.*` | 各セクションの見出し・説明文（`description` は1要素1行）・空のときの文言 |
| `preview.dummy_data` | 開発サーバーでだけ、空のセクションをダミーで埋める |
| `footer.*` | 運営団体名・コピーライト・過去開催リンク |
| `analytics.gtm_container_id` | Google タグマネージャーのコンテナID（`GTM-XXXXXXX`）。空なら計測しない。本番ビルドのときだけタグが入る |
| `analytics.ga_measurement_id` | GTM を使わず GA4 を直接入れる場合の測定ID（`G-XXXXXXXXXX`）。GTM と併用しない |
| `redirects.<キー>` | 短縮URL `/go/<キー>/` の転送先（印刷物のQRコード用）。UTM の付け方は [docs/utm.md](docs/utm.md) |

### デザイン画像を差し込む

`public/images/` に決まったファイル名で置くだけです。一覧は [public/images/README.md](public/images/README.md) を参照してください。
現在入っているもの: ヒーローロゴ、日付、ヘッダーロゴ、雲、フッターマスコット、OGP、favicon。
**街並みシルエット（`skyline.*`）は未着**で、今は単純な丘の形を表示しています。

### アクセス解析（GA4）と UTM

`site.yaml` の `analytics.gtm_container_id` に GTM のコンテナIDを入れると全ページにタグが入ります。GA4 の測定IDは GTM 側で「Google タグ」として設定してください。
SNS・note・fortee・チラシなど導線ごとに付けるパラメーターのルールと発行済みURLの一覧は [docs/utm.md](docs/utm.md) にまとめています。
来年以降も同じ GA4 プロパティと同じルールをそのまま使う前提です。

## fortee 連携について

ビルド時に以下の公開APIを取得し、HTMLに焼き込みます。取得に失敗した場合は空扱いになり、ビルドは失敗しません。

- `https://fortee.jp/phpcon-kansai2026/api/news`
- `https://fortee.jp/phpcon-kansai2026/api/staff?type=simple`
- `https://fortee.jp/phpcon-kansai2026/api/sponsors`（スポンサー・個人スポンサー。ロゴは fortee にアップロードされると `avatar` として付く）
- `https://fortee.jp/phpcon-kansai2026/api/proposals/accepted`（スピーカー）
- `https://fortee.jp/phpcon-kansai2026/api/timetable`

fortee 側の更新は **再ビルドするまで反映されません**。そのため `.github/workflows/daily-rebuild.yml` で毎日 0:05 JST に Netlify の Build Hook を叩いて再ビルドしています（カウントダウンページの OGP 画像の日次更新も兼ねる）。
初回だけ、Netlify で Build Hook を発行し、その URL を GitHub リポジトリの Secrets に `NETLIFY_BUILD_HOOK_URL` として登録してください（手順はワークフローファイル冒頭のコメント参照）。手動で再ビルドしたいときは Actions タブから "Daily rebuild" を Run workflow します。

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
- スポンサーロゴの fortee へのアップロード（無い間は社名入りのグレー枠）
- 副実行委員長の fortee スタッフ登録（登録されるまで `staff.yaml` の `extra` で暫定表示）
- 公開先は Netlify（main へのマージで自動デプロイ）。定期再ビルドは `.github/workflows/daily-rebuild.yml`（要 Secrets 設定）
