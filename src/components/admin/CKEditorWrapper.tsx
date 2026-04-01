import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Bold,
  Italic,
  Essentials,
  Paragraph,
  Heading,
  List,
  BlockQuote,
  Undo,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

interface CKEditorWrapperProps {
  content: string;
  onChange: (content: string) => void;
  language?: 'fr' | 'ar';
  placeholder?: string;
  className?: string;
}

const CKEditorWrapper: React.FC<CKEditorWrapperProps> = ({
  content,
  onChange,
  language = 'fr',
  placeholder = 'Commencez à écrire...',
  className = ''
}) => {
  const [isMounted, setMounted] = useState(false);
  const editorRef = React.useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (editorRef.current && content !== undefined && content !== editorRef.current.getData()) {
      editorRef.current.setData(content);
    }
  }, [content]);

  const isRTL = language === 'ar';

  const editorConfig = {
    licenseKey: 'GPL',
    plugins: [
      Essentials,
      Bold,
      Italic,
      Paragraph,
      Heading,
      List,
      BlockQuote,
      Undo,
    ],
    toolbar: {
      items: [
        'undo', 'redo', '|',
        'heading', '|',
        'bold', 'italic', '|',
        'bulletedList', 'numberedList', '|',
        'blockQuote'
      ]
    },
    language: {
      ui: 'fr',
      content: language
    },
    placeholder,
    heading: {
      options: [
        { model: 'paragraph' as const, title: 'Paragraphe', class: 'ck-heading_paragraph' },
        { model: 'heading1' as const, view: 'h1', title: 'Titre 1', class: 'ck-heading_heading1' },
        { model: 'heading2' as const, view: 'h2', title: 'Titre 2', class: 'ck-heading_heading2' },
        { model: 'heading3' as const, view: 'h3', title: 'Titre 3', class: 'ck-heading_heading3' }
      ]
    }
  };

  if (!isMounted) {
    return (
      <div className={`ckeditor-wrapper border rounded-lg min-h-[400px] bg-background flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground">Chargement de l'éditeur...</span>
      </div>
    );
  }

  return (
    <div className={`ckeditor-wrapper ${isRTL ? 'ckeditor-rtl' : 'ckeditor-ltr'} ${className}`}>
      <CKEditor
        editor={ClassicEditor}
        data={content}
        config={editorConfig}
        onReady={(editor) => {
          editorRef.current = editor;
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};

export default CKEditorWrapper;
