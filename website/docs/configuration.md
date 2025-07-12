# 設定

## 基本設定

OpenUNIPA関数は以下のプロパティを持つ設定オブジェクトを受け取ります：

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: 'ユーザー名',
  password: 'パスワード',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  // オプションのデバッグ設定
  DEBUG: {
    stub: false,
    saveHTML: false,
  }
});
```

## 必須パラメータ

### `username`
- **型**: `string`
- **説明**: UNIPAのユーザー名/学生番号

### `password`
- **型**: `string`
- **説明**: UNIPAのパスワード

### `univ`
- **型**: `University`
- **説明**: 大学設定オブジェクト

## 大学設定

### 対応大学

#### 近畿大学

```typescript
// 東大阪キャンパス
UnivList.KINDAI.HIGASHI_OSAKA

// 大阪狭山キャンパス  
UnivList.KINDAI.OSAKA_SAYAMA
```

## デバッグ設定

`DEBUG`オブジェクトは開発・テスト機能をサポートします：

```typescript
interface DebugOptions {
  stub?: boolean;      // 実際のリクエストの代わりにローカルスタブファイルを使用
  saveHTML?: boolean;  // HTMLレスポンスをスタブファイルとして保存
}
```

### スタブモード

実際のネットワークリクエストを行わずにテストするためのスタブモードを有効にします：

```typescript
const unipa = OpenUNIPA({
  username: 'test_user',
  password: 'test_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    stub: true,  // スタブデータを使用
  }
});
```

### HTML保存モード

スタブファイル作成のためにHTMLレスポンスをキャプチャします：

```typescript
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    saveHTML: true,  // stub/ディレクトリにレスポンスを保存
  }
});
```

## 環境変数

### 必須変数

```env
UNIPA_USER_ID=あなたのUNIPAユーザー名
UNIPA_PLAIN_PASSWORD=あなたのUNIPAパスワード
```

### 環境変数の読み込み

```typescript
import 'dotenv/config';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});
```

## セッション管理

OpenUNIPA関数は以下を含むセッションオブジェクトを返します：

```typescript
interface Session {
  account: AccountController;      // 認証
  timetable: TimetableController;  // 時間割データ
  grades: GradesController;        // 成績情報
  attendance: AttendanceController; // 出席記録
  notice: NoticeController;        // 大学の掲示
  menu: MenuController;            // メニューナビゲーション
  fs: FSController;                // ファイルシステム操作
}
```

## エラーハンドリング

エラーハンドリングの設定：

```typescript
try {
  await unipa.account.login();
  const timetable = await unipa.timetable.fetch();
} catch (error) {
  console.error('UNIPA操作が失敗しました:', error);
}
```

## ベストプラクティス

1. **環境変数**: 認証情報には常に環境変数を使用
2. **エラーハンドリング**: API呼び出しをtry-catchブロックで囲む
3. **レート制限**: ブロックを防ぐため連続リクエストを避ける
4. **スタブモード**: 開発・テストにはスタブモードを使用
5. **安全な保存**: 認証情報をバージョン管理にコミットしない