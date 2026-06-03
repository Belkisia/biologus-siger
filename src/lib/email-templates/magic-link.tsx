import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import { BRAND, Footer, Header, body as bodyStyle, button, container, h1, main, text } from './_brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu link de acesso à {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Section style={bodyStyle}>
          <Heading style={h1}>Seu link de acesso</Heading>
          <Text style={text}>
            Clique no botão abaixo para acessar a {siteName}. Este link expirará em breve.
          </Text>
          <Button style={button} href={confirmationUrl}>Entrar</Button>
          <Text style={{ ...text, fontSize: '13px', color: BRAND.muted, margin: '24px 0 0' }}>
            Se você não solicitou este link, pode ignorar este e-mail com segurança.
          </Text>
        </Section>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
