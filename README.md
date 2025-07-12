# OpenUNIPA

<div align="center">

**近畿大学UNIPA用の高速・軽量TypeScriptライブラリ**

[![npm](https://img.shields.io/npm/v/open-unipa)](https://www.npmjs.com/package/open-unipa)
[![size](https://pkg-size.dev/badge/bundle/260109)](https://pkg-size.dev/open-unipa)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[ドキュメント](https://hirossan4049.github.io/OpenUNIPA/) • [使用例](#使用例) • [API](#api)

</div>

## 特徴

- **高速** - fetch-APIによる高速なレスポンス
- **シンプル** - 直感的なAPI
- **型安全** - TypeScript完全対応
- **包括的** - 時間割・成績・出席・掲示に対応

## インストール

```bash
npm install open-unipa
```

## 使い方

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: 'ユーザー名',
  password: 'パスワード',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

await unipa.account.login();
const timetable = await unipa.timetable.fetch();
timetable.print();
```

## 使用例

### 成績・GPA確認

```typescript
const grades = await unipa.grades.fetch();
console.log(`GPA: ${grades.getGPA()}`);
console.log(`取得単位: ${grades.getTotalEarnedCredits()}`);
```

### 出席状況管理

```typescript
const attendance = await unipa.attendance.fetch();
console.log(`出席率: ${attendance.getOverallAttendanceRate()}%`);

const low = attendance.getLowAttendanceSubjects(70);
low.forEach(s => console.log(`${s.name}: ${s.attendanceRate}%`));
```

### 掲示情報管理

```typescript
const notices = await unipa.notice.fetch();
const unread = notices.filter({ priority: 'high', isRead: false });
console.log(`未読: ${unread.length}件`);
```

## API

| コントローラー | 説明 |
|------------|-------------|
| `account` | 認証・ログイン |
| `timetable` | 時間割 |
| `grades` | 成績・GPA |
| `attendance` | 出席状況 |
| `notice` | 掲示情報 |
| `menu` | UNIPAナビゲーション |

## 動作環境

- Node.js 18+
- 近畿大学UNIPAアカウント

## ライセンス

MIT