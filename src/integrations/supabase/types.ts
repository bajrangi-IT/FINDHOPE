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
      camera_sightings: {
        Row: {
          camera_location: string
          case_id: string
          confidence_score: number | null
          created_at: string
          detected_at: string
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          volunteer_notified: boolean | null
        }
        Insert: {
          camera_location: string
          case_id: string
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          volunteer_notified?: boolean | null
        }
        Update: {
          camera_location?: string
          case_id?: string
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          volunteer_notified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "camera_sightings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_subscribers: {
        Row: {
          case_id: string
          created_at: string
          email: string
          id: string
          phone: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          email: string
          id?: string
          phone?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_subscribers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          accident_type: string | null
          age: number | null
          case_type: Database["public"]["Enums"]["case_type"]
          cctv_footage_info: string | null
          clothes_description: string | null
          community_contacts: string | null
          contact_number: string | null
          created_at: string
          email: string | null
          full_body_photo_url: string | null
          full_name: string | null
          gender: string | null
          health_notes: string | null
          hospital_location: string | null
          hospital_name: string | null
          id: string
          injury_description: string | null
          known_routes: string | null
          last_online_activity: string | null
          last_seen_date: string | null
          last_seen_location: string | null
          last_seen_time: string | null
          photo_url: string | null
          physical_marks: string | null
          police_station: string | null
          priority: string | null
          qr_code_link: string | null
          recovered_belongings: string | null
          relation: string | null
          reporter_contact: string | null
          reporter_name: string | null
          reward_amount: number | null
          social_media_links: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accident_type?: string | null
          age?: number | null
          case_type?: Database["public"]["Enums"]["case_type"]
          cctv_footage_info?: string | null
          clothes_description?: string | null
          community_contacts?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string | null
          full_body_photo_url?: string | null
          full_name?: string | null
          gender?: string | null
          health_notes?: string | null
          hospital_location?: string | null
          hospital_name?: string | null
          id?: string
          injury_description?: string | null
          known_routes?: string | null
          last_online_activity?: string | null
          last_seen_date?: string | null
          last_seen_location?: string | null
          last_seen_time?: string | null
          photo_url?: string | null
          physical_marks?: string | null
          police_station?: string | null
          priority?: string | null
          qr_code_link?: string | null
          recovered_belongings?: string | null
          relation?: string | null
          reporter_contact?: string | null
          reporter_name?: string | null
          reward_amount?: number | null
          social_media_links?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accident_type?: string | null
          age?: number | null
          case_type?: Database["public"]["Enums"]["case_type"]
          cctv_footage_info?: string | null
          clothes_description?: string | null
          community_contacts?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string | null
          full_body_photo_url?: string | null
          full_name?: string | null
          gender?: string | null
          health_notes?: string | null
          hospital_location?: string | null
          hospital_name?: string | null
          id?: string
          injury_description?: string | null
          known_routes?: string | null
          last_online_activity?: string | null
          last_seen_date?: string | null
          last_seen_location?: string | null
          last_seen_time?: string | null
          photo_url?: string | null
          physical_marks?: string | null
          police_station?: string | null
          priority?: string | null
          qr_code_link?: string | null
          recovered_belongings?: string | null
          relation?: string | null
          reporter_contact?: string | null
          reporter_name?: string | null
          reward_amount?: number | null
          social_media_links?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          sender_id: string | null
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          sender_id?: string | null
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          area: string
          created_at: string
          full_name: string
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string
          user_id: string
        }
        Insert: {
          area: string
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone: string
          user_id: string
        }
        Update: {
          area?: string
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      case_type: "missing" | "unknown_accident"
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
      app_role: ["admin", "user"],
      case_type: ["missing", "unknown_accident"],
    },
  },
} as const
