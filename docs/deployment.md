# Deployment

網站建置輸出是 `dist/`。部署平台、GitHub Pages、Cloudflare Pages、Netlify、Vercel、Antigravity 或手動 FTP 都應該發佈這個資料夾的內容。

## Recommended Settings

如果部署平台的專案根目錄是 `vio-astro/`：

| 設定 | 值 |
| --- | --- |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Publish directory | `dist` |

如果部署平台的專案根目錄是上一層 `VIO_website/`：

| 設定 | 值 |
| --- | --- |
| Install command | `cd vio-astro && npm ci` |
| Build command | `cd vio-astro && npm run build` |
| Publish directory | `vio-astro/dist` |

## Domain

正式網域可在部署平台設定環境變數：

```text
SITE_URL=https://your-domain.example
```

`astro.config.mjs` 會讀取這個值。還沒有正式網域時可以先不設定。

## Redirects

舊網址需要在主機上設定重新導向：

| 舊網址 | 新網址 |
| --- | --- |
| `/index-en.html` | `/en/` |
| `/contact.html` | `/contact/` |

## Release Checklist

1. 確認部署平台發佈的是 `dist/`。
2. 正式網址檢查 `/`、`/en/`、`/contact/`。
3. 檢查影片背景、深淺色切換、手機選單。
4. 檢查舊網址重新導向。
5. 確認無誤後，再清理上一層舊站根目錄的 HTML/CSS/JS/圖片。

