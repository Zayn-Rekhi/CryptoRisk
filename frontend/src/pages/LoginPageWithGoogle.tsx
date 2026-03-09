import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { GoogleLogin } from '@react-oauth/google'
import { LOGIN, LOGIN_GOOGLE } from '../lib/graphql'
import { useAuth } from '../contexts/AuthContext'
import { AppShell } from '../components/AppShell'
import { Card, Container, Divider, Input, Label } from '../components/ui'

function LoginPageWithGoogle() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setToken, setUsername: setAuthUsername } = useAuth()

  const [login] = useMutation(LOGIN)
  const [loginGoogle] = useMutation(LOGIN_GOOGLE)

  // Regular username/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data } = await login({
        variables: {
          input: { username, password },
        },
      })

      if (data?.login) {
        setToken(data.login)
        setAuthUsername(username)
        navigate('/profile')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  // Google login
  const handleGoogleLoginSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential
    if (!idToken) {
      setError('Google did not return an ID token. Please try again.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data } = await loginGoogle({
        variables: { input: { token: idToken } },
      })

      if (data?.loginGoogle) {
        setToken(data.loginGoogle)
        setAuthUsername(null)
        navigate('/profile')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLoginError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.')
    setIsLoading(false)
  }

  return (
    <AppShell>
      <div className="bg-gray-50">
        <Container>
          <div className="py-10 md:py-16 grid md:grid-cols-2 gap-8 items-start">
            <div className="hidden md:block pt-6">
              <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
                Sign in to CryptoRisk
              </h1>
              <p className="mt-3 text-gray-600 leading-relaxed max-w-md">
                A Coinbase‑style, clean dashboard for risk metrics over your
                wallet profiles.
              </p>
              <div className="mt-8 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-600" />
                  Add profiles across networks
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-600" />
                  Compute drawdowns & volatility
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-600" />
                  Review token‑level results
                </div>
              </div>
            </div>

            <Card className="p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome back
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Choose a sign-in method
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
              />

              <Divider label="OR" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="mt-2">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="mt-2">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </button>

                <p className="pt-2 text-xs text-gray-500">
                  By continuing, you agree to our Terms. (Placeholder text—add
                  your own.)
                </p>
              </form>
            </Card>
          </div>
        </Container>
      </div>
    </AppShell>
  )
}

export default LoginPageWithGoogle
