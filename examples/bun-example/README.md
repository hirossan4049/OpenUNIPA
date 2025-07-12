# OpenUNIPA Bun Example

Bunを使用したOpenUNIPAの使用例です。

## セットアップ

```bash
# 依存関係をインストール
bun install

# 実行
bun run dev
```

## 環境変数

`.env`ファイルを作成して認証情報を設定：

```env
UNIPA_USER_ID=あなたの学生番号
UNIPA_PLAIN_PASSWORD=あなたのパスワード
```

## 実行方法

### スタブモード（デフォルト）
```bash
bun run dev
```

### 実際のAPI使用
`index.ts`でstubをfalseに変更してから実行：
```typescript
DEBUG: {
  stub: false, // 実際のAPIを使用
}
```

## 特徴

- 🚀 **高速** - Bunの高速な実行環境
- 🔧 **シンプル** - 最小限の設定
- 🛡️ **安全** - デフォルトでスタブモード