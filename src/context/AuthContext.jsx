import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [username, setUsername] = useState(() => localStorage.getItem('username'))
  const [money, setMoney] = useState(null)
  const [ready, setReady] = useState(false)

  const refreshMoney = useCallback(async () => {
    if (!token) return
    try {
      // requires GET /users/me on the backend — see the note at the
      // end of the delivery message. Fails quietly if not present yet.
      const me = await api.getMe(token)
      setMoney(me.money)
      if (me.username) setUsername(me.username)
    } catch {
      setMoney(null)
    }
  }, [token])

  useEffect(() => {
    refreshMoney().finally(() => setReady(true))
  }, [refreshMoney])

  function login(newToken, newUsername) {
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', newUsername)
    setToken(newToken)
    setUsername(newUsername)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername(null)
    setMoney(null)
  }

  function renameLocally(newUsername) {
    localStorage.setItem('username', newUsername)
    setUsername(newUsername)
  }

  return (
    <AuthContext.Provider
      value={{ token, username, money, ready, login, logout, refreshMoney, renameLocally, setMoney }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
