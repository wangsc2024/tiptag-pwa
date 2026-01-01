# Code Review Skill

審查程式碼品質與功能完整性。

## 適用情境

- 審查程式碼品質
- 檢查功能是否有對應 UI
- 識別潛在問題
- 確保程式碼一致性
- 安全性審查

---

## 審查維度

### 1. 功能完整性
- [ ] 所有服務功能是否有對應 UI
- [ ] 錯誤處理是否完整
- [ ] 邊界情況是否處理
- [ ] 功能是否可測試

### 2. 程式碼品質
- [ ] TypeScript 類型是否完整
- [ ] 命名是否清晰
- [ ] 函式是否單一職責
- [ ] 是否有重複程式碼

### 3. React 最佳實踐
- [ ] Hooks 使用是否正確
- [ ] 依賴陣列是否完整
- [ ] 是否避免不必要的重新渲染
- [ ] Key 屬性是否正確使用

### 4. 安全性
- [ ] XSS 防護
- [ ] API 金鑰是否安全
- [ ] 使用者輸入是否驗證
- [ ] localStorage 使用是否安全

### 5. 可維護性
- [ ] 程式碼是否易於理解
- [ ] 是否有必要的註解
- [ ] 模組是否適當分離
- [ ] 錯誤訊息是否有意義

---

## 本專案檢查重點

### 服務層 (services/)

| 服務 | 功能 | 對應 UI |
|------|------|---------|
| storage.ts | getDocuments | Sidebar 文件列表 |
| storage.ts | createDocument | Sidebar 新增按鈕 |
| storage.ts | updateDocument | Editor 儲存 |
| storage.ts | deleteDocument | Sidebar 刪除按鈕 |
| geminiService.ts | generateAIContent | AI Assist 選單 |
| githubService.ts | pushToGitHub | Sync Modal 推送 |
| githubService.ts | pullFromGitHub | Sync Modal 拉取 |
| templates.ts | getTemplates | Template Modal |

### 組件層 (components/)

| 組件 | 職責 | 依賴服務 |
|------|------|----------|
| Editor.tsx | 編輯器核心 | geminiService |
| Sidebar.tsx | 文件導航 | storage |
| SlashCommand.tsx | 斜線命令 | - |
| LinkModal.tsx | 連結編輯 | - |
| TemplateModal.tsx | 範本選擇 | templates |
| GitHubSyncModal.tsx | GitHub 同步 | githubService |
| TestRunnerUI.tsx | 測試執行 | vitest |

### 類型定義 (types.ts)

```typescript
// 確保介面完整
interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

enum AISuggestionType {
  FIX_GRAMMAR,
  SUMMARIZE,
  EXPAND,
  REPHRASE,
  GENERATE_IDEAS
}
```

---

## 執行審查

請根據以上維度審查當前專案，並提供：

1. **問題清單**: 發現的問題與嚴重程度
2. **功能對應矩陣**: 服務功能與 UI 的對應狀態
3. **改進建議**: 具體的修改方案
4. **測試建議**: 需要補充的測試案例
