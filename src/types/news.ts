export interface News {
  id: string;
  title: string;
  title_ar?: string | null;
  excerpt: string;
  excerpt_ar?: string | null;
  content?: string | null;
  content_ar?: string | null;
  category: 'jurisprudence' | 'odf' | 'event' | 'publication' | 'acces_droits';
  tags: string[];
  tags_ar: string[];
  image_url?: string | null;
  read_time: number;
  views: number;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface NewsFormData {
  title: string;
  title_ar?: string;
  excerpt: string;
  excerpt_ar?: string;
  content?: string;
  content_ar?: string;
  category: News['category'];
  tags?: string[];
  tags_ar?: string[];
  image_url?: string;
  read_time?: number;
  is_featured?: boolean;
  is_published?: boolean;
}

export interface NewsFilters {
  category?: string;
  search?: string;
  is_published?: boolean;
  is_featured?: boolean;
}

export const NEWS_CATEGORIES = [
  { value: 'jurisprudence', label: 'Jurisprudence', labelAr: 'الاجتهاد القضائي' },
  { value: 'odf', label: 'ODF', labelAr: 'مرصد الحقوق' },
  { value: 'event', label: 'Événement', labelAr: 'حدث' },
  { value: 'publication', label: 'Publication', labelAr: 'منشور' },
  { value: 'acces_droits', label: 'Accès aux droits', labelAr: 'النفاذ إلى الحقوق' },
] as const;
