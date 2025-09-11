export interface Decision {
  id: number;
  number: string;
  title: string;
  court: string;
  date: string;
  description: string;
  tags: string[];
  importance: 'Majeure' | 'Important' | 'Standard' | 'Consultatif';
  importanceColor: string;
  fullText?: string;
  relatedDecisions?: Decision[];
  caseNumber?: string;
  jurisdiction?: string;
  judges?: string[];
  parties?: {
    plaintiff: string;
    defendant: string;
  };
  summary?: string;
  legalPrinciples?: string[];
  downloadUrl?: string;
  scanImages?: string[];
}

export interface SearchFilters {
  tribunal: string;
  dateFrom?: string;
  dateTo?: string;
  fundamentalRights: string[];
  decisionType: string;
  sortBy: string;
}