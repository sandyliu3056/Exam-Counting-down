/* =====================================================
   選配：Supabase 雲端模式
   不填（保持 null）＝「本機模式」：帳號與紀錄只存在這台裝置，
   學生用「傳送學習紀錄給老師」把檔案傳給老師。

   填入後＝「雲端模式」：老師/學生各自註冊，
   學生的練習紀錄自動同步，老師在任何裝置登入都看得到。
   設定步驟請看 README.md（先在 Supabase 執行 supabase/schema.sql）

   這裡只能放 Project URL 和 anon / publishable key（本來就是公開的）。
   絕對不要放 service_role / secret key。
   ===================================================== */
window.SUPABASE_CONFIG = null;

/* 範例：
window.SUPABASE_CONFIG = {
  url: "https://abcdefghijklmnop.supabase.co",
  anonKey: "eyJhbGciOi...（anon public key，或 sb_publishable_ 開頭的 key）"
};
*/
