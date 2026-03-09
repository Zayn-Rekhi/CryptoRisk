import LoginPageNoGoogle from './LoginPageNoGoogle'
import LoginPageWithGoogle from './LoginPageWithGoogle'

function LoginPage() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  const hasGoogleClientId = Boolean(clientId && clientId.trim().length > 0)

  return hasGoogleClientId ? <LoginPageWithGoogle /> : <LoginPageNoGoogle />
}

export default LoginPage
