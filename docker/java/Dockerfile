# # マルチステージビルド方式でイメージ作成
# # ベースイメージとして OpenJDK 21 を使用
FROM mcr.microsoft.com/openjdk/jdk:21-ubuntu AS build

# 作業ディレクトリの設定
WORKDIR /app

# pom.xmlをコピー
COPY ./pom.xml ./

# Mavenのインストール
RUN apt-get update && \
    apt-get install -y maven && \
    apt-get clean

# 依存関係をダウンロード
RUN mvn dependency:go-offline

# ソースコードをコピー
COPY ./src ./src
# アプリケーションをビルド
RUN mvn clean package -e

# # 実行用のイメージ（ベースイメージと同じイメージです）
FROM mcr.microsoft.com/openjdk/jdk:21-ubuntu

# Maven、gitのインストール
RUN apt-get update && \
    apt-get install -y maven git && \
    apt-get clean

# ビルドしたJARファイルをコピー
COPY --from=build /app/target/*.jar app.jar

# コンテナ内のポート8080を開放
# MEMO：あくまで宣言に過ぎないので、docker-compose.yaml等で別途ポートマッピングする必要がある
EXPOSE 8080

# 作業ディレクトリの設定（exec bashでコンテナ内部に入った時にデフォルトで開かれる階層の設定）
WORKDIR /app

# アプリケーションを実行
# TODO：本番環境、ステージング環境ではコンテナ作成時のビルドは必須（いちいち各環境に入ってビルドするのは手間がかかるため）
# 　　　ただし、開発環境では実装→確認のためにビルドを何回も行うため、必ずしもコンテナ作成時にビルドする必要はない
# 　　　ゆくゆくは、本番環境と開発環境でdockerfileを分けるなどして、コンテナ作成時のビルドを行う/行わないを切り替えられたらBEST
# MEMO：コンテナ作成時のビルドとコンテナ作成後のビルドでポート番号が被らないように、ここではポート8080を指定
ENTRYPOINT ["java", "-jar", "/app.jar", "--server.port=8080"]