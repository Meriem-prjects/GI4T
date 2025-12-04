import { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Bold,
  Italic,
  Essentials,
  Paragraph
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

interface CKEditorMiniProps {
  content: string;
  onChange: (content: string) => void;
  language?: 'fr' | 'ar';
  placeholder?: string;
  className?: string;
}

const CKEditorMini = ({
  content,
  onChange,
  language = 'fr',
  placeholder = '',
  className = ''
}: CKEditorMiniProps) => {
  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const editorConfig = {
    plugins: [Essentials, Bold, Italic, Paragraph],
    toolbar: ['bold', 'italic'],
    language: {
      ui: 'fr',
      content: language
    },
    placeholder,
    heading: {
      options: [
        { model: 'paragraph' as const, title: 'Paragraphe', class: 'ck-heading_paragraph' }
      ]
    }
  };

  if (!isMounted) {
    return (
      <div className={`ckeditor-mini-loading border rounded-md p-3 min-h-[100px] bg-muted/50 ${className}`}>
        <span className="text-muted-foreground text-sm">Chargement...</span>
      </div>
    );
  }

  return (
    <div className={`ckeditor-mini ${language === 'ar' ? 'ckeditor-rtl' : 'ckeditor-ltr'} ${className}`}>
      <CKEditor
        editor={ClassicEditor}
        data={content}
        config={editorConfig}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};

export default CKEditorMini;
