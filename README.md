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

// 時間割取得
const timetable = await unipa.timetable.fetch()
timetable.print()

// 成績照会
const grades = await unipa.grades.fetch()
console.log(`GPA: ${grades.getGPA()}`)
console.log(`取得単位数: ${grades.getTotalEarnedCredits()}`)

// 出席状況確認
const attendance = await unipa.attendance.fetch()
console.log(`総合出席率: ${attendance.getOverallAttendanceRate()}%`)
attendance.print() // 科目別出席状況を表示

// 掲示情報取得
const notices = await unipa.notice.fetch()
notices.print() // サマリーと最新情報を表示
notices.printAll() // 全件表示

// 未読の重要な掲示を取得
const importantUnread = notices.filter({ 
  priority: 'high', 
  isRead: false 
})
console.log(`未読の重要掲示: ${importantUnread.length}件`)
```

### デモの実行

利用可能な例:

```bash
# 基本的なデモ
npx tsx examples/typescript/stub-demo.ts      # スタブモード（テストデータ）
npx tsx examples/typescript/real-api-demo.ts  # 実際のAPI使用

# 機能別の例
npx tsx examples/typescript/timetable-example.ts   # 時間割
npx tsx examples/typescript/grades-example.ts      # 成績照会
npx tsx examples/typescript/attendance-example.ts  # 出席状況
npx tsx examples/typescript/notice-example.ts      # 掲示情報
```

## 主な機能

- **ログイン認証**: UNIPAシステムへの自動ログイン
- **時間割取得**: 現在の時間割データを取得・表示
- **成績照会**: 成績データの取得、GPA計算、単位集計
- **出席状況確認**: 授業別の出席状況を取得・集計、出席率計算
- **掲示情報取得**: お知らせ・掲示板情報の取得、フィルタリング、既読管理
- **メニュー操作**: UNIPAの各種メニューへのアクセス

## 機能詳細

### 出席状況確認 (AttendanceController)
- 科目別・全体の出席率計算
- 出席状況の種別: 出席、欠席、遅刻、早退、公欠、忌引、病欠、補講、休講
- 期間指定での出席データ取得
- 出席率が低い科目の抽出

### 掲示情報取得 (NoticeController)
- カテゴリ別管理: 重要、一般、事務、学生、教務、就活、その他
- 優先度設定: high, normal, low
- フィルタリング機能:
  - カテゴリ、優先度、日付範囲
  - キーワード検索
  - 既読/未読フィルタ
- 期限管理と期限が近い掲示の警告
- 既読/未読の一括管理
- ソート機能（日付順、優先度順）

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

## APIリファレンス

### AttendanceController
```ts
// 出席データを取得
const attendance = await unipa.attendance.fetch()

// 結果オブジェクトのメソッド
attendance.getOverallAttendanceRate()        // 総合出席率
attendance.getSubjectSummaries()              // 科目別サマリー
attendance.getSubjectAttendance(subjectName)  // 特定科目の出席記録
attendance.getStatusCounts()                  // 出席状況別の集計
attendance.getLowAttendanceSubjects(threshold) // 出席率が低い科目
attendance.getAttendanceByDateRange(from, to) // 期間指定で取得
attendance.print()                            // コンソールに表示
```

### NoticeController
```ts
// 掲示情報を取得
const notices = await unipa.notice.fetch()

// 結果オブジェクトのメソッド
notices.getSummary()                    // サマリー情報
notices.filter(filterOptions)           // フィルタリング
notices.getByCategory(category)         // カテゴリ別取得
notices.getUnreadNotices()              // 未読掲示
notices.getHighPriorityNotices()        // 重要掲示
notices.getNoticesWithDeadline()        // 期限付き掲示
notices.getUpcomingDeadlines(days)     // 期限が近い掲示
notices.sortByDate(ascending?)          // 日付でソート
notices.sortByPriority()                // 優先度でソート
notices.markAsRead(noticeId)            // 既読にマーク
notices.markAllAsRead()                 // 全て既読にマーク
notices.print()                         // サマリー表示
notices.printAll()                      // 全件表示
```

## License

todo.