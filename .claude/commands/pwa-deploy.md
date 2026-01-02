# PWA Cloudflare Deployment Skill

部署 PWA 至 Cloudflare Pages 並實現自動更版功能。

## 適用情境

- 設置 Cloudflare Pages 部署
- 配置 Service Worker 自動更新
- 實現應用程式更新提示
- 優化 PWA 效能

---

## 部署步驟

### 1. 準備 PWA 資源

#### manifest.json 完整配置

```json
{
  "name": "TipTag PWA",
  "short_name": "TipTag",
  "description": "富文本編輯器 PWA 應用程式",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4f46e5",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### 2. 配置 Service Worker (Vite PWA)

安裝依賴：
```bash
npm install vite-plugin-pwa workbox-window -D
```

vite.config.ts:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // 提示使用者更新
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'TipTag PWA',
        short_name: 'TipTag',
        theme_color: '#4f46e5',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ]
})
```

### 3. 更新提示組件

```tsx
// components/UpdatePrompt.tsx
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // 每小時檢查更新
      r && setInterval(() => r.update(), 60 * 60 * 1000)
    }
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white shadow-lg rounded-lg border p-4 max-w-sm">
      <p className="text-sm text-gray-700 mb-3">
        有新版本可用！
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          立即更新
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
        >
          稍後
        </button>
      </div>
    </div>
  )
}
```

### 4. Cloudflare Pages 配置

#### wrangler.toml (選用)
```toml
name = "tiptag-pwa"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"
```

#### 建置設定
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: 18+

### 5. GitHub Actions 自動部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: tiptag-pwa
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

---

## 自動更版機制

### Service Worker 生命週期

1. **安裝 (install)**: 下載所有資源
2. **等待 (waiting)**: 新版本就緒，等待舊版本關閉
3. **啟用 (activate)**: 接管控制權
4. **控制 (controlling)**: 攔截網路請求

### 更新策略

| 策略 | 說明 | 適用情境 |
|------|------|----------|
| autoUpdate | 自動更新，無提示 | 小幅修復 |
| prompt | 提示使用者更新 | 重大更新 |

### 快取策略

| 策略 | 說明 | 適用資源 |
|------|------|----------|
| CacheFirst | 優先快取 | 字型、圖片 |
| NetworkFirst | 優先網路 | API 回應 |
| StaleWhileRevalidate | 先用快取，背景更新 | 靜態資源 |

---

## 檢查清單

- [ ] manifest.json 配置完整
- [ ] 本地圖示檔案 (不使用外部 CDN)
- [ ] Service Worker 註冊正確
- [ ] 更新提示組件整合
- [ ] Cloudflare 環境變數設定
- [ ] GitHub Secrets 配置
- [ ] 建置輸出目錄正確
