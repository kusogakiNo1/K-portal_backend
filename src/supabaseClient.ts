import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing in environment variables.");
}

// テスト環境の時だけデフォルトスキーマを 'test_schema' にする
const defaultSchema = process.env.NODE_ENV === 'test' ? 'test_schema' : 'public';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: defaultSchema,
  },
});
