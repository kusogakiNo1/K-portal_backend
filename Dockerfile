# Railwayにnodeのdockerコンテナを作るにあたって必要なイメージを作成するためのDockerfile
# 1. ベースイメージ（Node.js）
FROM node:24-slim

# 2. 作業ディレクトリ作成
WORKDIR /app

# 3. パッケージ管理ファイルをコピーしてインストール
COPY package*.json ./
RUN npm install

# 4. ソースコードをコピー
COPY . .

# 5. ポートの指定（Railwayは環境変数 PORT を使います）
EXPOSE ${PORT:-9500}

# 6. サーバー起動（本番は dev ではなく start ！）
CMD ["npm", "run", "start"]