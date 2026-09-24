# VIO Website

VIO 官網的 Astro 版本。之後開發、設計調整、部署與 GitHub 管理都以這個資料夾為準。

## Quick Start

需要 Node.js 22.12.0 以上。本專案目前以 Node.js 24 驗證。

```sh
npm install
npm run dev
```

開啟 <http://localhost:4321/>。

## Commands

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 本機開發預覽 |
| `npm run build` | 建置正式檔案到 `dist/` |
| `npm run preview` | 預覽 `dist/` 成品 |

## Project Map

| 路徑 | 用途 |
| --- | --- |
| `src/pages/` | 網站頁面：`/`、`/en/`、`/contact/` |
| `src/components/` | 共用元件：Header、Footer、CTA |
| `src/layouts/` | 共用頁面骨架 |
| `src/styles/` | 全站樣式與頁面樣式 |
| `public/` | 圖片、影片與沿用的互動 JS |
| `docs/` | 部署、結構與搬移驗證紀錄 |
| `dist/` | 建置輸出，不手動修改 |

## Docs

- [專案結構](docs/project-structure.md)
- [頁面與網址對照](docs/pages-and-routes.md)
- [部署設定](docs/deployment.md)
- [搬移驗證紀錄](docs/migration-check.md)

## Notes

- 部署目標是 `dist/`。
- 正式網域可用 `SITE_URL` 環境變數設定。
- 舊版根目錄 HTML/CSS/JS 只作為搬移備援，不是後續維護來源。
