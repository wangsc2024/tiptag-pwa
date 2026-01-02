# TDD Testing Skill

以測試驅動開發 (TDD) 方式開發與測試程式碼。

## 適用情境

- 撰寫新功能測試
- 重構現有程式碼
- 修復 bug
- 提升程式碼品質

---

## TDD 流程

```
紅燈 → 綠燈 → 重構
 ↓       ↓       ↓
寫測試   寫程式碼   優化
(失敗)   (通過)   (保持通過)
```

### 1. 紅燈 (Red)
先寫一個會失敗的測試

### 2. 綠燈 (Green)
寫最少的程式碼讓測試通過

### 3. 重構 (Refactor)
優化程式碼，保持測試通過

---

## Vitest 測試配置

### 安裝

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### setup.ts

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any
```

---

## 測試範例

### 服務層測試

```typescript
// services/storage.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getDocuments, createDocument, updateDocument, deleteDocument } from './storage'

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('getDocuments', () => {
    it('should return empty array when no documents exist', () => {
      localStorage.getItem.mockReturnValue(null)
      const docs = getDocuments()
      expect(docs).toHaveLength(1) // default welcome doc
    })

    it('should return stored documents', () => {
      const mockDocs = [{ id: '1', title: 'Test', content: '', updatedAt: 123 }]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockDocs))
      const docs = getDocuments()
      expect(docs).toEqual(mockDocs)
    })
  })

  describe('createDocument', () => {
    it('should create a new document with default values', () => {
      const newDoc = createDocument()
      expect(newDoc).toHaveProperty('id')
      expect(newDoc.title).toBe('Untitled Document')
      expect(newDoc.content).toBe('<p></p>')
    })
  })

  describe('deleteDocument', () => {
    it('should remove document by id', () => {
      const mockDocs = [
        { id: '1', title: 'Test 1', content: '', updatedAt: 123 },
        { id: '2', title: 'Test 2', content: '', updatedAt: 124 },
      ]
      localStorage.getItem.mockReturnValue(JSON.stringify(mockDocs))

      const result = deleteDocument('1')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })
  })
})
```

### 組件測試

```typescript
// components/SlashCommand.test.ts
import { describe, it, expect } from 'vitest'
import { getSuggestionItems } from './SlashCommand'

describe('SlashCommand', () => {
  describe('getSuggestionItems', () => {
    it('should return all items when query is empty', () => {
      const items = getSuggestionItems({ query: '' })
      expect(items.length).toBeGreaterThan(0)
    })

    it('should filter items by query', () => {
      const items = getSuggestionItems({ query: 'head' })
      expect(items.every(item =>
        item.title.toLowerCase().includes('head')
      )).toBe(true)
    })

    it('should return empty array for non-matching query', () => {
      const items = getSuggestionItems({ query: 'xyz123' })
      expect(items).toHaveLength(0)
    })
  })
})
```

### AI 服務測試

```typescript
// services/geminiService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateAIContent } from './geminiService'
import { AISuggestionType } from '../types'

// Mock the Gemini API
vi.mock('@google/genai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => 'Generated content' }
      })
    })
  }))
}))

describe('GeminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate content for FIX_GRAMMAR', async () => {
    const result = await generateAIContent(
      AISuggestionType.FIX_GRAMMAR,
      'This is test text'
    )
    expect(result).toBeDefined()
  })

  it('should throw error when text is empty', async () => {
    await expect(
      generateAIContent(AISuggestionType.SUMMARIZE, '')
    ).rejects.toThrow()
  })
})
```

---

## 測試指令

```bash
# 執行所有測試
npx vitest

# 執行並觀察變化
npx vitest --watch

# 執行特定檔案
npx vitest storage.test.ts

# 產生覆蓋率報告
npx vitest --coverage

# 執行單次測試
npx vitest run
```

---

## 測試覆蓋率目標

| 類型 | 目標 | 說明 |
|------|------|------|
| 服務層 | 80%+ | 核心業務邏輯 |
| 工具函式 | 90%+ | 純函式 |
| 組件 | 60%+ | UI 互動 |
| 整合 | 50%+ | 完整流程 |

---

## 本專案測試檔案

```
tiptag-pwa/
├── components/
│   └── SlashCommand.test.ts     ✅ 已存在
├── services/
│   ├── geminiService.test.ts    ✅ 已存在
│   ├── githubService.test.ts    ✅ 已存在
│   └── storage.test.ts          ✅ 已存在
└── lib/
    └── vitest.ts                ✅ 測試工具
```

### 需要補充的測試

- [ ] Editor.tsx 組件測試
- [ ] Sidebar.tsx 組件測試
- [ ] 整合測試 (文件 CRUD 流程)
- [ ] AI 回應處理測試
- [ ] 錯誤處理測試
