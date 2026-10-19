import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { DotsUser } from '../types/dots'

interface AuthContextType {
  user: User | null
  dotsUser: DotsUser | null
  isLoading: boolean
  error: string | null
  signInWithEmail: (email: string, password: string) => Promise<boolean>
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<boolean>
  signInWithOtp: (email: string) => Promise<{ success: boolean; message: string }>
  claimTelegramAccount: (code: string) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  refreshDotsUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [dotsUser, setDotsUser] = useState<DotsUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch linked dots_users profile
  const fetchDotsUser = async (authUser: User | null) => {
    if (!authUser) {
      setDotsUser(null)
      return
    }

    try {
      const { data, error: qErr } = await supabase
        .from('dots_users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .maybeSingle()

      if (qErr) {
        console.error('[Dots Auth] Error fetching profile:', qErr)
      }

      setDotsUser(data || null)
    } catch (err: any) {
      console.error('[Dots Auth] Query failed:', err)
    }
  }

  useEffect(() => {
    // 1. Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      fetchDotsUser(currentUser).finally(() => setIsLoading(false))
    })

    // 2. Listen to auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      await fetchDotsUser(currentUser)
      setIsLoading(false)
    })

    // 3. Multi-tab synchronization
    const handleStorage = (event: StorageEvent) => {
      if (event.key && (event.key.includes('auth-token') || event.key.includes('supabase'))) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          const currentUser = session?.user || null
          setUser(currentUser)
          fetchDotsUser(currentUser)
        })
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const signInWithEmail = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    const { data, error: sErr } = await supabase.auth.signInWithPassword({ email, password })

    if (sErr) {
      setError(sErr.message)
      setIsLoading(false)
      return false
    }

    setUser(data.user)
    await fetchDotsUser(data.user)
    setIsLoading(false)
    return true
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    const { data, error: sErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || 'Dots User'
        }
      }
    })

    if (sErr) {
      setError(sErr.message)
      setIsLoading(false)
      return false
    }

    setUser(data.user)
    if (data.user) {
      // Create initial dots_users row if not created by trigger
      await supabase.from('dots_users').upsert({
        auth_user_id: data.user.id,
        display_name: displayName || 'Dots User',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      })
      await fetchDotsUser(data.user)
    }

    setIsLoading(false)
    return true
  }

  const signInWithOtp = async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    setError(null)
    const { error: sErr } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/#app`
      }
    })

    if (sErr) {
      setError(sErr.message)
      setIsLoading(false)
      return { success: false, message: sErr.message }
    }

    setIsLoading(false)
    return { success: true, message: 'Magic link sent! Check your inbox or spam folder.' }
  }

  const claimTelegramAccount = async (
    code: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'You must be signed in to link a Telegram account.' }
    }

    try {
      const { data, error: rpcErr } = await supabase.rpc('dots_claim_telegram_account', {
        p_code: code.trim()
      })

      if (rpcErr) {
        return { success: false, message: rpcErr.message }
      }

      if (data?.success) {
        await supabase
          .from('dots_users')
          .update({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' })
          .eq('auth_user_id', user.id)
        await fetchDotsUser(user)
        return { success: true, message: data.message || 'Account linked successfully!' }
      }

      return { success: false, message: data?.message || 'Failed to claim account.' }
    } catch (err: any) {
      return { success: false, message: err.message || 'An unexpected error occurred.' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setDotsUser(null)
  }

  const refreshDotsUser = async () => {
    await fetchDotsUser(user)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        dotsUser,
        isLoading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithOtp,
        claimTelegramAccount,
        signOut,
        refreshDotsUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
