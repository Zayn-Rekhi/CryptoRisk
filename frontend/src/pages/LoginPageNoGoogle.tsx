import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../lib/graphql'
import { useAuth } from '../contexts/AuthContext'
import { AppShell } from '../components/AppShell'
import { Card, Container, Input, Label } from '../components/ui'

function LoginPageNoGoogle() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setToken, setUsername: setAuthUsername } = useAuth()

  const [login] = useMutation(LOGIN)

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
                Google sign-in is currently disabled (missing env var). You can
                still sign in with username/password.
              </p>
            </div>

            <Card className="p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome back
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Sign in with username/password
                </p>
              </div>

              <div className="mb-4 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-gray-700">
                Google login is disabled because{' '}
                <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> is not
                set. Add it to <code className="font-mono">frontend/.env</code>{' '}
                to enable Google OAuth.
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

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
              </form>
            </Card>
          </div>
        </Container>
      </div>
    </AppShell>
  )
}

export default LoginPageNoGoogle

