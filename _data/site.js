// 網站基本資料：想改名稱、介紹文字，改這裡就好
export default {
  title: "菜菜的學習筆記",
  author: "菜菜",
  description: "菜菜的學習筆記：日文、資料與雲端、電子電路，學到哪裡寫到哪裡。",

  // 首頁大標題（換行用 \n）
  heroLine: "今天也比昨天\n少菜一點",
  heroIntro: "我是菜菜。這裡放我的學習筆記：日文、資料與雲端、電子電路，學到哪裡寫到哪裡。",

  // 網址由 GitHub 部署時自動帶入，不用手動改
  url: (process.env.SITE_URL || "http://localhost:8080").replace(/\/$/, ""),
};
