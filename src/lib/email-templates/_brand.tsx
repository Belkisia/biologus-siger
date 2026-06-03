import * as React from 'react'
import { Container, Hr, Img, Section, Text } from '@react-email/components'
import logoAsset from '@/assets/biologus-logo.jpeg.asset.json'

const PROJECT_URL = 'https://project--51cdb10c-bbd1-4ce2-b964-56c2bdda6891.lovable.app'
export const LOGO_URL = `${PROJECT_URL}${logoAsset.url}`

export const BRAND = {
  name: 'Biólogus Ambiental',
  primary: '#064e3b',
  primaryGlow: '#10b981',
  text: '#1f2937',
  muted: '#6b7280',
  border: '#e5e7eb',
  bg: '#ffffff',
  surface: '#f5f7f6',
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  margin: 0,
  padding: '24px 0',
}

export const container = {
  maxWidth: '560px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: `1px solid ${BRAND.border}`,
  borderRadius: '12px',
  overflow: 'hidden',
}

export const headerStyle = {
  background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryGlow} 100%)`,
  padding: '24px 28px',
}

export const brandText = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: 700 as const,
  margin: 0,
  letterSpacing: '-0.01em',
}

export const brandTagline = {
  color: 'rgba(255,255,255,0.85)',
  fontSize: '12px',
  margin: '4px 0 0',
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
}

export const body = { padding: '28px' }

export const h1 = {
  fontSize: '22px',
  fontWeight: 700 as const,
  color: BRAND.primary,
  margin: '0 0 16px',
}

export const text = {
  fontSize: '15px',
  color: BRAND.text,
  lineHeight: '1.6',
  margin: '0 0 20px',
}

export const link = { color: BRAND.primary, textDecoration: 'underline' }

export const button = {
  backgroundColor: BRAND.primary,
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '8px',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
}

export const codeStyle = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '28px',
  fontWeight: 700 as const,
  color: BRAND.primary,
  background: BRAND.surface,
  border: `1px solid ${BRAND.border}`,
  borderRadius: '8px',
  padding: '14px 20px',
  letterSpacing: '0.3em',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

export const footerText = {
  fontSize: '12px',
  color: BRAND.muted,
  lineHeight: '1.5',
  margin: '24px 0 0',
}

export const Header = () => (
  <Section style={headerStyle}>
    <Img
      src={LOGO_URL}
      alt={BRAND.name}
      width="64"
      height="64"
      style={{ display: 'block', borderRadius: '12px', marginBottom: '12px', background: '#ffffff', padding: '6px' }}
    />
    <Text style={brandText}>{BRAND.name}</Text>
    <Text style={brandTagline}>Gerenciamento de Resíduos</Text>
  </Section>
)

export const Footer = () => (
  <>
    <Hr style={{ borderColor: BRAND.border, margin: '28px 0 16px' }} />
    <Container style={{ padding: '0 28px 24px' }}>
      <Text style={{ fontSize: '11px', color: BRAND.muted, margin: 0, textAlign: 'center' as const }}>
        © {new Date().getFullYear()} {BRAND.name} · Consultoria & Gestão Ambiental
      </Text>
    </Container>
  </>
)
