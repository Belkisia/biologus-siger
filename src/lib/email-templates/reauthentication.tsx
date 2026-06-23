import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import { BRAND, Footer, Header, body as bodyStyle, codeStyle, container, h1, main, text } from './_brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Section style={bodyStyle}>
          <Heading style={h1}>Confirme sua identidade</Heading>
          <Text style={text}>Use o código abaixo para confirmar sua identidade:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={{ ...text, fontSize: '13px', color: BRAND.muted, margin: '0' }}>
            Este código expira em breve. Se você não solicitou, ignore este e-mail.
          </Text>
        </Section>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
