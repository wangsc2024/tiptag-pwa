# Vite 開發與偵錯技能

## 常用指令
```bash
npm run dev      # 開發伺服器
npm run build    # 生產建置
npm run preview  # 預覽生產建置
```

## 偵錯技巧

### 1. 檢查建置輸出
```bash
npm run build 2>&1 | grep -E "error|warning|✓"
```

### 2. 分析 Bundle 大小
```bash
npx vite-bundle-visualizer
```

### 3. 檢查環境變數
```typescript
// vite.config.ts
define: {
  'process.env.VAR': JSON.stringify(env.VAR)
}
```

### 4. 常見問題

#### 模組解析錯誤
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, '.'),
  }
}
```

#### 外部化依賴
```typescript
build: {
  rollupOptions: {
    external: [/\.test\.(ts|tsx)$/]
  }
}
```

### 5. PWA 配置
```typescript
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'prompt',
  manifest: { ... },
  workbox: { ... }
})
```

## 效能優化
- 使用 `manualChunks` 分割代碼
- 啟用 `cssCodeSplit`
- 配置 `build.target` 為目標瀏覽器
