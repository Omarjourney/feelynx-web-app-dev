export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      content_posts: {
        Row: {
          bundle_ids: string[] | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          media_type: string | null
          media_url: string | null
          price: number | null
          published: boolean | null
          scheduled_at: string | null
          title: string | null
        }
        Insert: {
          bundle_ids?: string[] | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          price?: number | null
          published?: boolean | null
          scheduled_at?: string | null
          title?: string | null
        }
        Update: {
          bundle_ids?: string[] | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          price?: number | null
          published?: boolean | null
          scheduled_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_posts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["user_id"]
          },
        ]
      }
      creators: {
        Row: {
          bio: string | null
          created_at: string | null
          display_name: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_name: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_name?: string
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: number
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: number
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: number
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      livestreams: {
        Row: {
          created_at: string | null
          creator_id: string | null
          ended_at: string | null
          id: string
          scheduled_at: string | null
          started_at: string | null
          title: string | null
          token_goal: number | null
          token_progress: number | null
          top_fans: Json | null
          viewers: number | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          ended_at?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string | null
          title?: string | null
          token_goal?: number | null
          token_progress?: number | null
          top_fans?: Json | null
          viewers?: number | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          ended_at?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string | null
          title?: string | null
          token_goal?: number | null
          token_progress?: number | null
          top_fans?: Json | null
          viewers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "livestreams_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          media_url: string | null
          sender_id: string | null
          text: string | null
          thread_id: string | null
          tip: number | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          media_url?: string | null
          sender_id?: string | null
          text?: string | null
          thread_id?: string | null
          tip?: number | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          media_url?: string | null
          sender_id?: string | null
          text?: string | null
          thread_id?: string | null
          tip?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number | null
          content_id: string | null
          id: string
          purchased_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          content_id?: string | null
          id?: string
          purchased_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          content_id?: string | null
          id?: string
          purchased_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          badge: string | null
          creator_id: string | null
          discount_percent: number | null
          duration_days: number | null
          id: string
          name: string | null
          perks: string | null
          price: number | null
          promo_code: string | null
          trial_days: number | null
          visibility: string | null
        }
        Insert: {
          badge?: string | null
          creator_id?: string | null
          discount_percent?: number | null
          duration_days?: number | null
          id?: string
          name?: string | null
          perks?: string | null
          price?: number | null
          promo_code?: string | null
          trial_days?: number | null
          visibility?: string | null
        }
        Update: {
          badge?: string | null
          creator_id?: string | null
          discount_percent?: number | null
          duration_days?: number | null
          id?: string
          name?: string | null
          perks?: string | null
          price?: number | null
          promo_code?: string | null
          trial_days?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_tiers_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["user_id"]
          },
        ]
      }
      fan_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          renews_at: string | null
          status: string | null
          tier_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          renews_at?: string | null
          status?: string | null
          tier_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          renews_at?: string | null
          status?: string | null
          tier_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fan_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          expires_at: string | null
          id: string
          started_at: string | null
          tier_id: string | null
          user_id: string | null
        }
        Insert: {
          expires_at?: string | null
          id?: string
          started_at?: string | null
          tier_id?: string | null
          user_id?: string | null
        }
        Update: {
          expires_at?: string | null
          id?: string
          started_at?: string | null
          tier_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      Transactions: {
        Row: {
          amount: number | null
          created_at: string
          id: number
          note: string | null
          source_id: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: number
          note?: string | null
          source_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: number
          note?: string | null
          source_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          id: number
          user_id: string
        }
        Insert: {
          balance?: number
          id?: number
          user_id: string
        }
        Update: {
          balance?: number
          id?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_token_progress: {
        Args: { stream_id: string; amount: number; fan_id: string }
        Returns: undefined
      }
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
