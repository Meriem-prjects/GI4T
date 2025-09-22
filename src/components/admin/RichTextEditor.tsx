import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Quote,
  Minus,
  Undo,
  Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  className,
  placeholder,
  dir = 'ltr'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // We'll use our custom heading extension
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextStyle,
      Color,
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
          dir === 'rtl' && 'prose-rtl',
          className
        ),
        dir,
      },
    },
  });

  if (!editor) {
    return null;
  }

  const MenuBar = () => {
    return (
      <div className="border-b p-2 flex flex-wrap gap-1">
        {/* Headings */}
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="h-8 px-2"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="h-8 px-2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="h-8 px-2"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={editor.isActive('paragraph') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className="h-8 px-2"
        >
          <Type className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text formatting */}
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 px-2"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 px-2"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('underline') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="h-8 px-2"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 px-2"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 px-2"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Block elements */}
        <Button
          type="button"
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="h-8 px-2"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-8 px-2"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 px-2"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 px-2"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className={cn('border rounded-md overflow-hidden', className)}>
      <MenuBar />
      <EditorContent 
        editor={editor} 
        className="min-h-[400px] focus-within:outline-none"
      />
      {placeholder && !content && (
        <div className="absolute top-14 left-4 text-muted-foreground pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;