import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import { BRAND, Footer, Header, body as bodyStyle, button, container, h1, main, text } from './_brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefina sua senha na {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Section style={bodyStyle}>
          <Heading style={h1}>Redefinir sua senha</Heading>
          <Text style={text}>
            Recebemos um pedido para redefinir sua senha na {siteName}. Clique no botão abaixo para escolher uma nova senha.
          </Text>
          <Button style={button} href={confirmationUrl}>Redefinir senha</Button>
          <Text style={{ ...text, fontSize: '13px', color: BRAND.muted, margin: '24px 0 0' }}>
            Se você não solicitou a redefinição, ignore este e-mail. Sua senha não será alterada.
          </Text>
        </Section>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
