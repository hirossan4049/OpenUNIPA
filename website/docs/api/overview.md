# API リファレンス

OpenUNIPAライブラリは、近畿大学のUNIPAシステムの各機能にアクセスするためのコントローラーベースのアーキテクチャを採用しています。

## アーキテクチャ概要

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: 'your_username',
  password: 'your_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

// 各コントローラーが利用可能
unipa.account     // 認証・ログイン
unipa.timetable   // 時間割
unipa.grades      // 成績
unipa.attendance  // 出席状況
unipa.notice      // 掲示情報
unipa.menu        // メニュー操作
```

## コントローラー一覧

| コントローラー | 説明 | 主な機能 |
|---------------|------|----------|
| [AccountController](./account-controller) | 認証・ログイン管理 | ログイン、ログアウト |
| [TimetableController](./timetable-controller) | 時間割管理 | 時間割取得、表示 |
| [GradesController](./grades-controller) | 成績管理 | 成績取得、GPA計算 |
| [AttendanceController](./attendance-controller) | 出席管理 | 出席率計算、統計 |
| [NoticeController](./notice-controller) | 掲示情報管理 | お知らせ取得、フィルタリング |

## 共通パターン

### 1. データ取得

全てのコントローラーは `fetch()` メソッドでデータを取得します：

```typescript
// 基本的なパターン
const result = await unipa.controller.fetch();
result.print(); // コンソールに表示
```

### 2. 結果オブジェクト

`fetch()` は結果オブジェクトを返し、様々なメソッドが利用可能です：

```typescript
const grades = await unipa.grades.fetch();

// 統計情報
grades.getGPA();                    // GPA計算
grades.getTotalEarnedCredits();     // 取得単位数

// フィルタリング
grades.getPassedGrades();           // 合格科目のみ
grades.getGradesByCategory('必修'); // カテゴリ別

// 表示
grades.print();                     // サマリー表示
```

### 3. デバッグモード

開発・テスト用の機能：

```typescript
const unipa = OpenUNIPA({
  username: 'test',
  password: 'test',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  debug: {
    stub: true,      // スタブモード（テストデータ使用）
    saveHTML: false  // HTML保存（デバッグ用）
  }
});
```

## 型システム

OpenUNIPAは完全にTypeScriptで書かれており、全ての機能で型安全性が保証されています：

```typescript
import type { 
  GradeItem, 
  AttendanceItem, 
  NoticeItem,
  TimetableItem 
} from 'open-unipa';

// 型安全なデータ操作
const grades: GradeItem[] = result.items;
```

## エラーハンドリング

```typescript
try {
  await unipa.account.login();
  const grades = await unipa.grades.fetch();
} catch (error) {
  console.error('UNIPA API Error:', error);
  // エラー処理
}
```

## 非同期処理

全てのAPI呼び出しは非同期です：

```typescript
// 複数のデータを並行取得
const [timetable, grades, attendance] = await Promise.all([
  unipa.timetable.fetch(),
  unipa.grades.fetch(),
  unipa.attendance.fetch(),
]);
```

## 次のステップ

各コントローラーの詳細については、個別のAPIリファレンスページをご覧ください：

- [AccountController](./account-controller) - 認証とログイン
- [TimetableController](./timetable-controller) - 時間割管理
- [GradesController](./grades-controller) - 成績管理
- [AttendanceController](./attendance-controller) - 出席管理
- [NoticeController](./notice-controller) - 掲示情報管理