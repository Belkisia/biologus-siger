import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export const Route = createFileRoute('/unsubscribe')({
  component: UnsubscribePage,
})

type State = 'loading' | 'valid' | 'already' | 'invalid' | 'success' | 'error'

function UnsubscribePage() {
  const [state, setState] = useState<State>('loading')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (!t) return setState('invalid')
    setToken(t)
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) setState('valid')
        else if (data.reason === 'already_unsubscribed') setState('already')
        else setState('invalid')
      })
      .catch(() => setState('invalid'))
  }, [])

  const confirm = async () => {
    if (!token) return
    setState('loading')
    try {
      const res = await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (data.success) setState('success')
      else if (data.reason === 'already_unsubscribed') setState('already')
      else setState('error')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Biologus Ambiental</h1>
        {state === 'loading' && <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />}
        {state === 'valid' && (
          <>
            <p className="text-muted-foreground">Deseja deixar de receber e-mails da Biologus Ambiental?</p>
            <Button onClick={confirm} variant="destructive" className="w-full">Confirmar descadastro</Button>
          </>
        )}
        {state === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 mx-auto text-primary" />
            <p>Você foi descadastrado com sucesso. Não enviaremos mais e-mails para este endereço.</p>
          </>
        )}
        {state === 'already' && (
          <>
            <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <p>Este endereço já estava descadastrado.</p>
          </>
        )}
        {(state === 'invalid' || state === 'error') && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <p>Link inválido ou expirado.</p>
          </>
        )}
      </Card>
    </div>
  )
}
