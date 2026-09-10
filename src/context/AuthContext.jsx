import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api.js'
import { requestNotificationPermission } from '../lib/firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [username, setUsername] = useState(() => localStorage.getItem('username'))
  const [money, setMoney] = useState(null)
  const [ready, setReady] = useState(false)

  const refreshMoney = useCallback(async () => {
    if (!token) return
    try {
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

  async function login(newToken, newUsername) {
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', newUsername)
    setToken(newToken)
    setUsername(newUsername)

    const deviceToken = await requestNotificationPermission()
    if (deviceToken) {
      await api.saveDeviceToken(deviceToken, newToken)
    }
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