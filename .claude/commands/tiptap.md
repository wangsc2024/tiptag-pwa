# Tiptap Editor Skill

基於 Tiptap 官方文件與 GitHub 原始碼整理的完整開發指南

## 適用情境

當使用者需要以下協助時使用此技能：
- 建立 Tiptap 富文本編輯器
- 自訂 Nodes、Marks、Extensions
- 整合 React 框架
- 實作協作編輯功能
- 處理 ProseMirror 相關問題

---

## 快速參考

### 安裝

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

### 基本使用

```tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
    immediatelyRender: false, // SSR 關鍵設定
  })

  return <EditorContent editor={editor} />
}
```

### 常用 Commands

| Command | 說明 |
|---------|------|
| `toggleBold()` | 切換粗體 |
| `toggleItalic()` | 切換斜體 |
| `toggleStrike()` | 切換刪除線 |
| `toggleCode()` | 切換行內程式碼 |
| `toggleHeading({ level })` | 切換標題 |
| `toggleBulletList()` | 切換無序列表 |
| `toggleOrderedList()` | 切換有序列表 |
| `toggleBlockquote()` | 切換引用 |
| `toggleCodeBlock()` | 切換程式碼區塊 |
| `setLink({ href })` | 設定連結 |
| `unsetLink()` | 移除連結 |
| `setImage({ src })` | 插入圖片 |
| `undo()` | 復原 |
| `redo()` | 重做 |

### Command 系統

```ts
// 使用 chain() 組合多個命令
editor.chain().focus().toggleBold().run()

// 檢查是否可執行
if (editor.can().chain().focus().toggleBold().run()) {
  // 可以執行
}

// 狀態檢查
editor.isActive('bold')
editor.isActive('heading', { level: 1 })
```

### 自訂 Extension

```ts
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  name: 'customExtension',

  addOptions() {
    return { myOption: 'default' }
  },

  addCommands() {
    return {
      myCommand: (param) => ({ commands }) => {
        return commands.insertContent(`Hello ${param}!`)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-x': () => this.editor.commands.myCommand('World'),
    }
  },
})
```

### 自訂 Node

```ts
import { Node, mergeAttributes } from '@tiptap/core'

const CustomNode = Node.create({
  name: 'customNode',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      color: { default: 'blue' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="custom"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'custom' }, HTMLAttributes), 0]
  },
})
```

### React Node View

```tsx
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react'

const CounterComponent = ({ node, updateAttributes }) => (
  <NodeViewWrapper>
    <div contentEditable={false}>
      Count: {node.attrs.count}
      <button onClick={() => updateAttributes({ count: node.attrs.count + 1 })}>+</button>
    </div>
    <NodeViewContent />
  </NodeViewWrapper>
)

const Counter = Node.create({
  name: 'counter',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return { count: { default: 0 } }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CounterComponent)
  },
})
```

## 最佳實踐

### ✅ 正確做法

1. **使用 chain()** 組合命令，減少 transaction
2. **檢查命令可用性**: `editor.can().chain().focus().toggleBold().run()`
3. **SSR 處理**: 設定 `immediatelyRender: false`
4. **處理 null 狀態**: `if (!editor) return null`

### ❌ 避免做法

1. 直接修改 state (使用 commands)
2. 在 onUpdate 中修改內容 (可能無限迴圈)
3. 重複初始化 editor
4. 忽略 editor null 檢查

## 本專案擴充配置

當前 Editor.tsx 已配置：
- StarterKit (heading levels: 1, 2, 3)
- Placeholder
- Link (openOnClick: false, autolink)
- Image (allowBase64: true)
- TaskList / TaskItem
- SlashCommand (自訂)

新增擴充時，請遵循現有模式整合。
