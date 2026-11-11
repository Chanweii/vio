# 日常編輯指南

這個版本保留 Astro 的建置與部署能力，但日常編輯方式刻意接近傳統 HTML/CSS：啟動預覽一次後，直接打開對應區塊、修改、儲存即可。

## 開始編輯

macOS 可直接雙擊專案根目錄的 `start-local-preview.command`。看到本機網址後，用瀏覽器開啟；之後保持視窗運作即可。

也可以在終端機執行：

```sh
pnpm dev
```

## 首頁修改位置

| 要修改的內容 | 檔案 |
| --- | --- |
| 首屏標題、影片 | `src/components/home/HeroSection.astro` |
| 關於唯創 | `src/components/home/AboutSection.astro` |
| 服務流程 | `src/components/home/EngineeringSection.astro` |
| 防護應用輪播 | `src/components/home/SolutionsSection.astro` |
| 成果數據 | `src/components/home/AchievementsSection.astro` |
| 產品分類與卡片 | `src/components/home/ProductsSection.astro` |
| 工程實績 | `src/components/EngineeringRecords.astro`、`src/data/engineering-records.ts` |
| 客戶品牌列 | `src/components/ClientsMarquee.astro` |

每個首頁區塊的中英文內容都放在同一個檔案。中文通常在 `lang === 'zh'` 的資料區，英文在另一側，不需要到 JavaScript 裡尋找文案。

## 樣式修改位置

- 顏色、字級、間距等共用規格：`src/styles/tokens.css`
- Header、Footer 與全站版面：`src/styles/layout.css`
- 按鈕等共用元件：`src/styles/components.css`
- 首頁細節：`src/styles/pages/home.css`
- 手機與平板調整：`src/styles/responsive.css`

先修改 token，再處理單一區塊的特殊樣式，可以避免同一個顏色或間距散落在多個檔案。

## Git 與部署

網站已設定在推送到 GitHub `main` 分支後自動建置並部署 GitHub Pages。日常流程是：

1. 本機修改並確認預覽。
2. 建立 Git commit。
3. 推送到 `main`。
4. GitHub 自動建置與部署 `dist/`，不需要手動上傳。

正式發佈前可執行 `pnpm build`；成功產生三個頁面即代表基本建置通過。
