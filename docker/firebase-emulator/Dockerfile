FROM node:24

# Java 11以上をインストール（Firebase Emulatorに必要）
RUN apt-get update && \
    apt-get install -y openjdk-17-jre-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Firebase CLIをグローバルインストール
RUN npm install -g firebase-tools

# 作業ディレクトリを設定
WORKDIR /app

# ローカルのプロジェクトファイルをコンテナにコピー
COPY . /app

# コンテナが起動時に実行するコマンドを定義
# デフォルトで全サービスのエミュレーターを起動（必要に応じて変更）
CMD ["firebase", "emulators:start", "--export-on-exit", "data", "--import", "data"]