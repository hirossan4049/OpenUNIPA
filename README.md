<h1 align="center">
  OpenUNIPA
</h1>

<a href="https://pkg-size.dev/open-unipa"><img src="https://pkg-size.dev/badge/install/1358184" title="Install size for open-unipa"></a>
<a href="https://pkg-size.dev/open-unipa"><img src="https://pkg-size.dev/badge/bundle/260109" title="Bundle size for open-unipa"></a>

- SIMPLE
- FAST
- EASY

| Node.js | Swift | C | C++ | Java |
| --- | --- | --- | --- | --- |
| 🚧  | ✗   | ✗   | ✗  | ✗   |

## Requirements
- node20
- yarn@3.4.1

## Installation

```bash
$ yarn add open-unipa
```

## Usage

### 環境変数の設定

1. `.env.example` を `.env` にコピー:
   ```bash
   cp examples/.env.example .env
   ```

2. `.env` ファイルを編集して認証情報を設定:
   ```env
   UNIPA_USER_ID=your_unipa_username
   UNIPA_PLAIN_PASSWORD=your_unipa_password
   ```

### コード例

```ts
import { OpenUNIPA, UnivList } from 'open-unipa';

// 環境変数から認証情報を取得
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
})

// ログイン
await unipa.account.login()

const timetable = await unipa.timetable.fetch()
timetable.print()
console.log(timetable.items)
// [{
//   week: 0, // 0: 月曜日, 1: 火曜日...
//   period: 1, // 0: 1限目, 1: 2限目...
//   subject: '基礎線形代数学１', // 科目名
//   class: 'Aクラス', // クラス名?
//   teacher: '山田 武士', // 教員名?
//   room: 'E-101', // 教室名?
//   syllabus: { year: '2024', id: 'N1124C0218' } // シラバス情報
// },
```

### デモの実行

スタブモード（テストデータ使用）:
```bash
npx tsx examples/typescript/stub-demo.ts
```

実際のデータ使用（要環境変数設定）:
```bash
npx tsx examples/typescript/real-api-demo.ts
```

## 主な機能

- **ログイン認証**: UNIPAシステムへの自動ログイン
- **時間割取得**: 現在の時間割データを取得・表示
- **成績照会**: 成績データの取得、GPA計算、単位集計
- **メニュー操作**: UNIPAの各種メニューへのアクセス

## 計測

<table><thead>
  <tr>
    <th rowspan="2">計測方法<br></th>
    <th colspan="2">stub</th>
    <th colspan="2">real(有線)<br></th>
    <th colspan="2">real(大学WiFi)</th>
  </tr>
  <tr>
    <th>time bun run</th>
    <th>console.time</th>
    <th>time bun run</th>
    <th>console.time</th>
    <th>time bun run</th>
    <th>console.time</th>
  </tr></thead>
<tbody>
  <tr>
    <td>login -&gt; timetable</td>
    <td>0.2s<br></td>
    <td>86.47ms<br></td>
    <td></td>
    <td></td>
    <td>1.897s</td>
    <td></td>
  </tr>
</tbody>
</table>

## License

todo.