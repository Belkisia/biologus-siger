import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components'
import { BRAND, Footer, Header, body as bodyStyle, button, container, h1, link, main, text } from './_brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você foi convidado para a {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Section style={bodyStyle}>
          <Heading style={h1}>Você foi convidado</Heading>
          <Text style={text}>
            Você recebeu um convite para participar da{' '}
            <Link href={siteUrl} style={link}><strong>{siteName}</strong></Link>.
            Clique no botão abaixo para aceitar o convite e criar sua conta.
          </Text>
          <Button style={button} href={confirmationUrl}>Aceitar convite</Button>
          <Text style={{ ...text, fontSize: '13px', color: BRAND.muted, margin: '24px 0 0' }}>
            Se você não estava esperando este convite, pode ignorar este e-mail com segurança.
          </Text>
        </Section>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
