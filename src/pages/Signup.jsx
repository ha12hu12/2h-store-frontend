import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store } from 'lucide-react'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from '../components/Spinner.jsx'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const auth = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.signup(username, password)
      const { access_token } = await api.login(username, password)
      auth.login(access_token, username)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs rise-in">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-mustard text-[#2B2A25] flex items-center justify-center">
            <Store size={26} />
          </div>
          <h1 className="font-display font-bold text-2xl">حساب جديد</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            autoFocus
            className="w-full rounded-tag border border-stone bg-card px-4 py-3 text-sm focus:border-awning outline-none"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
            className="w-full rounded-tag border border-stone bg-card px-4 py-3 text-sm focus:border-awning outline-none"
          />

          {error && (
            <p className="text-brick text-sm text-center bg-brickfaint rounded-tag py-2 px-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-3 rounded-tag bg-awning text-white font-bold text-sm hover:bg-awningdark active:scale-[0.98] transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner />}
            إنشاء الحساب
          </button>
        </form>

        <p className="text-center text-sm text-inkfaint mt-6">
          عندك حساب؟{' '}
          <Link to="/login" className="text-awning font-bold hover:underline">
            سجل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
