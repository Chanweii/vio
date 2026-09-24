# Project Structure

這份專案的維護入口是 `vio-astro/`。若使用 Antigravity、Codex 或其他 AI 工具，請直接開這個資料夾，不要開上一層舊站根目錄。

## Source

```text
src/
  components/
    CtaSection.astro
    Footer.astro
    Header.astro
  layouts/
    BaseLayout.astro
  pages/
    index.astro
    en/index.astro
    contact/index.astro
  styles/
    global.css
    home.css
    contact.css
    pages/
```

## Public Assets

```text
public/
  js/
    main.js
    contact.js
    hero-animation.js
  picture/
    index/
```

`public/` 內的檔案會原樣複製到正式網站。圖片、影片和必須保留檔名的舊 JS 放在這裡。

## Build Output

```text
dist/
```

`dist/` 是 `npm run build` 產生的正式輸出。不要直接修改這個資料夾；需要調整網站時，改 `src/` 或 `public/` 後重新建置。

## Style Entry Points

- 首頁與英文頁使用 `src/styles/home.css`。
- 聯絡頁使用 `src/styles/contact.css`。
- 這兩個入口會依序載入共用樣式、頁面樣式和 responsive 規則，請保留這個順序，避免 dev 與 build 樣式不同。

## Page Routes

頁面與網址對照請看 [Pages and Routes](pages-and-routes.md)。未來頁面變多時，優先使用 `src/pages/page-name/index.astro` 的資料夾型態。
