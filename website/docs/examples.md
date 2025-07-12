# 使用例

このページでは、OpenUNIPAの一般的なタスクやワークフローの実用的な例を提供します。

## 基本例

### 認証とデータ取得

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

// ログインして全データを取得
await unipa.account.login();

const timetable = await unipa.timetable.fetch();
const grades = await unipa.grades.fetch();
const attendance = await unipa.attendance.fetch();
const notices = await unipa.notice.fetch();

console.log(`GPA: ${grades.getGPA()}`);
console.log(`出席率: ${attendance.getOverallAttendanceRate()}%`);
console.log(`未読掲示: ${notices.getUnreadNotices().length}件`);
```

### 環境設定

`.env`ファイルを作成：

```env
UNIPA_USER_ID=あなたの学生番号
UNIPA_PLAIN_PASSWORD=あなたのパスワード
```

環境変数を読み込み：

```typescript
import 'dotenv/config';
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});
```

## 成績管理

### 成績・GPA確認

```typescript
const grades = await unipa.grades.fetch();

console.log(`現在のGPA: ${grades.getGPA()}`);
console.log(`取得単位: ${grades.getTotalEarnedCredits()}`);

// 優秀な成績の科目を表示
const excellentGrades = grades.filter(grade => 
  ['秀', 'S', 'A'].includes(grade.evaluation)
);
console.log(`優秀な成績: ${excellentGrades.length}科目`);
```

## 出席管理

### 出席アラートシステム

```typescript
const attendance = await unipa.attendance.fetch();

const CRITICAL_THRESHOLD = 70;
const WARNING_THRESHOLD = 80;

const overallRate = attendance.getOverallAttendanceRate();

if (overallRate < CRITICAL_THRESHOLD) {
  console.log('🚨 警告: 出席率が危険レベルです');
} else if (overallRate < WARNING_THRESHOLD) {
  console.log('⚠️ 注意: 出席率を改善してください');
} else {
  console.log('✅ 良好: 出席率は問題ありません');
}

// 出席率が低い科目
const lowAttendance = attendance.getLowAttendanceSubjects(70);
lowAttendance.forEach(subject => {
  console.log(`${subject.name}: ${subject.attendanceRate}%`);
});
```

## 掲示管理

### 重要掲示チェッカー

```typescript
const notices = await unipa.notice.fetch();

// 未読の重要掲示
const importantUnread = notices.filter({ 
  priority: 'high', 
  isRead: false 
});

console.log(`未読の重要掲示: ${importantUnread.length}件`);

// 期限が近い掲示（7日以内）
const upcoming = notices.getUpcomingDeadlines(7);
if (upcoming.length > 0) {
  console.log('🚨 期限が近い掲示:');
  upcoming.forEach(notice => {
    const daysLeft = Math.ceil((notice.deadline - new Date()) / (1000 * 60 * 60 * 24));
    console.log(`- ${notice.title}: あと${daysLeft}日`);
  });
}
```

## データエクスポート

### 全データのエクスポート

```typescript
import fs from 'fs';

async function exportAllData() {
  await unipa.account.login();
  
  const timetable = await unipa.timetable.fetch();
  const grades = await unipa.grades.fetch();
  const attendance = await unipa.attendance.fetch();
  const notices = await unipa.notice.fetch();

  const exportData = {
    exportedAt: new Date().toISOString(),
    academic: {
      gpa: grades.getGPA(),
      credits: grades.getTotalEarnedCredits(),
      attendanceRate: attendance.getOverallAttendanceRate(),
    },
    data: {
      timetable,
      grades,
      attendance: attendance.getSubjectSummaries(),
      notices: notices.getSummary(),
    },
  };

  const filename = `unipa_export_${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
  
  console.log(`✅ エクスポート完了: ${filename}`);
}
```

## 開発・テスト

### スタブモード

```typescript
// 実際のUNIPAアクセスなしでテスト
const unipa = OpenUNIPA({
  username: 'test_user',
  password: 'test_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    stub: true,  // テストデータを使用
  }
});

// スタブモードではログイン不要
const timetable = await unipa.timetable.fetch();
const grades = await unipa.grades.fetch();

console.log('🧪 スタブデータでテスト中:');
console.log(`GPA: ${grades.getGPA()}`);
```

## 実行方法

### tsx使用（推奨）

```bash
npm install -g tsx
tsx example-script.ts
```

### ts-node使用

```bash
npm install -g ts-node
ts-node example-script.ts
```

### Bun使用

```bash
bun run example-script.ts
```

詳細な例については、OpenUNIPAリポジトリの`examples/`ディレクトリを確認してください。