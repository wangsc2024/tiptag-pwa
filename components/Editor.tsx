import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import {
    Bold, Italic, Strikethrough, Code, Link as LinkIcon,
    List, ListOrdered, CheckSquare, Quote, Minus,
    Heading1, Heading2, Heading3, Undo, Redo,
    Wand2, Check, X, Loader2, Sparkles, AlertCircle,
    Image as ImageIcon, ExternalLink, ArrowRightCircle,
    Underline as UnderlineIcon, Highlighter, FileCode, Type
} from 'lucide-react';
// AI disabled for debugging
// import { generateAIContent } from '../services/geminiService';
import { AISuggestionType, Document } from '../types';
import LinkModal from './LinkModal';
import { configureSlashCommand } from './SlashCommand';

interface EditorProps {
  content: string;
  title: string;
  onUpdate: (content: string) => void;
  onTitleChange: (title: string) => void;
  documents: Document[];
  onNavigate: (docId: string) => void;
}

const Editor: React.FC<EditorProps> = ({ content, title, onUpdate, onTitleChange, documents, onNavigate }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  
  // Custom Menu State
  const [bubbleMenuPos, setBubbleMenuPos] = useState<{top: number, left: number} | null>(null);
  const [floatingMenuPos, setFloatingMenuPos] = useState<{top: number, left: number} | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
            levels: [1, 2, 3],
        }
      }),
      Placeholder.configure({
        placeholder: 'Start writing or type / for commands...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: 'text-indigo-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        allowBase64: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
            class: 'bg-yellow-200',
        },
      }),
      Underline,
      CharacterCount.configure({
        limit: null,
      }),
      configureSlashCommand(),
    ],
    editorProps: {
        attributes: {
            class: 'prose prose-lg prose-slate focus:outline-none max-w-none',
        },
    },
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    onTransaction: ({ editor }) => {
        const { selection } = editor.state;
        const { empty, from, to } = selection;

        // Bubble Menu Logic
        if (!empty) {
            const start = editor.view.coordsAtPos(from);
            const end = editor.view.coordsAtPos(to);
            setBubbleMenuPos({
                top: start.top,
                left: (start.left + end.left) / 2
            });
        } else {
            setBubbleMenuPos(null);
        }

        // Floating Menu Logic
        if (empty) {
            const { $anchor } = selection;
            const isRootDepth = $anchor.depth === 1;
            const isEmptyBlock = $anchor.parent.isBlock && $anchor.parent.content.size === 0;

            if (isRootDepth && isEmptyBlock) {
                const pos = editor.view.coordsAtPos(from);
                setFloatingMenuPos({ top: pos.top, left: pos.left });
            } else {
                setFloatingMenuPos(null);
            }
        } else {
            setFloatingMenuPos(null);
        }
    }
  });

  // Sync content when switching documents
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const openLinkModal = useCallback(() => {
      setIsLinkModalOpen(true);
  }, []);

  const handleLinkSave = useCallback((url: string) => {
    if (!editor) return;
    
    // If empty, unset
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Set link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const openLink = useCallback(() => {
      if (!editor) return;
      const href = editor.getAttributes('link').href;
      if (!href) return;

      if (href.startsWith('internal://')) {
          const id = href.replace('internal://', '');
          onNavigate(id);
      } else {
          window.open(href, '_blank');
      }
  }, [editor, onNavigate]);

  const handleImageFile = useCallback((file: File) => {
      if (!editor) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const base64 = event.target?.result as string;
          editor.chain().focus().insertContent({ type: 'image', attrs: { src: base64 } }).run();
      };
      reader.readAsDataURL(file);
  }, [editor]);

  const addImage = useCallback(() => {
    document.getElementById('hidden-image-input')?.click();
  }, []);

  const handleAiAction = async (type: AISuggestionType) => {
    // AI functionality disabled
    setAiError("AI features are currently disabled.");
    setTimeout(() => setAiError(null), 3000);
    setShowAiMenu(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <input 
        type="file" 
        id="hidden-image-input" 
        className="hidden" 
        accept="image/*"
        onChange={(e) => {
            if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
            e.target.value = ''; // Reset
        }}
      />

      {/* Top Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between p-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm gap-2">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
            <ToolbarButton 
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                icon={<Undo className="w-4 h-4" />}
                title="Undo"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                icon={<Redo className="w-4 h-4" />}
                title="Redo"
            />
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:inline-block mr-2">
                Formatting
            </span>
             <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                icon={<Bold className="w-4 h-4" />}
                title="Bold"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                icon={<Italic className="w-4 h-4" />}
                title="Italic"
            />
             <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                icon={<UnderlineIcon className="w-4 h-4" />}
                title="Underline"
            />
             <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                icon={<Strikethrough className="w-4 h-4" />}
                title="Strikethrough"
            />
             <ToolbarButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                isActive={editor.isActive('highlight')}
                icon={<Highlighter className="w-4 h-4" />}
                title="Highlight"
            />
             <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                icon={<Code className="w-4 h-4" />}
                title="Inline Code"
            />
             <div className="w-px h-6 bg-gray-200 mx-2" />
             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:inline-block mr-2">
                Blocks
            </span>
             <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                icon={<Heading1 className="w-4 h-4" />}
                title="Heading 1"
            />
             <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                icon={<Heading2 className="w-4 h-4" />}
                title="Heading 2"
            />
             <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                icon={<Heading3 className="w-4 h-4" />}
                title="Heading 3"
            />
             <ToolbarButton
                onClick={() => editor.chain().focus().setParagraph().run()}
                isActive={editor.isActive('paragraph') && !editor.isActive('heading')}
                icon={<Type className="w-4 h-4" />}
                title="Paragraph"
            />
             <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                icon={<FileCode className="w-4 h-4" />}
                title="Code Block"
            />
             <div className="w-px h-6 bg-gray-200 mx-2" />
             <ToolbarButton
                onClick={addImage}
                icon={<ImageIcon className="w-4 h-4" />}
                title="Insert Image"
            />
        </div>

        {/* AI Section */}
        <div className="flex items-center space-x-2 ml-auto">
            {isAiLoading ? (
                <div className="flex items-center text-indigo-600 text-sm px-3 py-1.5 bg-indigo-50 rounded-full animate-pulse">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="font-medium">Thinking...</span>
                </div>
            ) : (
                <div className="relative">
                    <button
                        onClick={() => setShowAiMenu(!showAiMenu)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>AI Assist</span>
                    </button>
                    {showAiMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowAiMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 space-y-1">
                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Selection Actions
                                    </div>
                                    <AiMenuItem icon={<Wand2 className="w-4 h-4" />} label="Fix Grammar" onClick={() => handleAiAction(AISuggestionType.FIX_GRAMMAR)} />
                                    <AiMenuItem icon={<Check className="w-4 h-4" />} label="Summarize" onClick={() => handleAiAction(AISuggestionType.SUMMARIZE)} />
                                    <AiMenuItem icon={<List className="w-4 h-4" />} label="Rephrase" onClick={() => handleAiAction(AISuggestionType.REPHRASE)} />
                                     <div className="my-1 border-t border-gray-100" />
                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Generation
                                    </div>
                                    <AiMenuItem icon={<Sparkles className="w-4 h-4" />} label="Continue Writing" onClick={() => handleAiAction(AISuggestionType.EXPAND)} />
                                     <AiMenuItem icon={<Heading1 className="w-4 h-4" />} label="Generate Ideas" onClick={() => handleAiAction(AISuggestionType.GENERATE_IDEAS)} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
            <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Untitled Document"
                className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:outline-none focus:ring-0 bg-transparent mb-6"
            />
            <EditorContent editor={editor} />
        </div>
      </div>

      {/* Bubble Menu (Selection) */}
      {bubbleMenuPos && (
        <div 
            className="fixed z-50 flex items-center space-x-1 bg-white shadow-xl border border-gray-200 rounded-lg p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ 
                top: bubbleMenuPos.top - 50, 
                left: bubbleMenuPos.left,
                transform: 'translateX(-50%)'
            }}
            onMouseDown={(e) => e.preventDefault()}
        >
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold className="w-4 h-4" />} title="Bold" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic className="w-4 h-4" />} title="Italic" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={<UnderlineIcon className="w-4 h-4" />} title="Underline" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={<Strikethrough className="w-4 h-4" />} title="Strikethrough" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} icon={<Highlighter className="w-4 h-4" />} title="Highlight" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} icon={<Code className="w-4 h-4" />} title="Code" />
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={<Heading1 className="w-4 h-4" />} title="H1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={<Heading2 className="w-4 h-4" />} title="H2" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} icon={<Heading3 className="w-4 h-4" />} title="H3" />
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <ToolbarButton onClick={openLinkModal} isActive={editor.isActive('link')} icon={<LinkIcon className="w-4 h-4" />} title="Link" />
            {editor.isActive('link') && (
                <ToolbarButton 
                    onClick={openLink}
                    icon={editor.getAttributes('link').href?.startsWith('internal://') ? <ArrowRightCircle className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                    title={editor.getAttributes('link').href?.startsWith('internal://') ? "Go to Page" : "Open Link"}
                />
            )}
            <button onClick={() => handleAiAction(AISuggestionType.FIX_GRAMMAR)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Fix Grammar">
                <Wand2 className="w-4 h-4" />
            </button>
        </div>
      )}

      {/* Floating Menu (Empty Line) */}
      {floatingMenuPos && (
        <div 
            className="fixed z-50 flex items-center space-x-1 bg-white shadow-xl border border-gray-200 rounded-lg p-1.5 overflow-hidden animate-in slide-in-from-left-2 fade-in duration-100"
            style={{
                top: floatingMenuPos.top,
                left: floatingMenuPos.left,
                transform: 'translate(0, -110%)'
            }}
            onMouseDown={(e) => e.preventDefault()}
        >
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={<Heading1 className="w-4 h-4" />} title="H1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={<Heading2 className="w-4 h-4" />} title="H2" />
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List className="w-4 h-4" />} title="Bullet List" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered className="w-4 h-4" />} title="Ordered List" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} icon={<CheckSquare className="w-4 h-4" />} title="Task List" />
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={<Quote className="w-4 h-4" />} title="Quote" />
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<Minus className="w-4 h-4" />} title="Divider" />
            <ToolbarButton onClick={addImage} icon={<ImageIcon className="w-4 h-4" />} title="Image" />
        </div>
      )}

      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSave={handleLinkSave}
        documents={documents}
        initialUrl={editor.getAttributes('link').href}
      />

      {/* Character Count */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{editor.storage.characterCount.characters()} characters</span>
          <span>{editor.storage.characterCount.words()} words</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Saved automatically</span>
        </div>
      </div>

      {/* Error Toast */}
      {aiError && (
        <div className="absolute bottom-6 right-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg shadow-lg border border-red-100 flex items-center animate-in slide-in-from-bottom-5">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">{aiError}</span>
            <button onClick={() => setAiError(null)} className="ml-4 hover:bg-red-100 p-1 rounded">
                <X className="w-4 h-4" />
            </button>
        </div>
      )}
    </div>
  );
};

const ToolbarButton: React.FC<{ onClick: () => void; isActive?: boolean; icon: React.ReactNode; title: string; disabled?: boolean }> = ({ onClick, isActive, icon, title, disabled }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`p-1.5 rounded-md transition-all ${
            isActive 
            ? 'bg-indigo-50 text-indigo-600' 
            : disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        {icon}
    </button>
);

const AiMenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors rounded-md text-left"
    >
        <span className="text-gray-400 group-hover:text-indigo-500">{icon}</span>
        <span>{label}</span>
    </button>
);

export default Editor;