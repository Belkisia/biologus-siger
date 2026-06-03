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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cdfs: {
        Row: {
          created_at: string
          data_destinacao: string
          destinador: string | null
          id: string
          mtr_id: string
          numero: string
          observacoes: string | null
          owner_id: string
          quantidade_destinada: number | null
          tecnologia: string | null
          updated_at: string
          url_documento: string | null
        }
        Insert: {
          created_at?: string
          data_destinacao: string
          destinador?: string | null
          id?: string
          mtr_id: string
          numero: string
          observacoes?: string | null
          owner_id: string
          quantidade_destinada?: number | null
          tecnologia?: string | null
          updated_at?: string
          url_documento?: string | null
        }
        Update: {
          created_at?: string
          data_destinacao?: string
          destinador?: string | null
          id?: string
          mtr_id?: string
          numero?: string
          observacoes?: string | null
          owner_id?: string
          quantidade_destinada?: number | null
          tecnologia?: string | null
          updated_at?: string
          url_documento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cdfs_mtr_id_fkey"
            columns: ["mtr_id"]
            isOneToOne: false
            referencedRelation: "mtrs"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnae: string | null
          cnpj: string
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          latitude: number | null
          longitude: number | null
          nome_fantasia: string | null
          numero: string | null
          observacoes: string | null
          owner_id: string
          porte: string | null
          razao_social: string
          responsavel_financeiro: string | null
          responsavel_operacional: string | null
          responsavel_tecnico: string | null
          status: string
          telefone: string | null
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnae?: string | null
          cnpj: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          latitude?: number | null
          longitude?: number | null
          nome_fantasia?: string | null
          numero?: string | null
          observacoes?: string | null
          owner_id: string
          porte?: string | null
          razao_social: string
          responsavel_financeiro?: string | null
          responsavel_operacional?: string | null
          responsavel_tecnico?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnae?: string | null
          cnpj?: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          latitude?: number | null
          longitude?: number | null
          nome_fantasia?: string | null
          numero?: string | null
          observacoes?: string | null
          owner_id?: string
          porte?: string | null
          razao_social?: string
          responsavel_financeiro?: string | null
          responsavel_operacional?: string | null
          responsavel_tecnico?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      coletas: {
        Row: {
          cliente_id: string
          created_at: string
          data_agendada: string
          grupo_residuo: string | null
          horario: string | null
          id: string
          motorista: string | null
          observacoes: string | null
          owner_id: string
          peso_real: number | null
          quantidade_prevista: number | null
          status: string
          tipo_residuo: string
          unidade: string | null
          updated_at: string
          veiculo: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_agendada: string
          grupo_residuo?: string | null
          horario?: string | null
          id?: string
          motorista?: string | null
          observacoes?: string | null
          owner_id: string
          peso_real?: number | null
          quantidade_prevista?: number | null
          status?: string
          tipo_residuo: string
          unidade?: string | null
          updated_at?: string
          veiculo?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_agendada?: string
          grupo_residuo?: string | null
          horario?: string | null
          id?: string
          motorista?: string | null
          observacoes?: string | null
          owner_id?: string
          peso_real?: number | null
          quantidade_prevista?: number | null
          status?: string
          tipo_residuo?: string
          unidade?: string | null
          updated_at?: string
          veiculo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coletas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      contrato_itens: {
        Row: {
          contrato_id: string
          created_at: string
          descricao: string
          franquia: number | null
          grupo_residuo: string | null
          id: string
          preco_excedente: number | null
          preco_unitario: number
          unidade: string | null
        }
        Insert: {
          contrato_id: string
          created_at?: string
          descricao: string
          franquia?: number | null
          grupo_residuo?: string | null
          id?: string
          preco_excedente?: number | null
          preco_unitario?: number
          unidade?: string | null
        }
        Update: {
          contrato_id?: string
          created_at?: string
          descricao?: string
          franquia?: number | null
          grupo_residuo?: string | null
          id?: string
          preco_excedente?: number | null
          preco_unitario?: number
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contrato_itens_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          cliente_id: string
          created_at: string
          data_fim: string | null
          data_inicio: string
          dia_vencimento: number | null
          forma_pagamento: string | null
          id: string
          indice_reajuste: string | null
          numero: string
          objeto: string | null
          observacoes: string | null
          owner_id: string
          periodicidade_reajuste: string | null
          status: string
          updated_at: string
          valor_mensal: number | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          dia_vencimento?: number | null
          forma_pagamento?: string | null
          id?: string
          indice_reajuste?: string | null
          numero: string
          objeto?: string | null
          observacoes?: string | null
          owner_id: string
          periodicidade_reajuste?: string | null
          status?: string
          updated_at?: string
          valor_mensal?: number | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          dia_vencimento?: number | null
          forma_pagamento?: string | null
          id?: string
          indice_reajuste?: string | null
          numero?: string
          objeto?: string | null
          observacoes?: string | null
          owner_id?: string
          periodicidade_reajuste?: string | null
          status?: string
          updated_at?: string
          valor_mensal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas: {
        Row: {
          cliente_id: string
          competencia: string
          contrato_id: string | null
          created_at: string
          data_emissao: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string | null
          forma_pagamento: string | null
          id: string
          numero: string
          observacoes: string | null
          owner_id: string
          status: string
          updated_at: string
          valor: number
          valor_pago: number | null
        }
        Insert: {
          cliente_id: string
          competencia: string
          contrato_id?: string | null
          created_at?: string
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          owner_id: string
          status?: string
          updated_at?: string
          valor?: number
          valor_pago?: number | null
        }
        Update: {
          cliente_id?: string
          competencia?: string
          contrato_id?: string | null
          created_at?: string
          data_emissao?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          owner_id?: string
          status?: string
          updated_at?: string
          valor?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      licencas: {
        Row: {
          arquivo_url: string | null
          cliente_id: string | null
          condicionantes: string | null
          created_at: string
          data_emissao: string
          data_validade: string
          escopo: string | null
          id: string
          numero: string
          observacoes: string | null
          orgao_emissor: string
          owner_id: string
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          cliente_id?: string | null
          condicionantes?: string | null
          created_at?: string
          data_emissao: string
          data_validade: string
          escopo?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          orgao_emissor: string
          owner_id: string
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          cliente_id?: string | null
          condicionantes?: string | null
          created_at?: string
          data_emissao?: string
          data_validade?: string
          escopo?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          orgao_emissor?: string
          owner_id?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licencas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      mtrs: {
        Row: {
          acondicionamento: string | null
          classe_ibama: string | null
          cliente_id: string
          codigo_residuo: string | null
          coleta_id: string | null
          created_at: string
          data_emissao: string
          descricao_residuo: string
          destinador: string | null
          gerador: string | null
          id: string
          numero: string
          observacoes: string | null
          owner_id: string
          quantidade: number
          status: string
          tecnologia_destinacao: string | null
          transportador: string | null
          unidade: string
          updated_at: string
          url_documento: string | null
        }
        Insert: {
          acondicionamento?: string | null
          classe_ibama?: string | null
          cliente_id: string
          codigo_residuo?: string | null
          coleta_id?: string | null
          created_at?: string
          data_emissao?: string
          descricao_residuo: string
          destinador?: string | null
          gerador?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          owner_id: string
          quantidade?: number
          status?: string
          tecnologia_destinacao?: string | null
          transportador?: string | null
          unidade?: string
          updated_at?: string
          url_documento?: string | null
        }
        Update: {
          acondicionamento?: string | null
          classe_ibama?: string | null
          cliente_id?: string
          codigo_residuo?: string | null
          coleta_id?: string | null
          created_at?: string
          data_emissao?: string
          descricao_residuo?: string
          destinador?: string | null
          gerador?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          owner_id?: string
          quantidade?: number
          status?: string
          tecnologia_destinacao?: string | null
          transportador?: string | null
          unidade?: string
          updated_at?: string
          url_documento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mtrs_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mtrs_coleta_id_fkey"
            columns: ["coleta_id"]
            isOneToOne: false
            referencedRelation: "coletas"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          mensagem: string | null
          owner_id: string
          prioridade: string
          ref_id: string | null
          ref_tabela: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          owner_id: string
          prioridade?: string
          ref_id?: string | null
          ref_tabela?: string | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          owner_id?: string
          prioridade?: string
          ref_id?: string | null
          ref_tabela?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_cliente_id: { Args: never; Returns: string }
      gerar_notificacoes_vencimento: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "diretor"
        | "financeiro"
        | "comercial"
        | "operacional"
        | "motorista"
        | "cliente"
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
      app_role: [
        "admin",
        "diretor",
        "financeiro",
        "comercial",
        "operacional",
        "motorista",
        "cliente",
      ],
    },
  },
} as const
