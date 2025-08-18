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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      branch_ref: {
        Row: {
          address: string | null
          branch_id: number | null
          branch_name: string
          branch_type: string | null
          district: string | null
          division: number | null
          fax: string | null
          parent_branch: string | null
          province: string | null
          region: number | null
          resdesc: string | null
          service_time: string | null
          telephone: string | null
          work_time: string | null
        }
        Insert: {
          address?: string | null
          branch_id?: number | null
          branch_name: string
          branch_type?: string | null
          district?: string | null
          division?: number | null
          fax?: string | null
          parent_branch?: string | null
          province?: string | null
          region?: number | null
          resdesc?: string | null
          service_time?: string | null
          telephone?: string | null
          work_time?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: number | null
          branch_name?: string
          branch_type?: string | null
          district?: string | null
          division?: number | null
          fax?: string | null
          parent_branch?: string | null
          province?: string | null
          region?: number | null
          resdesc?: string | null
          service_time?: string | null
          telephone?: string | null
          work_time?: string | null
        }
        Relationships: []
      }
      category_ref: {
        Row: {
          allow: string
          create_at: string
          definition: string | null
          example_sentence: string | null
          last_update: string
          main_topic: string
          no: number
          sub_topic: string
        }
        Insert: {
          allow?: string
          create_at?: string
          definition?: string | null
          example_sentence?: string | null
          last_update?: string
          main_topic: string
          no?: number
          sub_topic: string
        }
        Update: {
          allow?: string
          create_at?: string
          definition?: string | null
          example_sentence?: string | null
          last_update?: string
          main_topic?: string
          no?: number
          sub_topic?: string
        }
        Relationships: []
      }
      raw_comment: {
        Row: {
          branch_name: string
          comment: string
          comment_date: string
          comment_id: string
          comment_meaning: string
          contact: string | null
          create_at: string
          district: string | null
          division: string | null
          province: string
          region: string | null
          resdesc: string | null
          satisfaction_1: number
          satisfaction_2: number
          satisfaction_3: number
          satisfaction_4: number
          satisfaction_5: number
          satisfaction_6: number
          satisfaction_7: number
          service_1: string
          service_2: string
          service_3: string
          service_4: string
          service_5: string
        }
        Insert: {
          branch_name: string
          comment: string
          comment_date: string
          comment_id?: string
          comment_meaning?: string
          contact?: string | null
          create_at?: string
          district?: string | null
          division?: string | null
          province: string
          region?: string | null
          resdesc?: string | null
          satisfaction_1: number
          satisfaction_2: number
          satisfaction_3: number
          satisfaction_4: number
          satisfaction_5: number
          satisfaction_6: number
          satisfaction_7: number
          service_1?: string
          service_2?: string
          service_3?: string
          service_4?: string
          service_5?: string
        }
        Update: {
          branch_name?: string
          comment?: string
          comment_date?: string
          comment_id?: string
          comment_meaning?: string
          contact?: string | null
          create_at?: string
          district?: string | null
          division?: string | null
          province?: string
          region?: string | null
          resdesc?: string | null
          satisfaction_1?: number
          satisfaction_2?: number
          satisfaction_3?: number
          satisfaction_4?: number
          satisfaction_5?: number
          satisfaction_6?: number
          satisfaction_7?: number
          service_1?: string
          service_2?: string
          service_3?: string
          service_4?: string
          service_5?: string
        }
        Relationships: []
      }
      sentence_category: {
        Row: {
          comment_id: string
          created_at: string
          main_category: string
          sentence: string | null
          sentence_id: string
          sentiment: string
          sub_category: string
        }
        Insert: {
          comment_id?: string
          created_at?: string
          main_category: string
          sentence?: string | null
          sentence_id?: string
          sentiment: string
          sub_category: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          main_category?: string
          sentence?: string | null
          sentence_id?: string
          sentiment?: string
          sub_category?: string
        }
        Relationships: [
          {
            foreignKeyName: "sentence_category_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "raw_comment"
            referencedColumns: ["comment_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
