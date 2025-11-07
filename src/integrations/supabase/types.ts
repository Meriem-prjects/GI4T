export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      acces_droits_permissions: {
        Row: {
          created_at: string | null
          id: string
          section: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          section: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          section?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          name: string
          name_ar: string | null
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          name: string
          name_ar?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_config: {
        Row: {
          created_at: string
          font_family: string
          id: string
          primary_color: string
          secondary_color: string
          system_prompt: string
          tone: string
          updated_at: string
          welcome_message: string
        }
        Insert: {
          created_at?: string
          font_family?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          system_prompt?: string
          tone?: string
          updated_at?: string
          welcome_message?: string
        }
        Update: {
          created_at?: string
          font_family?: string
          id?: string
          primary_color?: string
          secondary_color?: string
          system_prompt?: string
          tone?: string
          updated_at?: string
          welcome_message?: string
        }
        Relationships: []
      }
      chatbot_training_documents: {
        Row: {
          category: string | null
          content: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          is_active: boolean
          title: string
          title_ar: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          title: string
          title_ar?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          title?: string
          title_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      court_types: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          name: string
          name_ar: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          name: string
          name_ar?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          name?: string
          name_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      document_categories: {
        Row: {
          category_id: string
          created_at: string
          document_id: string
          id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          document_id: string
          id?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_categories_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_statistics"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "document_categories_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_comments: {
        Row: {
          admin_user_id: string | null
          author_email: string
          author_name: string
          content: string
          created_at: string | null
          document_id: string
          id: string
          is_admin_reply: boolean | null
          parent_comment_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_user_id?: string | null
          author_email: string
          author_name: string
          content: string
          created_at?: string | null
          document_id: string
          id?: string
          is_admin_reply?: boolean | null
          parent_comment_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string | null
          author_email?: string
          author_name?: string
          content?: string
          created_at?: string | null
          document_id?: string
          id?: string
          is_admin_reply?: boolean | null
          parent_comment_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_statistics"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          name: string
          name_ar: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          name: string
          name_ar?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          name?: string
          name_ar?: string | null
        }
        Relationships: []
      }
      document_views: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          ip_address: string | null
          read_duration: number | null
          session_id: string
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          ip_address?: string | null
          read_duration?: number | null
          session_id: string
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          ip_address?: string | null
          read_duration?: number | null
          session_id?: string
          user_agent?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_views_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_statistics"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "document_views_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          archival_features: Json | null
          archival_metadata: Json | null
          author: string | null
          author_ar: string | null
          case_number: string | null
          case_numbers: string[] | null
          category_id: string | null
          content: string
          court: string | null
          court_ar: string | null
          court_category: string | null
          court_category_ar: string | null
          court_category_type: string | null
          court_category_type_ar: string | null
          court_level: string | null
          court_level_ar: string | null
          created_at: string
          dates: string[] | null
          defendant: string | null
          defendant_ar: string | null
          document_type: string | null
          document_type_id: string | null
          embedding: string | null
          entities: string[] | null
          file_size: number | null
          file_url: string | null
          id: string
          jurisdiction: string | null
          keywords: string[] | null
          keywords_ar: string[] | null
          language: string | null
          legal_domains: string[] | null
          legal_references: string[] | null
          main_topics: string[] | null
          original_filename: string
          page_contents: Json | null
          page_count: number | null
          pdf_url: string | null
          pdfa_compliance: boolean | null
          pdfa_conformance_level: string | null
          pdfa_version: string | null
          plaintiff: string | null
          plaintiff_ar: string | null
          processed_pages: number | null
          processing_job_id: string | null
          published: boolean | null
          status: string | null
          subtitle: string | null
          subtitle_ar: string | null
          summary: string | null
          summary_ar: string | null
          textual_metadata: string | null
          title: string
          title_ar: string | null
          total_pages: number | null
          translated_content: string | null
          updated_at: string
          user_id: string | null
          year: number | null
        }
        Insert: {
          archival_features?: Json | null
          archival_metadata?: Json | null
          author?: string | null
          author_ar?: string | null
          case_number?: string | null
          case_numbers?: string[] | null
          category_id?: string | null
          content: string
          court?: string | null
          court_ar?: string | null
          court_category?: string | null
          court_category_ar?: string | null
          court_category_type?: string | null
          court_category_type_ar?: string | null
          court_level?: string | null
          court_level_ar?: string | null
          created_at?: string
          dates?: string[] | null
          defendant?: string | null
          defendant_ar?: string | null
          document_type?: string | null
          document_type_id?: string | null
          embedding?: string | null
          entities?: string[] | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          jurisdiction?: string | null
          keywords?: string[] | null
          keywords_ar?: string[] | null
          language?: string | null
          legal_domains?: string[] | null
          legal_references?: string[] | null
          main_topics?: string[] | null
          original_filename: string
          page_contents?: Json | null
          page_count?: number | null
          pdf_url?: string | null
          pdfa_compliance?: boolean | null
          pdfa_conformance_level?: string | null
          pdfa_version?: string | null
          plaintiff?: string | null
          plaintiff_ar?: string | null
          processed_pages?: number | null
          processing_job_id?: string | null
          published?: boolean | null
          status?: string | null
          subtitle?: string | null
          subtitle_ar?: string | null
          summary?: string | null
          summary_ar?: string | null
          textual_metadata?: string | null
          title: string
          title_ar?: string | null
          total_pages?: number | null
          translated_content?: string | null
          updated_at?: string
          user_id?: string | null
          year?: number | null
        }
        Update: {
          archival_features?: Json | null
          archival_metadata?: Json | null
          author?: string | null
          author_ar?: string | null
          case_number?: string | null
          case_numbers?: string[] | null
          category_id?: string | null
          content?: string
          court?: string | null
          court_ar?: string | null
          court_category?: string | null
          court_category_ar?: string | null
          court_category_type?: string | null
          court_category_type_ar?: string | null
          court_level?: string | null
          court_level_ar?: string | null
          created_at?: string
          dates?: string[] | null
          defendant?: string | null
          defendant_ar?: string | null
          document_type?: string | null
          document_type_id?: string | null
          embedding?: string | null
          entities?: string[] | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          jurisdiction?: string | null
          keywords?: string[] | null
          keywords_ar?: string[] | null
          language?: string | null
          legal_domains?: string[] | null
          legal_references?: string[] | null
          main_topics?: string[] | null
          original_filename?: string
          page_contents?: Json | null
          page_count?: number | null
          pdf_url?: string | null
          pdfa_compliance?: boolean | null
          pdfa_conformance_level?: string | null
          pdfa_version?: string | null
          plaintiff?: string | null
          plaintiff_ar?: string | null
          processed_pages?: number | null
          processing_job_id?: string | null
          published?: boolean | null
          status?: string | null
          subtitle?: string | null
          subtitle_ar?: string | null
          summary?: string | null
          summary_ar?: string | null
          textual_metadata?: string | null
          title?: string
          title_ar?: string | null
          total_pages?: number | null
          translated_content?: string | null
          updated_at?: string
          user_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_processing_job_id_fkey"
            columns: ["processing_job_id"]
            isOneToOne: false
            referencedRelation: "processing_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          email: string
          event_id: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          registered_at: string | null
        }
        Insert: {
          email: string
          event_id: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          registered_at?: string | null
        }
        Update: {
          email?: string
          event_id?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          registered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          available_places: number | null
          created_at: string | null
          created_by: string | null
          description: string
          description_ar: string | null
          event_date: string
          governorate_id: string | null
          id: string
          images: string[] | null
          latitude: number | null
          longitude: number | null
          people_impacted: number | null
          registration_enabled: boolean | null
          status: string | null
          title: string
          title_ar: string | null
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string | null
        }
        Insert: {
          available_places?: number | null
          created_at?: string | null
          created_by?: string | null
          description: string
          description_ar?: string | null
          event_date: string
          governorate_id?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          people_impacted?: number | null
          registration_enabled?: boolean | null
          status?: string | null
          title: string
          title_ar?: string | null
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
        }
        Update: {
          available_places?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          description_ar?: string | null
          event_date?: string
          governorate_id?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          people_impacted?: number | null
          registration_enabled?: boolean | null
          status?: string | null
          title?: string
          title_ar?: string | null
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          answer_ar: string | null
          category: string
          category_ar: string | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question: string
          question_ar: string | null
          updated_at: string
        }
        Insert: {
          answer: string
          answer_ar?: string | null
          category: string
          category_ar?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question: string
          question_ar?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string
          answer_ar?: string | null
          category?: string
          category_ar?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question?: string
          question_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      governorates: {
        Row: {
          area_km2: number | null
          code: string
          created_at: string | null
          geojson: Json
          id: string
          name: string
          name_ar: string | null
          population: number | null
          updated_at: string | null
        }
        Insert: {
          area_km2?: number | null
          code: string
          created_at?: string | null
          geojson: Json
          id?: string
          name: string
          name_ar?: string | null
          population?: number | null
          updated_at?: string | null
        }
        Update: {
          area_km2?: number | null
          code?: string
          created_at?: string | null
          geojson?: Json
          id?: string
          name?: string
          name_ar?: string | null
          population?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jurisdiction_levels: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          level_order: number
          name: string
          name_ar: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          level_order?: number
          name: string
          name_ar?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          level_order?: number
          name?: string
          name_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          name_native: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          name_native: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          name_native?: string
        }
        Relationships: []
      }
      processing_jobs: {
        Row: {
          created_at: string
          current_step: string | null
          error_message: string | null
          file_name: string
          file_size: number
          id: string
          processed_pages: number | null
          progress: number
          result_data: Json | null
          status: string
          total_pages: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_step?: string | null
          error_message?: string | null
          file_name: string
          file_size: number
          id?: string
          processed_pages?: number | null
          progress?: number
          result_data?: Json | null
          status?: string
          total_pages?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_step?: string | null
          error_message?: string | null
          file_name?: string
          file_size?: number
          id?: string
          processed_pages?: number | null
          progress?: number
          result_data?: Json | null
          status?: string
          total_pages?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      useful_addresses: {
        Row: {
          address: string
          address_ar: string
          category: string
          category_ar: string
          created_at: string
          email: string | null
          governorate_id: string | null
          hours: string | null
          hours_ar: string | null
          id: string
          is_published: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          name_ar: string
          phone: string
          updated_at: string
        }
        Insert: {
          address: string
          address_ar: string
          category?: string
          category_ar?: string
          created_at?: string
          email?: string | null
          governorate_id?: string | null
          hours?: string | null
          hours_ar?: string | null
          id?: string
          is_published?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_ar: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string
          address_ar?: string
          category?: string
          category_ar?: string
          created_at?: string
          email?: string | null
          governorate_id?: string | null
          hours?: string | null
          hours_ar?: string | null
          id?: string
          is_published?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_ar?: string
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "useful_addresses_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      document_statistics: {
        Row: {
          avg_read_duration: number | null
          document_id: string | null
          last_viewed_at: string | null
          pending_comments: number | null
          title: string | null
          title_ar: string | null
          total_comments: number | null
          total_reads: number | null
          total_views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_global_statistics: {
        Args: { period_days?: number }
        Returns: {
          avg_read_duration: number
          pending_comments: number
          top_articles_count: number
          total_comments: number
          total_reads: number
          total_views: number
          unique_sessions: number
        }[]
      }
      get_pdfa_statistics: {
        Args: never
        Returns: {
          pdfa_documents: number
          pdfa_percentage: number
          pdfa_versions: Json
          total_documents: number
        }[]
      }
      has_acces_droits_permission: {
        Args: { _section: string; _user_id: string }
        Returns: boolean
      }
      has_acces_droits_role: { Args: { _user_id: string }; Returns: boolean }
      has_observatoire_role: { Args: { _user_id: string }; Returns: boolean }
      match_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      event_type: "action_realisee" | "evenement_a_venir"
      user_role:
        | "admin"
        | "editor"
        | "validator"
        | "admin_observatoire"
        | "admin_acces_droits"
        | "editor_acces_droits"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_type: ["action_realisee", "evenement_a_venir"],
      user_role: [
        "admin",
        "editor",
        "validator",
        "admin_observatoire",
        "admin_acces_droits",
        "editor_acces_droits",
      ],
    },
  },
} as const
