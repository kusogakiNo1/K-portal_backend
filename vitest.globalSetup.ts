// vitestのテスト（全体）実行前後に実施したいことを記載するファイル
import { supabase } from "./src/supabaseClient";

// setup関数: 全てのテストが実行される前に一度だけ実行
export async function setup() {
  console.log("🔌 DB接続確認中...");
  
  // DB接続確認
  const { error } = await supabase
    .from("members")
    .select("count", { count: "exact", head: true });
  
  if (error) {
    console.error("❌ DB接続失敗:", error);
    throw error;
  }
  console.log("✅ DB接続成功");
}

// teardown関数: 全てのテストが終了された後に一度だけ実行
export async function teardown(global: any) {
  // 特にやることは無し
}
