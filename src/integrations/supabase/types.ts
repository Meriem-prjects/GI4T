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
            referencedRelation: "documents"
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
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_pdfa_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          pdfa_documents: number
          pdfa_percentage: number
          pdfa_versions: Json
          total_documents: number
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
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
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      event_type: "action_realisee" | "evenement_a_venir"
      user_role: "admin" | "editor" | "validator"
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
      user_role: ["admin", "editor", "validator"],
    },
  },
} as const
