import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  clienteNome?: string
  numero?: string
  valorTotal?: string
  validade?: string
  pdfUrl?: string
  mensagemPersonalizada?: string
}

const Email = ({
  clienteNome = 'Cliente',
  numero = 'PROP-0000',
  valorTotal = 'R$ 0,00',
  validade,
  pdfUrl = '#',
  mensagemPersonalizada,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Proposta Comercial {numero} - Biologus Ambiental</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>BIOLOGUS AMBIENTAL</Heading>
          <Text style={tagline}>Gestão de Resíduos</Text>
        </Section>

        <Hr style={hr} />

        <Heading style={h1}>Proposta Comercial Nº {numero}</Heading>

        <Text style={text}>Olá, {clienteNome},</Text>

        {mensagemPersonalizada ? (
          <Text style={text}>{mensagemPersonalizada}</Text>
        ) : (
          <Text style={text}>
            Conforme conversado, segue em anexo nossa proposta comercial para serviços de
            gestão de resíduos. Ficamos à disposição para esclarecer qualquer dúvida.
          </Text>
        )}

        <Section style={infoBox}>
          <Text style={infoLabel}>Valor total da proposta</Text>
          <Text style={infoValue}>{valorTotal}</Text>
          {validade && (
            <>
              <Text style={infoLabel}>Validade</Text>
              <Text style={infoValueSmall}>{validade}</Text>
            </>
          )}
        </Section>

        <Section style={btnWrap}>
          <Button href={pdfUrl} style={button}>
            Baixar proposta em PDF
          </Button>
        </Section>

        <Text style={textSmall}>
          Se o botão não funcionar, copie e cole este endereço no navegador:
          <br />
          <span style={link}>{pdfUrl}</span>
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          Biologus Ambiental
          <br />
          comercial@biologusambiental.com.br
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) =>
    `Proposta Comercial ${(data.numero as string) ?? ''} - Biologus Ambiental`,
  displayName: 'Proposta Comercial',
  previewData: {
    clienteNome: 'Cliente Exemplo',
    numero: 'PROP-2026-0001',
    valorTotal: 'R$ 4.500,00',
    validade: '30/06/2026',
    pdfUrl: 'https://example.com/proposta.pdf',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' }
const header = { textAlign: 'center' as const, paddingBottom: '8px' }
const brand = { color: '#28643c', fontSize: '22px', margin: '0', letterSpacing: '1px' }
const tagline = { color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const h1 = { color: '#111827', fontSize: '20px', fontWeight: 'bold' as const, margin: '0 0 16px 0' }
const text = { color: '#374151', fontSize: '15px', lineHeight: '1.6', margin: '0 0 14px 0' }
const textSmall = { color: '#6b7280', fontSize: '12px', lineHeight: '1.5', margin: '12px 0' }
const infoBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #28643c',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '20px 0',
}
const infoLabel = { color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' as const, margin: '4px 0 2px 0' }
const infoValue = { color: '#28643c', fontSize: '24px', fontWeight: 'bold' as const, margin: '0' }
const infoValueSmall = { color: '#111827', fontSize: '14px', margin: '0' }
const btnWrap = { textAlign: 'center' as const, margin: '24px 0' }
const button = {
  backgroundColor: '#28643c',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  display: 'inline-block',
}
const link = { color: '#28643c', wordBreak: 'break-all' as const }
const footer = { color: '#9ca3af', fontSize: '12px', textAlign: 'center' as const, margin: '0' }
