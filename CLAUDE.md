# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TipTag PWA** (Nova Knowledge Base) is a Progressive Web Application providing a distraction-free rich text editor powered by Tiptap and Google Gemini AI.

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| Tiptap | 2.10.x | Headless Rich Text Editor |
| Vite | 6.x | Build Tool |
| TypeScript | 5.8.x | Type Safety |
| Tailwind CSS | - | Styling (via prose) |
| Gemini AI | @google/genai | AI Writing Assistance |
| Octokit | 20.x | GitHub API Integration |

### Project Structure

```
tiptag-pwa/
├── App.tsx                    # Main application component
├── index.tsx                  # Entry point
├── index.html                 # HTML template
├── types.ts                   # TypeScript interfaces
├── manifest.json              # PWA manifest
├── components/
│   ├── Editor.tsx             # Tiptap editor with toolbar & menus
│   ├── Sidebar.tsx            # Document navigation sidebar
│   ├── SlashCommand.tsx       # Slash command extension (/)
│   ├── CommandList.tsx        # Command list UI for slash commands
│   ├── LinkModal.tsx          # Link editing modal
│   ├── TemplateModal.tsx      # Document template selector
│   ├── GitHubSyncModal.tsx    # GitHub sync functionality
│   └── TestRunnerUI.tsx       # Test runner interface
├── services/
│   ├── storage.ts             # LocalStorage document persistence
│   ├── geminiService.ts       # Gemini AI API integration
│   ├── githubService.ts       # GitHub API operations
│   └── templates.ts           # Document templates
└── lib/
    └── vitest.ts              # Test utilities
```

## Core Features

### 1. Document Management
- **Create/Read/Update/Delete** documents
- **LocalStorage** persistence (key: `nova_kb_documents`)
- Auto-save on content changes

### 2. Rich Text Editing (Tiptap)
Extensions configured in `Editor.tsx`:
- **StarterKit** (basic formatting)
- **Placeholder** (input hints)
- **Link** (internal/external links)
- **Image** (base64 support)
- **TaskList/TaskItem** (todo lists)
- **SlashCommand** (custom extension for `/` commands)

### 3. AI Assist (Gemini)
Available actions (`AISuggestionType`):
- `FIX_GRAMMAR` - Correct grammar errors
- `SUMMARIZE` - Create summary
- `EXPAND` - Continue writing
- `REPHRASE` - Rewrite content
- `GENERATE_IDEAS` - Brainstorm ideas

### 4. Slash Commands
Type `/` in editor to access:
- Heading 1, 2, 3
- Bullet/Ordered/Task lists
- Quote, Code Block
- Divider, Image

### 5. GitHub Sync
- Push documents to GitHub repository
- Pull documents from GitHub
- Merge strategy: overwrite on ID match

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env.local` file:
```
GEMINI_API_KEY=your-gemini-api-key
```

## Key Code Patterns

### Tiptap Editor Configuration
```tsx
const editor = useEditor({
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Placeholder.configure({ placeholder: 'Start writing...' }),
    Link.configure({ openOnClick: false }),
    Image.configure({ allowBase64: true }),
    TaskList,
    TaskItem.configure({ nested: true }),
    configureSlashCommand(),
  ],
  content: content,
  onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
})
```

### Command Chaining
Always use chain() for multiple operations:
```tsx
// Correct
editor.chain().focus().toggleBold().run()

// Avoid
editor.commands.toggleBold()
```

### Custom Bubble Menu
The editor implements custom positioned bubble menu (not using BubbleMenu extension):
```tsx
// Position calculation in onTransaction
const start = editor.view.coordsAtPos(from)
setBubbleMenuPos({ top: start.top, left: (start.left + end.left) / 2 })
```

## Testing

Test files are located alongside their source files:
- `components/SlashCommand.test.ts`
- `services/geminiService.test.ts`
- `services/githubService.test.ts`
- `services/storage.test.ts`

Run tests via TestRunnerUI component (Beaker icon in top-right).

## PWA Configuration

`manifest.json` defines:
- App name: "Nova Knowledge Base"
- Display: standalone
- Theme color: #4f46e5 (Indigo)
- Icons: External CDN icons (needs local icons for production)

## Important Notes

1. **No SSR**: This is a client-side only PWA
2. **LocalStorage Limits**: ~5MB per origin
3. **External Dependencies**: Uses CDN icons in manifest (should be replaced)
4. **AI API Key**: Required for AI features
5. **GitHub Token**: Required for sync features

## Common Tasks

### Adding a New Slash Command
Edit `components/SlashCommand.tsx`:
```tsx
{
  title: 'Your Command',
  icon: <YourIcon className="w-4 h-4" />,
  command: ({ editor, range }: any) => {
    editor.chain().focus().deleteRange(range).yourCommand().run();
  },
}
```

### Adding a New AI Action
1. Add enum value in `types.ts`:
   ```ts
   export enum AISuggestionType {
     // ... existing
     YOUR_ACTION = 'Your Action'
   }
   ```
2. Handle in `services/geminiService.ts`
3. Add button in `Editor.tsx` AI menu

### Adding a New Tiptap Extension
1. Install: `npm install @tiptap/extension-xxx`
2. Import in `Editor.tsx`
3. Add to extensions array
4. Optionally add toolbar button

## Code Style Guidelines

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use Tailwind CSS utility classes
- Follow Lucide icon naming conventions
- Keep components focused and composable

---

*Last updated: 2026-01-01*
