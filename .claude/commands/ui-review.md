# UI Review Skill

審查並優化前端 UI 設計與實作。

## 適用情境

- 審查 React 組件 UI/UX
- 優化 Tailwind CSS 樣式
- 檢查無障礙性 (a11y)
- 改善響應式設計
- 提升使用者體驗

---

## 審查清單

### 1. 視覺一致性
- [ ] 顏色使用是否符合設計系統 (indigo-600 為主色)
- [ ] 間距是否一致 (使用 Tailwind 標準間距)
- [ ] 字體大小層級是否清晰
- [ ] 圖示風格是否統一 (Lucide React)

### 2. 交互設計
- [ ] 按鈕是否有 hover/active 狀態
- [ ] 可點擊元素是否有適當游標
- [ ] 載入狀態是否有指示
- [ ] 錯誤狀態是否有回饋

### 3. 響應式設計
- [ ] 行動裝置適配
- [ ] 側邊欄折疊行為
- [ ] 工具列換行處理
- [ ] 觸控友善

### 4. 無障礙性
- [ ] 按鈕是否有 title 屬性
- [ ] 表單元素是否有 label
- [ ] 對比度是否足夠
- [ ] 鍵盤可導航

### 5. 效能
- [ ] 避免不必要的重新渲染
- [ ] 圖片是否優化
- [ ] CSS 是否簡潔

---

## 本專案 UI 模式

### 按鈕樣式

```tsx
// 主要按鈕
className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"

// 工具列按鈕
className={`p-1.5 rounded-md transition-all ${
  isActive
    ? 'bg-indigo-50 text-indigo-600'
    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
}`}

// AI 按鈕
className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full text-sm font-medium"
```

### 浮動選單

```tsx
className="fixed z-50 bg-white shadow-xl border border-gray-200 rounded-lg p-1.5"
```

### 側邊欄

```tsx
// 展開狀態
className="w-72 border-r border-gray-100"

// 項目 hover
className="hover:bg-gray-50 rounded-lg"
```

### Toast 通知

```tsx
// 錯誤 Toast
className="bg-red-50 text-red-600 px-4 py-3 rounded-lg shadow-lg border border-red-100"

// 成功 Toast
className="bg-green-50 text-green-600 px-4 py-3 rounded-lg shadow-lg border border-green-100"
```

---

## 執行審查

請根據以上清單審查當前專案的 UI，並提供：

1. **問題列表**: 發現的 UI 問題
2. **改進建議**: 具體的修改方案
3. **優先順序**: 高/中/低
4. **程式碼範例**: 建議的修改程式碼
