import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components'
import { BRAND, Footer, Header, body as bodyStyle, button, container, h1, link, main, text } from './_brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteName, siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu e-mail na {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Section style={bodyStyle}>
          <Heading style={h1}>Bem-vindo(a) à {siteName}!</Heading>
          <Text style={text}>
            Obrigado por se cadastrar na{' '}
            <Link href={siteUrl} style={link}><strong>{siteName}</strong></Link>.
          </Text>
          <Text style={text}>
            Por favor, confirme o e-mail{' '}
            <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link>{' '}
            clicando no botão abaixo:
          </Text>
          <Button style={button} href={confirmationUrl}>Confirmar e-mail</Button>
          <Text style={{ ...text, fontSize: '13px', color: BRAND.muted, margin: '24px 0 0' }}>
            Se você não criou esta conta, pode ignorar este e-mail com segurança.
          </Text>
        </Section>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
