# OpenUNIPA Examples

このディレクトリには、OpenUNIPAライブラリの使用例が含まれています。

## ディレクトリ構成

```
examples/
├── README.md          # このファイル
├── .env.example       # 環境変数のサンプル
├── typescript/        # TypeScriptのサンプル
│   ├── stub-demo.ts   # スタブモードのデモ（認証不要）
│   └── real-api-demo.ts # 実際のAPIを使用するデモ
└── bun/              # Bunランタイム用のサンプル
    └── ...
```

## 使い方

### 1. 環境変数の設定（実際のAPIを使用する場合）

```bash
# .env.exampleを.envにコピー
cp .env.example .env

# .envファイルを編集して認証情報を設定
# UNIPA_USER_ID=あなたのユーザーID
# UNIPA_PLAIN_PASSWORD=あなたのパスワード
```

### 2. サンプルの実行

#### スタブモード（テストデータ使用）
```bash
npx tsx typescript/stub-demo.ts
```

#### 実際のAPI使用
```bash
npx tsx typescript/real-api-demo.ts
```

## サンプルの説明

### stub-demo.ts
- 実際のAPIを使用せず、ローカルのHTMLファイルからデータを読み込みます
- 認証情報不要で動作確認が可能
- 開発・テスト用

### real-api-demo.ts
- 実際のUNIPAシステムに接続
- 環境変数から認証情報を読み込み
- 成績情報、時間割などの実データを取得

## 注意事項

- 認証情報は絶対にコードに直接記載しないでください
- .envファイルはGitにコミットされません（.gitignoreに含まれています）
- 実際のAPIを使用する際は、大学のネットワークに接続されている必要がある場合があります