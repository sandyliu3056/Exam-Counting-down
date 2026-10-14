# 統測英文 · 衝刺倒數站

給高三統測考生的英文家教系統：考前倒數、閱讀測驗、單字卡、單字小考、學習紀錄，老師可登入查看學生練習狀況與錯題。純前端（HTML / CSS / JS），不需要伺服器，放上 GitHub Pages 即可使用，iPhone 可「加入主畫面」當 App 用。

## 功能

| 區塊 | 內容 |
| --- | --- |
| 首頁 | 統測倒數天數、今日任務、學習專區、老師的話、最近測驗 |
| 閱讀測驗 | 老師出的文章 + 四選一題目，交卷後顯示分數、正解與解析 |
| 單字卡 | 翻卡練習、「記得 / 不記得」、自動安排複習（間隔 0 / 1 / 3 / 7 天）、發音 |
| 單字小考 | 看英選中、看中選英、拼字測驗 |
| 單字庫 | 搜尋、依單元篩選；老師可新增、編輯、批次貼上 |
| 學習紀錄 | 熟練度、連續學習天數、12 週活動圖、測驗歷史、一鍵傳送紀錄給老師 |
| 學生狀況（老師） | 閱讀錯題分析（學生選了什麼、正解是什麼）、不熟單字排行、拼錯的字、活動時間軸 |
| 設定 | 考試名稱 / 日期、學生姓名、老師的話、老師邀請碼、匯出 / 匯入 JSON |

右上角可切換：中文 / English、手寫風 / 標準字體、六種配色主題。

## 帳號與權限

- 右上角「登入 / 註冊」。身分分為 **學生** 與 **老師**。
- 註冊老師帳號需要 **老師邀請碼**，預設為 `teacher2028`，老師登入後可在「設定」更改。
- 只有老師登入後才看得到「學生狀況」分頁與編輯功能（新增文章、單字）。
- 學生不登入也能練習，但建議登入，紀錄才會對應到名字。

## 兩種使用模式

### 1. 本機模式（預設，不用任何設定）

帳號、教材、紀錄都存在該裝置的瀏覽器。

- 老師在自己的裝置出題後，到「設定 → 只匯出教材」，把 JSON 檔傳給學生，學生用「匯入 JSON」即可更新教材。
- 學生在「學習紀錄 → 傳送學習紀錄給老師」，iPhone 會直接開分享選單（LINE / Email）。老師在「學生狀況 → 匯入學生傳來的紀錄」查看。

### 2. 雲端模式（選配，Firebase 免費方案）

填好 Firebase 後，老師與學生各自註冊，學生的練習紀錄會自動同步，老師在任何裝置登入都能看到所有學生；老師改教材，學生打開就是最新版。

1. 到 <https://console.firebase.google.com> 建立專案。
2. **Authentication → Sign-in method** 啟用「電子郵件 / 密碼」。
3. **Firestore Database** 建立資料庫（正式模式），然後在「規則」貼上：

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isTeacher() {
         return request.auth != null &&
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
       }
       match /users/{uid} {
         allow read: if request.auth != null;
         allow create, update: if request.auth != null && request.auth.uid == uid;
       }
       match /progress/{uid} {
         allow read: if request.auth != null && (request.auth.uid == uid || isTeacher());
         allow write: if request.auth != null && request.auth.uid == uid;
       }
       match /content/{doc} {
         allow read: if true;
         allow write: if isTeacher();
       }
     }
   }
   ```

4. **專案設定 → 一般 → 你的應用程式 → 新增網頁應用程式**，複製 `firebaseConfig`。
5. 打開 `firebase-config.js`，把 `window.FIREBASE_CONFIG = null;` 換成你的設定物件。
6. **Authentication → Settings → 授權網域** 加入你的 GitHub Pages 網域（例如 `你的帳號.github.io`）。

> 雲端模式的邀請碼檢查在前端進行，適合家教 / 小班使用；若要更嚴格，可在 Firestore 規則內再限制老師帳號的 email。

## 部署到 GitHub Pages

1. GitHub 專案 → **Settings → Pages**。
2. Source 選 **Deploy from a branch**，Branch 選你的分支、資料夾 `/ (root)`，儲存。
3. 幾分鐘後網址會是 `https://<帳號>.github.io/<repo>/`。

### iPhone 加到主畫面

用 Safari 打開網址 → 分享按鈕 → **加入主畫面**。之後會以全螢幕 App 的方式開啟，並支援離線使用。

## 老師如何出題

1. 用老師帳號登入。
2. **閱讀測驗 → ＋ 新增文章**：填標題、文章、題目（四個選項、勾選正解、解析）。
3. **單字庫 → ＋ 新增單字** 或 **批次貼上**，每行一個：

   ```
   adventure, n., 冒險, Life is an adventure.
   brave | adj. | 勇敢的
   ```

4. 本機模式記得「設定 → 只匯出教材」傳給學生；雲端模式會自動同步。

## 檔案說明

| 檔案 | 用途 |
| --- | --- |
| `index.html` / `style.css` / `app.js` | 主程式 |
| `data.js` | 預設教材（3 篇文章、50 個單字），可隨時在網站內修改 |
| `i18n.js` | 中 / 英介面文字 |
| `firebase-config.js` | 雲端模式設定（預設關閉） |
| `manifest.json` / `sw.js` / `icons/` | PWA（加入主畫面、離線） |

## 考試日期

預設為 2028/04/24（117 學年度）。日期可以在「設定」隨時修改，請以技專校院入學測驗中心公告為準。
