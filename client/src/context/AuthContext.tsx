import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authAPI } from '../services/api'
import type { User } from '../types'

interface AuthCtx {
  user: User | null
  token: string | null
  loading: boolean
  login:  (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string, ref?: string) => Promise<VerifyResult>
  verifyOtp: (email: string, otp: string) => Promise<void>
  logout: () => void
  updateUser: (u: Partial<User>) => void
}

// Registration no longer logs the user in — it returns a verification request.
// `devOtp` is only present when the server has no email configured yet.
export interface VerifyResult { needsVerification: boolean; email: string; devOtp?: string }

const Ctx = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('voya_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed.user)
        setToken(parsed.token)
      } catch {}
    }
    setLoading(false)
  }, [])

  const persist = (u: User, t: string) => {
    localStorage.setItem('voya_user', JSON.stringify({ user: u, token: t }))
    setUser(u); setToken(t)
  }

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password })
    persist(data.user, data.token)
  }

  const register = async (name: string, email: string, password: string, phone?: string, ref?: string): Promise<VerifyResult> => {
    const { data } = await authAPI.register({ name, email, password, phone, ref })
    return { needsVerification: !!data.needsVerification, email: data.email, devOtp: data.devOtp }
  }

  const verifyOtp = async (email: string, otp: string) => {
    const { data } = await authAPI.verifyOtp({ email, otp })
    persist(data.user, data.token)
  }

  const logout = () => {
    localStorage.removeItem('voya_user')
    setUser(null); setToken(null)
  }

  const updateUser = (partial: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...partial }
    setUser(updated)
    const stored = localStorage.getItem('voya_user')
    if (stored) {
      const parsed = JSON.parse(stored)
      localStorage.setItem('voya_user', JSON.stringify({ ...parsed, user: updated }))
    }
  }

  return (
    <Ctx.Provider value={{ user, token, loading, login, register, verifyOtp, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
