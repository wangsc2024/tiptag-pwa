# Tailwind CSS 4.x 開發與偵錯技能

## 配置方式 (Tailwind 4.x)

### styles.css
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

### postcss.config.js
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

## 偵錯技巧

### 1. 檢查 CSS 是否包含類別
```bash
cat dist/assets/*.css | grep -o "\.prose" | head -5
cat dist/assets/*.css | grep -o "\.your-class" | head -5
```

### 2. 確認類別被掃描
確保 Tailwind 掃描正確的檔案路徑

### 3. Typography 插件
```css
/* 啟用 prose 類別 */
@plugin "@tailwindcss/typography";
```

使用方式：
```html
<div class="prose prose-lg prose-slate">
  <h1>標題</h1>
  <p>段落內容</p>
</div>
```

## 常見問題

### prose 樣式不生效
1. 確認 `@plugin "@tailwindcss/typography"` 已添加
2. 檢查元素是否有 `prose` 類別
3. 確認沒有被 `not-prose` 排除

### 中文字型問題
```css
.prose {
  font-family: 'Inter', 'Noto Sans TC', system-ui, sans-serif;
}
```

### CSS 變數覆寫
```css
.prose {
  --tw-prose-body: #374151;
  --tw-prose-headings: #111827;
}
```

## 自訂樣式
```css
/* 在 styles.css 中添加 */
.ProseMirror h1 {
  font-size: 2.25em;
  font-weight: 800;
  margin-bottom: 0.5em;
}
```
