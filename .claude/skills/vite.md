# Vite Skill

> 基於 [Vite 官方文件](https://vite.dev/) 整理的完整開發指南

## 適用情境

當使用者需要以下協助時使用此指令：
- 設定 Vite 專案
- 配置開發伺服器與建置選項
- 使用或開發 Vite 插件
- 優化建置效能
- 處理 HMR (熱模組替換)
- 環境變數與模式設定

---

## 1. 概述

Vite 是下一代前端建置工具，提供極速的開發體驗。

### 核心特色

| 特色 | 說明 |
|------|------|
| **極速冷啟動** | 使用原生 ES 模組，無需打包 |
| **即時 HMR** | 毫秒級熱更新 |
| **豐富的插件** | 兼容 Rollup 插件生態 |
| **TypeScript** | 開箱即用支援 |
| **SSR 支援** | 內建伺服器端渲染 |

### 專案統計 (2025)

| 指標 | 數值 |
|------|------|
| GitHub Stars | 70k+ |
| 最新版本 | v6.x |
| License | MIT |

---

## 2. 快速開始

### 2.1 建立專案

```bash
# npm
npm create vite@latest my-app

# yarn
yarn create vite my-app

# pnpm
pnpm create vite my-app

# 指定模板
npm create vite@latest my-app -- --template react-ts
npm create vite@latest my-app -- --template vue-ts
npm create vite@latest my-app -- --template svelte-ts
```

### 2.2 可用模板

| 模板 | 說明 |
|------|------|
| `vanilla` | 原生 JavaScript |
| `vanilla-ts` | 原生 TypeScript |
| `vue` | Vue 3 |
| `vue-ts` | Vue 3 + TypeScript |
| `react` | React |
| `react-ts` | React + TypeScript |
| `react-swc` | React + SWC |
| `react-swc-ts` | React + SWC + TypeScript |
| `preact` | Preact |
| `preact-ts` | Preact + TypeScript |
| `lit` | Lit |
| `lit-ts` | Lit + TypeScript |
| `svelte` | Svelte |
| `svelte-ts` | Svelte + TypeScript |
| `solid` | SolidJS |
| `solid-ts` | SolidJS + TypeScript |
| `qwik` | Qwik |
| `qwik-ts` | Qwik + TypeScript |

### 2.3 專案結構

```
my-app/
├── index.html          # 入口 HTML
├── package.json
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
├── public/             # 靜態資源 (不經過處理)
│   └── favicon.ico
└── src/
    ├── main.ts         # 應用入口
    ├── App.tsx         # 主元件
    ├── assets/         # 資源 (會被處理)
    └── components/
```

---

## 3. 配置檔 (vite.config.ts)

### 3.1 基本配置

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // 開發伺服器
  server: {
    port: 3000,
    open: true,
    host: true,  // 監聽所有地址
  },

  // 建置選項
  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  // 路徑別名
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
    },
  },
})
```

### 3.2 條件配置

```typescript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd(), '')

  const isDev = command === 'serve'
  const isProd = command === 'build'

  return {
    base: isProd ? '/my-app/' : '/',

    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version),
    },

    server: isDev ? {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    } : undefined,
  }
})
```

---

## 4. 開發伺服器選項

### 4.1 server 配置

```typescript
export default defineConfig({
  server: {
    // 基本設定
    host: '0.0.0.0',      // 監聽地址
    port: 3000,           // 端口
    strictPort: true,     // 端口被占用時失敗
    open: true,           // 自動開啟瀏覽器

    // HTTPS
    https: {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },

    // 代理
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // WebSocket 代理
        ws: true,
      },
      // 正則匹配
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
    },

    // CORS
    cors: true,

    // 自訂 headers
    headers: {
      'X-Custom-Header': 'value',
    },

    // HMR 設定
    hmr: {
      overlay: true,      // 錯誤覆蓋層
      port: 24678,        // HMR WebSocket 端口
    },

    // 檔案監視
    watch: {
      usePolling: true,   // Docker/WSL 環境
      interval: 100,
    },
  },
})
```

---

## 5. 建置選項

### 5.1 build 配置

```typescript
export default defineConfig({
  build: {
    // 輸出目錄
    outDir: 'dist',
    assetsDir: 'assets',

    // 資源處理
    assetsInlineLimit: 4096,  // 小於 4kb 轉 base64

    // Sourcemap
    sourcemap: true,          // boolean | 'inline' | 'hidden'

    // 目標瀏覽器
    target: 'es2020',         // 或 ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']

    // CSS 處理
    cssCodeSplit: true,       // CSS 代碼分割
    cssMinify: 'esbuild',     // CSS 壓縮器

    // 壓縮
    minify: 'esbuild',        // 'esbuild' | 'terser' | false

    // Rollup 選項
    rollupOptions: {
      input: {
        main: 'index.html',
        nested: 'nested/index.html',
      },
      output: {
        // 手動分割 chunks
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'dayjs'],
        },
        // 或使用函數
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        // 檔案命名
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
      // 外部化依賴
      external: ['react', 'react-dom'],
    },

    // 報告壓縮後大小
    reportCompressedSize: true,

    // chunk 大小警告限制 (kb)
    chunkSizeWarningLimit: 500,

    // 清空輸出目錄
    emptyOutDir: true,
  },
})
```

### 5.2 Library 模式

```typescript
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      fileName: 'my-lib',
      formats: ['es', 'cjs', 'umd', 'iife'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
```

---

## 6. 環境變數與模式

### 6.1 .env 檔案

```bash
# .env                 # 所有模式
# .env.local           # 所有模式，git 忽略
# .env.[mode]          # 特定模式
# .env.[mode].local    # 特定模式，git 忽略

# .env.development
VITE_API_URL=http://localhost:8080
VITE_DEBUG=true

# .env.production
VITE_API_URL=https://api.example.com
VITE_DEBUG=false
```

### 6.2 使用環境變數

```typescript
// 只有 VITE_ 前綴的變數會暴露給客戶端
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.MODE)        // 'development' | 'production'
console.log(import.meta.env.DEV)         // boolean
console.log(import.meta.env.PROD)        // boolean
console.log(import.meta.env.SSR)         // boolean
console.log(import.meta.env.BASE_URL)    // base 配置值

// TypeScript 類型
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 6.3 模式

```bash
# 開發模式 (預設 development)
vite

# 生產建置 (預設 production)
vite build

# 自訂模式
vite --mode staging
vite build --mode staging
```

---

## 7. 插件系統

### 7.1 使用插件

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    compression({
      algorithm: 'gzip',
    }),
  ],
})
```

### 7.2 常用官方插件

| 插件 | 說明 |
|------|------|
| `@vitejs/plugin-react` | React 支援 (Babel) |
| `@vitejs/plugin-react-swc` | React 支援 (SWC，更快) |
| `@vitejs/plugin-vue` | Vue 3 支援 |
| `@vitejs/plugin-vue-jsx` | Vue 3 JSX 支援 |
| `@vitejs/plugin-legacy` | 舊瀏覽器兼容 |

### 7.3 常用社區插件

```typescript
// SVG 組件化
import svgr from 'vite-plugin-svgr'

// 自動導入
import AutoImport from 'unplugin-auto-import/vite'

// 組件自動註冊 (Vue)
import Components from 'unplugin-vue-components/vite'

// PWA 支援
import { VitePWA } from 'vite-plugin-pwa'

// 壓縮
import compression from 'vite-plugin-compression'

// 圖片優化
import imagemin from 'vite-plugin-imagemin'

// 環境變數類型
import EnvironmentPlugin from 'vite-plugin-environment'
```

### 7.4 開發自訂插件

```typescript
import type { Plugin } from 'vite'

function myPlugin(): Plugin {
  return {
    name: 'my-plugin',

    // 插件執行順序
    enforce: 'pre', // 'pre' | 'post'

    // 只在開發/建置時執行
    apply: 'serve', // 'serve' | 'build' | ((config, env) => boolean)

    // === Vite 專屬 Hooks ===

    // 配置解析前
    config(config, { command, mode }) {
      return {
        resolve: {
          alias: { '@': '/src' },
        },
      }
    },

    // 配置解析後
    configResolved(resolvedConfig) {
      console.log('Config resolved:', resolvedConfig.base)
    },

    // 開發伺服器配置
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 自訂中間件
        next()
      })
    },

    // 預覽伺服器配置
    configurePreviewServer(server) {
      // 類似 configureServer
    },

    // HTML 轉換
    transformIndexHtml(html) {
      return html.replace(
        /<title>(.*?)<\/title>/,
        '<title>New Title</title>'
      )
    },

    // HMR 更新處理
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.custom')) {
        server.ws.send({
          type: 'custom',
          event: 'custom-update',
          data: { file },
        })
        return [] // 阻止預設 HMR
      }
    },

    // === Rollup 通用 Hooks ===

    // 解析模組 ID
    resolveId(source, importer) {
      if (source === 'virtual:my-module') {
        return '\0virtual:my-module'
      }
    },

    // 載入模組
    load(id) {
      if (id === '\0virtual:my-module') {
        return 'export const msg = "Hello"'
      }
    },

    // 轉換程式碼
    transform(code, id) {
      if (id.endsWith('.custom')) {
        return {
          code: transformCustom(code),
          map: null,
        }
      }
    },
  }
}
```

---

## 8. 資源處理

### 8.1 靜態資源導入

```typescript
// URL 導入
import imgUrl from './img.png'
document.getElementById('img').src = imgUrl

// 字串導入
import workletUrl from './worker?url'

// Raw 導入
import shaderString from './shader.glsl?raw'

// Web Worker 導入
import Worker from './worker?worker'
const worker = new Worker()

// 內聯 Worker
import InlineWorker from './worker?worker&inline'
```

### 8.2 public 目錄

```
public/
├── favicon.ico      # 訪問: /favicon.ico
├── robots.txt       # 訪問: /robots.txt
└── images/
    └── logo.png     # 訪問: /images/logo.png
```

### 8.3 JSON 導入

```typescript
// 整個 JSON
import json from './data.json'

// 命名導入 (tree-shakable)
import { field } from './data.json'
```

### 8.4 CSS 處理

```typescript
// 全局 CSS
import './style.css'

// CSS Modules
import styles from './style.module.css'
element.className = styles.className

// 預處理器
import './style.scss'
import './style.less'
import './style.styl'
```

---

## 9. 依賴預打包

### 9.1 配置

```typescript
export default defineConfig({
  optimizeDeps: {
    // 強制預打包
    include: ['lodash-es', 'vue', 'vue-router'],

    // 排除預打包
    exclude: ['your-linked-package'],

    // 自訂 esbuild 選項
    esbuildOptions: {
      target: 'es2020',
      plugins: [...],
    },

    // 強制重新預打包
    force: true,
  },
})
```

### 9.2 處理 CommonJS

```typescript
export default defineConfig({
  optimizeDeps: {
    include: [
      // 確保 CJS 模組被預打包
      'cjs-package',
      // 嵌套依賴
      'package > nested-cjs',
    ],
  },
})
```

---

## 10. SSR (伺服器端渲染)

### 10.1 基本設定

```typescript
export default defineConfig({
  ssr: {
    // 外部化依賴
    external: ['react', 'react-dom'],

    // 不外部化
    noExternal: ['package-to-bundle'],

    // 建置目標
    target: 'node',
  },
})
```

### 10.2 SSR 入口

```typescript
// src/entry-server.ts
import { renderToString } from 'react-dom/server'
import App from './App'

export function render() {
  return renderToString(<App />)
}
```

### 10.3 伺服器

```typescript
// server.js
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    const { render } = await vite.ssrLoadModule('/src/entry-server.ts')
    const html = render()
    res.send(html)
  })

  app.listen(3000)
}

createServer()
```

---

## 11. CLI 命令

### 11.1 開發

```bash
# 啟動開發伺服器
vite
vite dev
vite serve

# 指定端口
vite --port 8080

# 指定模式
vite --mode staging

# 開啟瀏覽器
vite --open

# 指定配置檔
vite --config my-config.js

# 偵錯模式
vite --debug
DEBUG=vite:* vite
```

### 11.2 建置

```bash
# 生產建置
vite build

# 指定輸出目錄
vite build --outDir build

# 產生 sourcemap
vite build --sourcemap

# 清空輸出目錄
vite build --emptyOutDir
```

### 11.3 預覽

```bash
# 預覽生產建置
vite preview

# 指定端口
vite preview --port 8080
```

### 11.4 優化依賴

```bash
# 強制重新預打包
vite --force
vite optimize --force
```

---

## 12. 最佳實踐

### ✅ 正確做法

1. **使用路徑別名**
   ```typescript
   // vite.config.ts
   resolve: {
     alias: {
       '@': '/src',
     },
   }

   // 使用
   import Component from '@/components/Component'
   ```

2. **環境變數類型**
   ```typescript
   // env.d.ts
   /// <reference types="vite/client" />
   interface ImportMetaEnv {
     readonly VITE_API_URL: string
   }
   ```

3. **動態導入代碼分割**
   ```typescript
   const Component = lazy(() => import('./Component'))
   ```

4. **預打包大型依賴**
   ```typescript
   optimizeDeps: {
     include: ['lodash-es', 'chart.js'],
   }
   ```

### ❌ 避免做法

1. **不要在生產環境使用 sourcemap: true**
2. **不要忽略 chunk 大小警告**
3. **不要將敏感資料放在 VITE_ 變數中**
4. **避免過深的動態導入嵌套**

---

## 13. 常見問題

### Q: 為什麼 HMR 不工作？

```typescript
// 檢查是否正確導出
export default function Component() {...}

// React Fast Refresh 需要
// 1. 組件名稱首字母大寫
// 2. 只導出 React 組件
```

### Q: 如何處理環境變數？

```bash
# 只有 VITE_ 前綴會暴露給客戶端
VITE_API_KEY=xxx     # ✅ 客戶端可見
API_SECRET=xxx       # ❌ 只在 vite.config.ts 可用
```

### Q: 如何優化建置大小？

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
      },
    },
  },
}
```

### Q: Docker/WSL 環境 HMR 問題？

```typescript
server: {
  watch: {
    usePolling: true,
  },
}
```

---

## 14. 快速參考

### 配置選項速查

| 選項 | 說明 | 預設值 |
|------|------|--------|
| `base` | 公共基礎路徑 | `/` |
| `mode` | 模式 | `development` |
| `define` | 全局常量 | - |
| `plugins` | 插件陣列 | `[]` |
| `publicDir` | 靜態資源目錄 | `public` |
| `cacheDir` | 快取目錄 | `node_modules/.vite` |
| `resolve.alias` | 路徑別名 | - |
| `server.port` | 開發伺服器端口 | `5173` |
| `build.outDir` | 輸出目錄 | `dist` |
| `build.target` | 目標瀏覽器 | `modules` |

### 常用命令

```bash
npm create vite@latest     # 建立專案
vite                       # 開發伺服器
vite build                 # 生產建置
vite preview               # 預覽建置
vite --force               # 強制重新預打包
```

---

*Source: [Vite Documentation](https://vite.dev/)*
