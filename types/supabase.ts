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
      areas: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          nombre: string
          org_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          org_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string | null
          id: string
          nombre: string | null
          org_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nombre?: string | null
          org_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nombre?: string | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_tags: {
        Row: {
          candidate_id: string
          id: string
          tag_id: string
        }
        Insert: {
          candidate_id: string
          id?: string
          tag_id: string
        }
        Update: {
          candidate_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_tags_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          apellido: string
          area: string | null
          availability_id: string | null
          created_at: string | null
          cv_url: string | null
          email: string
          entrevistado: boolean | null
          estado_global: string | null
          estudios: string | null
          experiencie_id: string | null
          id: string
          localidad: string | null
          mail_bienvenida_enviado: boolean | null
          mail_rechazo_enviado: boolean | null
          nombre: string
          org_id: string
          pago_requerido: boolean | null
          payment_id: string | null
          provincia: string | null
          resumen: string | null
          telefono: string | null
        }
        Insert: {
          apellido: string
          area?: string | null
          availability_id?: string | null
          created_at?: string | null
          cv_url?: string | null
          email: string
          entrevistado?: boolean | null
          estado_global?: string | null
          estudios?: string | null
          experiencie_id?: string | null
          id?: string
          localidad?: string | null
          mail_bienvenida_enviado?: boolean | null
          mail_rechazo_enviado?: boolean | null
          nombre: string
          org_id: string
          pago_requerido?: boolean | null
          payment_id?: string | null
          provincia?: string | null
          resumen?: string | null
          telefono?: string | null
        }
        Update: {
          apellido?: string
          area?: string | null
          availability_id?: string | null
          created_at?: string | null
          cv_url?: string | null
          email?: string
          entrevistado?: boolean | null
          estado_global?: string | null
          estudios?: string | null
          experiencie_id?: string | null
          id?: string
          localidad?: string | null
          mail_bienvenida_enviado?: boolean | null
          mail_rechazo_enviado?: boolean | null
          nombre?: string
          org_id?: string
          pago_requerido?: boolean | null
          payment_id?: string | null
          provincia?: string | null
          resumen?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_experiencie_id_fkey"
            columns: ["experiencie_id"]
            isOneToOne: false
            referencedRelation: "experience"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          nombre: string
          org_id: string
          tipo: string | null
          url: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          nombre: string
          org_id: string
          tipo?: string | null
          url: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          nombre?: string
          org_id?: string
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          candidate_id: string
          created_at: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          institucion: string | null
          org_id: string
          titulo: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          institucion?: string | null
          org_id: string
          titulo?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          institucion?: string | null
          org_id?: string
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          asunto: string
          candidate_id: string | null
          created_at: string | null
          cuerpo: string
          enviado: boolean | null
          enviado_en: string | null
          id: string
          org_id: string
          tipo: string | null
          user_id: string | null
        }
        Insert: {
          asunto: string
          candidate_id?: string | null
          created_at?: string | null
          cuerpo: string
          enviado?: boolean | null
          enviado_en?: string | null
          id?: string
          org_id: string
          tipo?: string | null
          user_id?: string | null
        }
        Update: {
          asunto?: string
          candidate_id?: string | null
          created_at?: string | null
          cuerpo?: string
          enviado?: boolean | null
          enviado_en?: string | null
          id?: string
          org_id?: string
          tipo?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emails_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          job_id: string | null
          notas: string | null
          org_id: string
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          notas?: string | null
          org_id: string
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          notas?: string | null
          org_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      experience: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          org_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          org_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_candidates: {
        Row: {
          candidate_id: string
          created_at: string | null
          estado: string
          id: string
          job_id: string
          orden: number | null
          org_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          estado?: string
          id?: string
          job_id: string
          orden?: number | null
          org_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          estado?: string
          id?: string
          job_id?: string
          orden?: number | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_candidates_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_candidates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          activo: boolean | null
          area: string
          created_at: string | null
          descripcion: string | null
          id: string
          localidad: string
          modalidad: string
          org_id: string
          titulo: string
          visibility: boolean
        }
        Insert: {
          activo?: boolean | null
          area: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          localidad: string
          modalidad: string
          org_id: string
          titulo: string
          visibility?: boolean
        }
        Update: {
          activo?: boolean | null
          area?: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          localidad?: string
          modalidad?: string
          org_id?: string
          titulo?: string
          visibility?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_sections: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          order: number
          org_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order?: number
          org_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order?: number
          org_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_sections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          candidate_id: string
          contenido: string
          created_at: string | null
          id: string
          org_id: string
          user_id: string | null
        }
        Insert: {
          candidate_id: string
          contenido: string
          created_at?: string | null
          id?: string
          org_id: string
          user_id?: string | null
        }
        Update: {
          candidate_id?: string
          contenido?: string
          created_at?: string | null
          id?: string
          org_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          activo: boolean | null
          cobro_postulacion: boolean
          color_primario: string | null
          color_secundario: string | null
          created_at: string | null
          email_contacto: string | null
          id: string
          logo_url: string | null
          mail_bienvenida: string | null
          mail_bienvenida_asunto: string | null
          mail_rechazo: string | null
          mail_rechazo_asunto: string | null
          monto_postulacion: number
          mp_access_token: string | null
          mp_connected: boolean | null
          mp_refresh_token: string | null
          mp_user_id: string | null
          nav_items: string[] | null
          nombre: string
          plan_expires_at: string | null
          plan_id: string
          slug: string
          whatsapp: string | null
        }
        Insert: {
          activo?: boolean | null
          cobro_postulacion?: boolean
          color_primario?: string | null
          color_secundario?: string | null
          created_at?: string | null
          email_contacto?: string | null
          id?: string
          logo_url?: string | null
          mail_bienvenida?: string | null
          mail_bienvenida_asunto?: string | null
          mail_rechazo?: string | null
          mail_rechazo_asunto?: string | null
          monto_postulacion?: number
          mp_access_token?: string | null
          mp_connected?: boolean | null
          mp_refresh_token?: string | null
          mp_user_id?: string | null
          nav_items?: string[] | null
          nombre: string
          plan_expires_at?: string | null
          plan_id?: string
          slug: string
          whatsapp?: string | null
        }
        Update: {
          activo?: boolean | null
          cobro_postulacion?: boolean
          color_primario?: string | null
          color_secundario?: string | null
          created_at?: string | null
          email_contacto?: string | null
          id?: string
          logo_url?: string | null
          mail_bienvenida?: string | null
          mail_bienvenida_asunto?: string | null
          mail_rechazo?: string | null
          mail_rechazo_asunto?: string | null
          monto_postulacion?: number
          mp_access_token?: string | null
          mp_connected?: boolean | null
          mp_refresh_token?: string | null
          mp_user_id?: string | null
          nav_items?: string[] | null
          nombre?: string
          plan_expires_at?: string | null
          plan_id?: string
          slug?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          candidate_email: string
          created_at: string | null
          estado: string | null
          id: string
          monto: number
          mp_payment_id: string | null
          org_id: string
          token: string
          token_usado: boolean | null
        }
        Insert: {
          candidate_email: string
          created_at?: string | null
          estado?: string | null
          id?: string
          monto: number
          mp_payment_id?: string | null
          org_id: string
          token: string
          token_usado?: boolean | null
        }
        Update: {
          candidate_email?: string
          created_at?: string | null
          estado?: string | null
          id?: string
          monto?: number
          mp_payment_id?: string | null
          org_id?: string
          token?: string
          token_usado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_name: string
          has_custom_landing: boolean | null
          has_mass_email: boolean | null
          id: string
          max_candidates: number | null
          max_jobs: number | null
          max_users: number | null
          name: string
          price: number
          storage_mb: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_name: string
          has_custom_landing?: boolean | null
          has_mass_email?: boolean | null
          id?: string
          max_candidates?: number | null
          max_jobs?: number | null
          max_users?: number | null
          name: string
          price: number
          storage_mb?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_name?: string
          has_custom_landing?: boolean | null
          has_mass_email?: boolean | null
          id?: string
          max_candidates?: number | null
          max_jobs?: number | null
          max_users?: number | null
          name?: string
          price?: number
          storage_mb?: number | null
        }
        Relationships: []
      }
      referencesjobs: {
        Row: {
          candidate_id: string
          cargo: string | null
          created_at: string | null
          email: string | null
          empresa: string | null
          id: string
          nombre: string
          org_id: string
          relacion: string | null
          telefono: string | null
        }
        Insert: {
          candidate_id: string
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          nombre: string
          org_id: string
          relacion?: string | null
          telefono?: string | null
        }
        Update: {
          candidate_id?: string
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          nombre?: string
          org_id?: string
          relacion?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referencesjobs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referencesjobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          id: string
          nombre: string
          org_id: string
        }
        Insert: {
          color?: string | null
          id?: string
          nombre: string
          org_id: string
        }
        Update: {
          color?: string | null
          id?: string
          nombre?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          country_code: string | null
          created_at: string | null
          email: string
          id: string
          nombre: string
          org_id: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          country_code?: string | null
          created_at?: string | null
          email: string
          id: string
          nombre: string
          org_id: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          country_code?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          org_id?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      work_history: {
        Row: {
          actual: boolean | null
          candidate_id: string
          cargo: string | null
          created_at: string | null
          descripcion: string | null
          empresa: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          localidad: string | null
          org_id: string
        }
        Insert: {
          actual?: boolean | null
          candidate_id: string
          cargo?: string | null
          created_at?: string | null
          descripcion?: string | null
          empresa?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          localidad?: string | null
          org_id: string
        }
        Update: {
          actual?: boolean | null
          candidate_id?: string
          cargo?: string | null
          created_at?: string | null
          descripcion?: string | null
          empresa?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          localidad?: string | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_history_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_history_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_org_id: { Args: never; Returns: string }
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
