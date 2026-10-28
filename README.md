# 菜菜的學習筆記

用 [Eleventy](https://www.11ty.dev/) 做的部落格，推到 GitHub 後會自動建置、發布到 GitHub Pages。

## 第一次設定（只要做一次）

到 repo 的 **Settings → Pages**，把 **Source** 選成 **GitHub Actions**。之後每次推送都會自動更新網站。

## 新增文章（直接在 GitHub 網頁上）

1. 進入 `posts` 資料夾，按 **Add file → Create new file**
2. 檔名用「日期-英文代稱.md」，例如 `2026-11-03-n1-grammar.md`（英文代稱會變成網址）
3. 把 `templates/新文章範本.md` 的內容貼上，改標題、標籤，開始寫
4. 按 **Commit changes**，大約一分鐘後網站就會更新

Markdown 寫法（表格、程式碼、數學式、提示框）都整理在網站上的〈筆記寫法速查〉。

## 常用欄位

| 欄位 | 用途 |
| --- | --- |
| `title` | 標題 |
| `description` | 首頁列表的摘要，可省略 |
| `tags` | 主題標籤，首頁菜園照這個長 |
| `draft: true` | 草稿，不發布 |
| `updated: 2026-11-15` | 修改日期，會顯示「更新於」 |

標籤不要用 `posts`、`all`、`tagList`，這幾個名字系統已經用掉了。

## 想改網站名稱或首頁文字

改 `_data/site.js`。

## 圖片

上傳到 `assets/img/`，文章裡寫 `![說明](/assets/img/檔名.png)`。

## 在自己電腦上預覽（可選）

```bash
npm install
npm start
```

打開 http://localhost:8080 。
