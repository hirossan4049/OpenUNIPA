# インストール

このページでは、OpenUNIPAライブラリのインストールと初期設定について説明します。

## システム要件

- **Node.js**: 18.0以上
- **npm/yarn**: 最新版推奨
- **TypeScript**: 5.0以上（TypeScriptプロジェクトの場合）

## インストール

### npm を使用

```bash
npm install open-unipa
```

### yarn を使用

```bash
yarn add open-unipa
```

### pnpm を使用

```bash
pnpm add open-unipa
```

## 環境設定

### 1. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成：

```env
# UNIPA認証情報
UNIPA_USER_ID=your_student_id
UNIPA_PLAIN_PASSWORD=your_password

# オプション設定
UNIPA_DEBUG_STUB=false
UNIPA_DEBUG_SAVE_HTML=false
```

### 2. TypeScript設定（TypeScriptプロジェクトの場合）

`tsconfig.json` でESモジュールを有効にします：

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## 初期設定の確認

インストールが正常に完了したか確認します：

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

// スタブモードでテスト
const unipa = OpenUNIPA({
  username: 'test',
  password: 'test',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  debug: { stub: true, saveHTML: false }
});

console.log('OpenUNIPA が正常にインポートされました！');
```

## トラブルシューティング

### よくある問題

#### Node.jsバージョンエラー
```
Error: OpenUNIPA requires Node.js 18.0 or higher
```

**解決方法**: Node.jsを最新版にアップデートしてください。

#### TypeScriptエラー
```
Cannot find module 'open-unipa'
```

**解決方法**: 型定義ファイルが含まれているため、`@types/open-unipa` は不要です。

#### 認証エラー
```
Error: Invalid credentials
```

**解決方法**: 
1. ユーザーIDとパスワードを確認
2. UNIPAサイトで手動ログインできるか確認
3. パスワードに特殊文字が含まれている場合は適切にエスケープ

## 次のステップ

- [はじめに](./getting-started) - 基本的な使用方法
- [設定](./configuration) - 詳細な設定オプション
- [サンプル](./examples) - 実用的な使用例