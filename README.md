# OpenUNIPA

<div align="center">

**近畿大学UNIPA用の高速・軽量TypeScriptライブラリ**

[![npm version](https://badge.fury.io/js/open-unipa.svg)](https://badge.fury.io/js/open-unipa)
[![Install size](https://pkg-size.dev/badge/install/1358184)](https://pkg-size.dev/open-unipa)
[![Bundle size](https://pkg-size.dev/badge/bundle/260109)](https://pkg-size.dev/open-unipa)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/hirossan4049/OpenUNIPA/blob/main/LICENSE)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen.svg)](https://hirossan4049.github.io/OpenUNIPA/)

[📖 ドキュメント](https://hirossan4049.github.io/OpenUNIPA/) | [🚀 クイックスタート](#クイックスタート) | [💡 使用例](#使用例) | [📦 npm](https://www.npmjs.com/package/open-unipa)

</div>

## ✨ 特徴

- 🚀 **高速** - 軽量設計で素早いレスポンス
- 📱 **シンプル** - 直感的で使いやすいAPI
- 🛡️ **型安全** - TypeScriptで完全に型付け
- 🔧 **テスト対応** - スタブモードでオフライン開発
- 📚 **包括的** - 時間割、成績、出席、掲示まで対応

## 🎯 対応機能

| 機能 | 状況 | 説明 |
|------|------|------|
| 🔐 認証ログイン | ✅ | UNIPAシステムへの安全なログイン |
| 📅 時間割取得 | ✅ | 授業スケジュールの取得・表示 |
| 📊 成績照会 | ✅ | GPA計算・単位集計 |
| 📋 出席状況 | ✅ | 出席率計算・科目別管理 |
| 📢 掲示情報 | ✅ | お知らせ・掲示板の取得・管理 |
| 🗂️ メニュー操作 | ✅ | UNIPAナビゲーション |

## 🚀 クイックスタート

### インストール

```bash
# npm
npm install open-unipa

# yarn
yarn add open-unipa

# pnpm
pnpm add open-unipa
```

### 基本的な使用方法

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

// UNIPAセッションを作成
const unipa = OpenUNIPA({
  username: 'your_username',
  password: 'your_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

// ログインして時間割を取得
await unipa.account.login();
const timetable = await unipa.timetable.fetch();
timetable.print();
```

## 💡 使用例

### 🎓 成績とGPAの確認

```typescript
const grades = await unipa.grades.fetch();

console.log(`現在のGPA: ${grades.getGPA()}`);
console.log(`取得単位数: ${grades.getTotalEarnedCredits()}`);
console.log(`履修科目数: ${grades.getSubjectCount()}`);

// 優秀な成績の科目を表示
const excellentGrades = grades.filter(grade => 
  ['秀', 'S', 'A'].includes(grade.evaluation)
);
```

### 📋 出席状況の管理

```typescript
const attendance = await unipa.attendance.fetch();

// 総合出席率
console.log(`総合出席率: ${attendance.getOverallAttendanceRate()}%`);

// 出席率が低い科目を警告
const lowAttendance = attendance.getLowAttendanceSubjects(70);
if (lowAttendance.length > 0) {
  console.log('⚠️ 出席率が低い科目:');
  lowAttendance.forEach(subject => {
    console.log(`- ${subject.name}: ${subject.attendanceRate}%`);
  });
}
```

### 📢 掲示情報の確認

```typescript
const notices = await unipa.notice.fetch();

// 未読の重要掲示をチェック
const importantUnread = notices.filter({
  priority: 'high',
  isRead: false
});

console.log(`未読の重要掲示: ${importantUnread.length}件`);

// 期限が近い掲示を警告
const upcoming = notices.getUpcomingDeadlines(7); // 7日以内
if (upcoming.length > 0) {
  console.log('🚨 期限が近い掲示:');
  upcoming.forEach(notice => {
    console.log(`- ${notice.title} (期限: ${notice.deadline})`);
  });
}
```

## 🛠️ 開発・テスト

### 環境設定

```bash
# 環境変数ファイルをコピー
cp examples/.env.example .env

# 認証情報を設定
echo "UNIPA_USER_ID=your_username" >> .env
echo "UNIPA_PLAIN_PASSWORD=your_password" >> .env
```

### サンプル実行

```bash
# スタブモード（テストデータ使用）
npx tsx examples/typescript/account-example.ts

# 実際のAPI使用
npx tsx examples/typescript/timetable-example.ts
npx tsx examples/typescript/grades-example.ts
npx tsx examples/typescript/attendance-example.ts
npx tsx examples/typescript/notice-example.ts
```

## 📚 ドキュメント

詳細なAPIリファレンスと使用例は[公式ドキュメント](https://hirossan4049.github.io/OpenUNIPA/)をご覧ください。

- [📖 はじめに](https://hirossan4049.github.io/OpenUNIPA/docs/getting-started)
- [⚙️ インストール](https://hirossan4049.github.io/OpenUNIPA/docs/installation)
- [🔧 設定](https://hirossan4049.github.io/OpenUNIPA/docs/configuration)
- [📝 使用例](https://hirossan4049.github.io/OpenUNIPA/docs/examples)
- [📋 APIリファレンス](https://hirossan4049.github.io/OpenUNIPA/docs/api/overview)

## 🏗️ システム要件

- **Node.js**: 18.0.0以降
- **TypeScript**: 4.5以降（TypeScriptプロジェクトの場合）

## 🎯 対応大学

現在は近畿大学のみ対応:

- 🏫 近畿大学 東大阪キャンパス
- 🏫 近畿大学 大阪狭山キャンパス

## 🚀 パフォーマンス

| 動作環境 | ログイン〜時間割取得 | 
|----------|---------------------|
| スタブモード | ~86ms |
| 実API（有線） | ~1.2s |
| 実API（学内WiFi） | ~1.9s |

## 🤝 コントリビューション

プルリクエストや Issue は大歓迎です！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

[MIT License](https://github.com/hirossan4049/OpenUNIPA/blob/main/LICENSE) - 詳細は LICENSE ファイルをご覧ください。

## ⚠️ 免責事項

このライブラリは教育目的で開発されており、近畿大学の公式ツールではありません。利用は自己責任でお願いします。

---

<div align="center">

**Made with ❤️ for Kindai University students**

[⭐ Star this repo](https://github.com/hirossan4049/OpenUNIPA) | [🐛 Report Bug](https://github.com/hirossan4049/OpenUNIPA/issues) | [💡 Request Feature](https://github.com/hirossan4049/OpenUNIPA/issues)

</div>