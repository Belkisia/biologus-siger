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
      cliente_documento_versoes: {
        Row: {
          acao: string
          created_at: string
          documento_id: string
          id: string
          mime_type: string | null
          nome_arquivo: string | null
          nota: string | null
          owner_id: string
          storage_path: string
          tamanho_bytes: number | null
          uploaded_by: string | null
          versao: number
        }
        Insert: {
          acao?: string
          created_at?: string
          documento_id: string
          id?: string
          mime_type?: string | null
          nome_arquivo?: string | null
          nota?: string | null
          owner_id: string
          storage_path: string
          tamanho_bytes?: number | null
          uploaded_by?: string | null
          versao: number
        }
        Update: {
          acao?: string
          created_at?: string
          documento_id?: string
          id?: string
          mime_type?: string | null
          nome_arquivo?: string | null
          nota?: string | null
          owner_id?: string
          storage_path?: string
          tamanho_bytes?: number | null
          uploaded_by?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "cliente_documento_versoes_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "cliente_documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_documentos: {
        Row: {
          categoria: string
          cliente_id: string
          created_at: string
          descricao: string | null
          id: string
          mime_type: string | null
          nome: string
          owner_id: string
          storage_path: string
          tamanho_bytes: number | null
          updated_at: string
          versao_atual: number
        }
        Insert: {
          categoria?: string
          cliente_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          mime_type?: string | null
          nome: string
          owner_id: string
          storage_path: string
          tamanho_bytes?: number | null
          updated_at?: string
          versao_atual?: number
        }
        Update: {
          categoria?: string
          cliente_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          mime_type?: string | null
          nome?: string
          owner_id?: string
          storage_path?: string
          tamanho_bytes?: number | null
          updated_at?: string
          versao_atual?: number
        }
        Relationships: [
          {
            foreignKeyName: "cliente_documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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
      contas_bancarias: {
        Row: {
          agencia: string | null
          ativa: boolean
          banco: string | null
          created_at: string
          id: string
          nome: string
          numero_conta: string | null
          owner_id: string
          saldo_inicial: number
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          ativa?: boolean
          banco?: string | null
          created_at?: string
          id?: string
          nome: string
          numero_conta?: string | null
          owner_id: string
          saldo_inicial?: number
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          ativa?: boolean
          banco?: string | null
          created_at?: string
          id?: string
          nome?: string
          numero_conta?: string | null
          owner_id?: string
          saldo_inicial?: number
          updated_at?: string
        }
        Relationships: []
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
      contrato_modelo_versoes: {
        Row: {
          alterado_por: string | null
          conteudo_html: string
          created_at: string
          id: string
          modelo_id: string
          motivo: string | null
          versao: number
        }
        Insert: {
          alterado_por?: string | null
          conteudo_html: string
          created_at?: string
          id?: string
          modelo_id: string
          motivo?: string | null
          versao: number
        }
        Update: {
          alterado_por?: string | null
          conteudo_html?: string
          created_at?: string
          id?: string
          modelo_id?: string
          motivo?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "contrato_modelo_versoes_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "contrato_modelos"
            referencedColumns: ["id"]
          },
        ]
      }
      contrato_modelos: {
        Row: {
          ativo: boolean
          conteudo_html: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          owner_id: string | null
          updated_at: string
          versao_atual: number
        }
        Insert: {
          ativo?: boolean
          conteudo_html?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          owner_id?: string | null
          updated_at?: string
          versao_atual?: number
        }
        Update: {
          ativo?: boolean
          conteudo_html?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          owner_id?: string | null
          updated_at?: string
          versao_atual?: number
        }
        Relationships: []
      }
      contratos: {
        Row: {
          cliente_id: string
          conteudo_html: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          dia_vencimento: number | null
          forma_pagamento: string | null
          id: string
          indice_reajuste: string | null
          modelo_id: string | null
          numero: string
          objeto: string | null
          observacoes: string | null
          owner_id: string
          periodicidade_reajuste: string | null
          status: string
          ultimo_email_destino: string | null
          ultimo_email_em: string | null
          ultimo_email_erro: string | null
          ultimo_email_status: string | null
          updated_at: string
          valor_mensal: number | null
        }
        Insert: {
          cliente_id: string
          conteudo_html?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          dia_vencimento?: number | null
          forma_pagamento?: string | null
          id?: string
          indice_reajuste?: string | null
          modelo_id?: string | null
          numero: string
          objeto?: string | null
          observacoes?: string | null
          owner_id: string
          periodicidade_reajuste?: string | null
          status?: string
          ultimo_email_destino?: string | null
          ultimo_email_em?: string | null
          ultimo_email_erro?: string | null
          ultimo_email_status?: string | null
          updated_at?: string
          valor_mensal?: number | null
        }
        Update: {
          cliente_id?: string
          conteudo_html?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          dia_vencimento?: number | null
          forma_pagamento?: string | null
          id?: string
          indice_reajuste?: string | null
          modelo_id?: string | null
          numero?: string
          objeto?: string | null
          observacoes?: string | null
          owner_id?: string
          periodicidade_reajuste?: string | null
          status?: string
          ultimo_email_destino?: string | null
          ultimo_email_em?: string | null
          ultimo_email_erro?: string | null
          ultimo_email_status?: string | null
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
          {
            foreignKeyName: "contratos_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "contrato_modelos"
            referencedColumns: ["id"]
          },
        ]
      }
      documento_assinaturas: {
        Row: {
          assinado_em: string
          codigo_verificacao: string
          created_at: string
          documento_id: string
          documento_tipo: Database["public"]["Enums"]["documento_tipo"]
          geo: Json | null
          hash_documento: string
          id: string
          ip: string | null
          pdf_assinado_path: string | null
          rubrica_base64: string | null
          signatario_id: string
          user_agent: string | null
        }
        Insert: {
          assinado_em?: string
          codigo_verificacao: string
          created_at?: string
          documento_id: string
          documento_tipo: Database["public"]["Enums"]["documento_tipo"]
          geo?: Json | null
          hash_documento: string
          id?: string
          ip?: string | null
          pdf_assinado_path?: string | null
          rubrica_base64?: string | null
          signatario_id: string
          user_agent?: string | null
        }
        Update: {
          assinado_em?: string
          codigo_verificacao?: string
          created_at?: string
          documento_id?: string
          documento_tipo?: Database["public"]["Enums"]["documento_tipo"]
          geo?: Json | null
          hash_documento?: string
          id?: string
          ip?: string | null
          pdf_assinado_path?: string | null
          rubrica_base64?: string | null
          signatario_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documento_assinaturas_signatario_id_fkey"
            columns: ["signatario_id"]
            isOneToOne: true
            referencedRelation: "signatarios"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      extrato_lancamentos: {
        Row: {
          conciliado_em: string | null
          conta_id: string
          created_at: string
          data_lancamento: string
          descricao: string | null
          fatura_id: string | null
          fit_id: string | null
          id: string
          memo: string | null
          owner_id: string
          status: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          conciliado_em?: string | null
          conta_id: string
          created_at?: string
          data_lancamento: string
          descricao?: string | null
          fatura_id?: string | null
          fit_id?: string | null
          id?: string
          memo?: string | null
          owner_id: string
          status?: string
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          conciliado_em?: string | null
          conta_id?: string
          created_at?: string
          data_lancamento?: string
          descricao?: string | null
          fatura_id?: string | null
          fit_id?: string | null
          id?: string
          memo?: string | null
          owner_id?: string
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "extrato_lancamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extrato_lancamentos_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "faturas"
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
      proposta_itens: {
        Row: {
          created_at: string
          descricao: string
          id: string
          ordem: number
          proposta_id: string
          quantidade: number
          tipo_residuo: string | null
          unidade: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          ordem?: number
          proposta_id: string
          quantidade?: number
          tipo_residuo?: string | null
          unidade?: string
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          ordem?: number
          proposta_id?: string
          quantidade?: number
          tipo_residuo?: string | null
          unidade?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          cliente_id: string
          condicoes_pagamento: string | null
          contrato_id: string | null
          created_at: string
          data_emissao: string
          enviada_em: string | null
          id: string
          numero: string
          observacoes: string | null
          owner_id: string
          prazo_coleta: string | null
          respondida_em: string | null
          status: string
          updated_at: string
          validade: string | null
          valor_total: number
        }
        Insert: {
          cliente_id: string
          condicoes_pagamento?: string | null
          contrato_id?: string | null
          created_at?: string
          data_emissao?: string
          enviada_em?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          owner_id: string
          prazo_coleta?: string | null
          respondida_em?: string | null
          status?: string
          updated_at?: string
          validade?: string | null
          valor_total?: number
        }
        Update: {
          cliente_id?: string
          condicoes_pagamento?: string | null
          contrato_id?: string | null
          created_at?: string
          data_emissao?: string
          enviada_em?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          owner_id?: string
          prazo_coleta?: string | null
          respondida_em?: string | null
          status?: string
          updated_at?: string
          validade?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      signatario_eventos: {
        Row: {
          created_at: string
          evento: string
          id: string
          ip: string | null
          metadata: Json | null
          signatario_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          evento: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          signatario_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          evento?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          signatario_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatario_eventos_signatario_id_fkey"
            columns: ["signatario_id"]
            isOneToOne: false
            referencedRelation: "signatarios"
            referencedColumns: ["id"]
          },
        ]
      }
      signatario_otps: {
        Row: {
          codigo_hash: string
          created_at: string
          expira_em: string
          id: string
          signatario_id: string
          tentativas: number
          usado_em: string | null
        }
        Insert: {
          codigo_hash: string
          created_at?: string
          expira_em?: string
          id?: string
          signatario_id: string
          tentativas?: number
          usado_em?: string | null
        }
        Update: {
          codigo_hash?: string
          created_at?: string
          expira_em?: string
          id?: string
          signatario_id?: string
          tentativas?: number
          usado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatario_otps_signatario_id_fkey"
            columns: ["signatario_id"]
            isOneToOne: false
            referencedRelation: "signatarios"
            referencedColumns: ["id"]
          },
        ]
      }
      signatarios: {
        Row: {
          assinado_em: string | null
          cpf_cnpj: string | null
          created_at: string
          documento_id: string
          documento_tipo: Database["public"]["Enums"]["documento_tipo"]
          email: string
          email_enviado_em: string | null
          expira_em: string
          id: string
          nome: string
          ordem: number
          owner_id: string
          papel: Database["public"]["Enums"]["signatario_papel"]
          status: Database["public"]["Enums"]["signatario_status"]
          token: string
          updated_at: string
        }
        Insert: {
          assinado_em?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          documento_id: string
          documento_tipo: Database["public"]["Enums"]["documento_tipo"]
          email: string
          email_enviado_em?: string | null
          expira_em?: string
          id?: string
          nome: string
          ordem?: number
          owner_id: string
          papel?: Database["public"]["Enums"]["signatario_papel"]
          status?: Database["public"]["Enums"]["signatario_status"]
          token?: string
          updated_at?: string
        }
        Update: {
          assinado_em?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          documento_id?: string
          documento_tipo?: Database["public"]["Enums"]["documento_tipo"]
          email?: string
          email_enviado_em?: string | null
          expira_em?: string
          id?: string
          nome?: string
          ordem?: number
          owner_id?: string
          papel?: Database["public"]["Enums"]["signatario_papel"]
          status?: Database["public"]["Enums"]["signatario_status"]
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      gerar_notificacoes_vencimento: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
      documento_tipo: "contrato" | "proposta"
      signatario_papel: "contratante" | "contratada" | "testemunha"
      signatario_status:
        | "pendente"
        | "otp_enviado"
        | "assinado"
        | "recusado"
        | "expirado"
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
      documento_tipo: ["contrato", "proposta"],
      signatario_papel: ["contratante", "contratada", "testemunha"],
      signatario_status: [
        "pendente",
        "otp_enviado",
        "assinado",
        "recusado",
        "expirado",
      ],
    },
  },
} as const
