/* =====================================================
   選配：Firebase 雲端模式
   不填（保持 null）＝「本機模式」：帳號與紀錄只存在這台裝置，
   學生用「傳送學習紀錄給老師」把檔案傳給老師。

   填入後＝「雲端模式」：老師/學生各自註冊，
   學生的練習紀錄自動同步，老師在任何裝置登入都看得到。
   設定步驟請看 README.md
   ===================================================== */
window.FIREBASE_CONFIG = null;

/* 範例：
window.FIREBASE_CONFIG = {
  apiKey: "AIza....",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
*/
