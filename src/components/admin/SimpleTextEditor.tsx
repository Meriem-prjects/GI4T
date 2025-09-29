import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  Heading1,
  Heading2,
  Heading3,
  Type
} from 'lucide-react';
import { sanitizeArabicInput, isArabicText, getTextDirection } from '@/lib/arabicUtils';

interface SimpleTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Commencez à écrire...",
  className = "",
  dir = 'ltr'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isArabic, setIsArabic] = useState(false);
  const [textDirection, setTextDirection] = useState<'ltr' | 'rtl'>(dir);

  // Detect Arabic content and update direction
  useEffect(() => {
    const arabicDetected = isArabicText(content);
    setIsArabic(arabicDetected);
    setTextDirection(getTextDirection(content));
  }, [content]);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      prefix + selectedText + suffix + 
      content.substring(end);
    
    onChange(sanitizeArabicInput(newContent));
    
    // Set cursor position after the inserted formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const insertAtLineStart = (marker: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    
    // Find the start of the current line
    const beforeCursor = content.substring(0, start);
    const lastNewlineIndex = beforeCursor.lastIndexOf('\n');
    const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
    
    // Get the current line
    const afterCursor = content.substring(start);
    const nextNewlineIndex = afterCursor.indexOf('\n');
    const lineEnd = nextNewlineIndex === -1 ? content.length : start + nextNewlineIndex;
    const currentLine = content.substring(lineStart, lineEnd);
    
    // Check if line already has a heading marker
    const headingMatch = currentLine.match(/^(#{1,3})\s*/);
    
    let newLine: string;
    let newCursorPos: number;
    
    if (headingMatch) {
      // Replace existing heading marker
      newLine = marker + ' ' + currentLine.substring(headingMatch[0].length).trim();
      newCursorPos = lineStart + marker.length + 1;
    } else {
      // Add new heading marker
      newLine = marker + ' ' + currentLine.trim();
      newCursorPos = lineStart + marker.length + 1;
    }
    
    const newContent = 
      content.substring(0, lineStart) + 
      newLine + 
      content.substring(lineEnd);
    
    onChange(sanitizeArabicInput(newContent));
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const ToolbarButton = ({ 
    onClick, 
    children, 
    title,
    variant = "ghost"
  }: { 
    onClick: () => void; 
    children: React.ReactNode; 
    title: string;
    variant?: "ghost" | "default";
  }) => (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('text/plain');
    const sanitizedText = sanitizeArabicInput(clipboardData);
    
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = 
      content.substring(0, start) + 
      sanitizedText + 
      content.substring(end);
    
    onChange(newContent);
    
    // Set cursor position after the pasted content
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + sanitizedText.length,
        start + sanitizedText.length
      );
    }, 0);
  };

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/50">
        {/* Headings */}
        <ToolbarButton
          onClick={() => insertAtLineStart('#')}
          title="Titre 1 (# Titre)"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => insertAtLineStart('##')}
          title="Titre 2 (## Titre)"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => insertAtLineStart('###')}
          title="Titre 3 (### Titre)"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => insertAtLineStart('')}
          title="Texte normal"
        >
          <Type className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => insertFormatting('**', '**')}
          title="Gras (**texte**)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => insertFormatting('*', '*')}
          title="Italique (*texte*)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div className="bg-background">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(sanitizeArabicInput(e.target.value))}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={`min-h-[400px] border-0 focus-visible:ring-0 resize-none text-sm leading-relaxed ${
            isArabic ? 'font-arabic-serif arabic-text-serif' : 'font-mono'
          }`}
          dir={textDirection}
        />
      </div>
    </div>
  );
};

export default SimpleTextEditor;