# はじめに

OpenUNIPAは、近畿大学のUNIPAシステムにプログラムからアクセスするためのオープンソースライブラリです。

## 特徴

- **🚀 簡単セットアップ**: わずか数行のコードでUNIPAシステムにアクセス
- **📊 豊富な機能**: 時間割、成績、出席状況、掲示情報の取得と分析
- **🔒 型安全**: TypeScriptで書かれており、型安全性を確保
- **🧪 テスト対応**: スタブモードで実際のAPIを呼ばずに開発・テスト可能

## クイックスタート

### 1. インストール

```bash
npm install open-unipa
# または
yarn add open-unipa
```

### 2. 基本的な使用方法

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

// UNIPAセッションを作成
const unipa = OpenUNIPA({
  username: 'your_username',
  password: 'your_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

// ログイン
await unipa.account.login();

// 時間割を取得
const timetable = await unipa.timetable.fetch();
timetable.print(); // コンソールに表示

// 成績を取得
const grades = await unipa.grades.fetch();
console.log(`GPA: ${grades.getGPA()}`);

// 出席状況を取得
const attendance = await unipa.attendance.fetch();
console.log(`出席率: ${attendance.getOverallAttendanceRate()}%`);

// 掲示情報を取得
const notices = await unipa.notice.fetch();
notices.print(); // サマリーを表示
```

### 3. 環境変数での設定

`.env` ファイルを作成して認証情報を管理：

```env
UNIPA_USER_ID=your_username
UNIPA_PLAIN_PASSWORD=your_password
```

```typescript
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});
```

## 次のステップ

- [インストールガイド](./installation) - 詳細なセットアップ手順
- [設定](./configuration) - 高度な設定オプション
- [API リファレンス](./api/overview) - 全機能の詳細説明
- [サンプル](./examples) - 実用的な使用例