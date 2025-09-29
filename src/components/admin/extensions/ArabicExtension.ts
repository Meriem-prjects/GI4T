import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { normalizeArabicText, isArabicText, getTextDirection } from '@/lib/arabicUtils';

export interface ArabicExtensionOptions {
  autoDetect: boolean;
  normalizeOnPaste: boolean;
}

export const ArabicExtension = Extension.create<ArabicExtensionOptions>({
  name: 'arabicExtension',

  addOptions() {
    return {
      autoDetect: true,
      normalizeOnPaste: true,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('arabicHandler'),
        props: {
          handlePaste: (view, event) => {
            if (!this.options.normalizeOnPaste) return false;

            const clipboardData = event.clipboardData;
            if (!clipboardData) return false;

            const text = clipboardData.getData('text/plain');
            if (!text || !isArabicText(text)) return false;

            // Normalize Arabic text before insertion
            const normalizedText = normalizeArabicText(text);
            
            // Insert normalized text
            const { state } = view;
            const { tr } = state;
            tr.insertText(normalizedText);
            view.dispatch(tr);

            // Apply Arabic direction to the paragraph
            setTimeout(() => {
              const { state } = view;
              const { $from } = state.selection;
              const paragraph = $from.node($from.depth);
              
              if (paragraph && isArabicText(normalizedText)) {
                const { tr } = state;
                tr.setNodeMarkup($from.before($from.depth), undefined, {
                  ...paragraph.attrs,
                  dir: 'rtl',
                  class: 'arabic-text'
                });
                view.dispatch(tr);
              }
            }, 0);

            return true;
          },

          handleTextInput: (view, from, to, text) => {
            if (!this.options.autoDetect) return false;

            const normalizedText = normalizeArabicText(text);
            if (normalizedText !== text) {
              const { tr } = view.state;
              tr.insertText(normalizedText, from, to);
              view.dispatch(tr);
              return true;
            }

            return false;
          },
        },

        view: (editorView) => {
          const updateDirection = () => {
            const { state } = editorView;
            const { $from } = state.selection;
            
            // Get the current paragraph content
            const paragraph = $from.node($from.depth);
            if (!paragraph) return;

            const content = paragraph.textContent;
            if (!content) return;

            const shouldBeRTL = isArabicText(content);
            const currentDir = paragraph.attrs.dir;

            if (shouldBeRTL && currentDir !== 'rtl') {
              const { tr } = state;
              tr.setNodeMarkup($from.before($from.depth), undefined, {
                ...paragraph.attrs,
                dir: 'rtl',
                class: 'arabic-text'
              });
              editorView.dispatch(tr);
            } else if (!shouldBeRTL && currentDir === 'rtl') {
              const { tr } = state;
              tr.setNodeMarkup($from.before($from.depth), undefined, {
                ...paragraph.attrs,
                dir: 'ltr',
                class: ''
              });
              editorView.dispatch(tr);
            }
          };

          // Update direction on content changes
          editorView.dom.addEventListener('input', updateDirection);
          
          return {
            destroy: () => {
              editorView.dom.removeEventListener('input', updateDirection);
            }
          };
        }
      })
    ];
  }
});