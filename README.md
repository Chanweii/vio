# VIO Website

VIO 官網的 Astro 版本。之後開發、設計調整、部署與 GitHub 管理都以這個資料夾為準。

## Quick Start

需要 Node.js 22.12.0 以上與 pnpm。本專案目前以 Node.js 24 驗證。

```sh
pnpm install
pnpm dev
```

開啟 <http://localhost:4321/vio/>。

## Commands

| 指令 | 用途 |
| --- | --- |
| `pnpm dev` | 啟動本機預覽；啟動後只要編輯、儲存，畫面會自動更新 |
| `pnpm build` | 建置正式檔案到 `dist/` |
| `pnpm preview` | 預覽 `dist/` 成品 |

macOS 也可以直接雙擊 `start-local-preview.command`，不必手動輸入啟動指令。

## Project Map

| 路徑 | 用途 |
| --- | --- |
| `src/pages/` | 網站頁面：`/`、`/en/`、`/contact/` |
| `src/components/home/` | 首頁各區塊；日常修改首頁文字與結構的主要位置 |
| `src/components/` | Header、Footer、CTA 等全站共用元件 |
| `src/layouts/` | 共用頁面骨架 |
| `src/styles/` | 全站樣式與頁面樣式 |
| `public/` | 圖片、影片與其他不經編譯的靜態檔案 |
| `docs/` | 部署、結構與搬移驗證紀錄 |
| `dist/` | 建置輸出，不手動修改 |

## Docs

- [專案結構](docs/project-structure.md)
- [日常編輯指南](docs/editing-guide.md)
- [頁面與網址對照](docs/pages-and-routes.md)
- [部署設定](docs/deployment.md)
- [搬移驗證紀錄](docs/migration-check.md)

## Notes

- 部署目標是 `dist/`。
- 正式網域可用 `SITE_URL` 環境變數設定。
- 舊版根目錄 HTML/CSS/JS 只作為搬移備援，不是後續維護來源。
