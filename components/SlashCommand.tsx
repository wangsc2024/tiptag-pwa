import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import CommandList from './CommandList';
import { Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote, Code, Minus, Image as ImageIcon } from 'lucide-react';
import React from 'react';

// Exported for testing purposes
export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Heading 1',
      icon: <Heading1 className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      icon: <Heading2 className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Bullet List',
      icon: <List className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Ordered List',
      icon: <ListOrdered className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
        title: 'Task List',
        icon: <CheckSquare className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
      },
    {
      title: 'Quote',
      icon: <Quote className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: 'Code Block',
      icon: <Code className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: 'Divider',
      icon: <Minus className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
        title: 'Image',
        icon: <ImageIcon className="w-4 h-4" />,
        command: ({ editor, range }: any) => {
             editor.chain().focus().deleteRange(range).run();
             const input = document.getElementById('hidden-image-input');
             if (input) input.click();
        },
    }
  ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
};

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const configureSlashCommand = () => {
    return SlashCommand.configure({
        suggestion: {
            items: getSuggestionItems,
            render: () => {
                let component: any;
                let popup: any;

                return {
                    onStart: (props: any) => {
                        component = new ReactRenderer(CommandList, {
                            props,
                            editor: props.editor,
                        });

                        if (!props.clientRect) {
                            return;
                        }

                        popup = tippy('body', {
                            getReferenceClientRect: props.clientRect,
                            appendTo: () => document.body,
                            content: component.element,
                            showOnCreate: true,
                            interactive: true,
                            trigger: 'manual',
                            placement: 'bottom-start',
                            theme: 'light',
                        });
                    },

                    onUpdate(props: any) {
                        component.updateProps(props);

                        if (!props.clientRect) {
                            return;
                        }

                        popup[0].setProps({
                            getReferenceClientRect: props.clientRect,
                        });
                    },

                    onKeyDown(props: any) {
                        if (props.event.key === 'Escape') {
                            popup[0].hide();
                            return true;
                        }

                        return component.ref?.onKeyDown(props);
                    },

                    onExit() {
                        popup[0].destroy();
                        component.destroy();
                    },
                };
            },
        }
    })
}