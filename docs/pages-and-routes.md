# Pages and Routes

Astro 的頁面來源都放在 `src/pages/`。這裡可以把它理解成本專案專門管理 HTML 頁面的資料夾。

`.astro` 是可維護的原始頁面檔；執行 `npm run build` 後，Astro 會把它們輸出成 `dist/` 裡真正給瀏覽器讀的 `.html`。

## Current Pages

| 網址 | 原始頁面檔 | 建置後輸出 |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | `dist/index.html` |
| `/en/` | `src/pages/en/index.astro` | `dist/en/index.html` |
| `/contact/` | `src/pages/contact/index.astro` | `dist/contact/index.html` |

## Naming Pattern

未來頁面變多時，優先使用「一個頁面一個資料夾」：

```text
src/pages/
  index.astro
  en/
    index.astro
  contact/
    index.astro
  about/
    index.astro
  products/
    index.astro
```

對應網址會是：

```text
/about/
/products/
```

這樣未來每個頁面若需要自己的資料、局部元件或備註，都可以收在同一個資料夾旁邊，不會全部擠在 `src/pages/` 第一層。

## Important Rule

不要直接修改 `dist/` 裡的 `.html`。`dist/` 是建置成品；要改頁面請改 `src/pages/`，再重新執行 `npm run build`。

