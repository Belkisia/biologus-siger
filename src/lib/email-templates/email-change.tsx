import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components'
import { BRAND, Footer, Header, body as bodyStyle, button, container, h1, link, main, text } from './_brand'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ siteName, oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme a alteração de e-mail na {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <Section style={bodyStyle}>
          <Heading style={h1}>Confirme a alteração de e-mail</Heading>
          <Text style={text}>
            Você solicitou alterar o e-mail da sua conta na {siteName} de{' '}
            <Link href={`mailto:${oldEmail}`} style={link}>{oldEmail}</Link>{' '}
            para{' '}
            <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
          </Text>
          <Text style={text}>Clique no botão abaixo para confirmar esta alteração:</Text>
          <Button style={button} href={confirmationUrl}>Confirmar alteração</Button>
          <Text style={{ ...text, fontSize: '13px', color: BRAND.muted, margin: '24px 0 0' }}>
            Se você não fez esta solicitação, proteja sua conta imediatamente alterando sua senha.
          </Text>
        </Section>
        <Footer />
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
