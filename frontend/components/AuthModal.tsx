'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const API_BASE = 'http://localhost:8000'

// ── Types ────────────────────────────────────────────────────────────────────
type Mode = 'signin' | 'signup'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Toast {
  type: 'success' | 'error'
  message: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Field-level errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (mode === 'signup' && fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.'
    }
    if (!isValidEmail(email)) {
      newErrors.email = 'Enter a valid email address.'
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }
    if (mode === 'signup' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setToast(null)

    try {
      if (mode === 'signup') {
        const res = await fetch(`${API_BASE}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.detail || 'Signup failed.')
        }

        console.log('[Signup success]', data)
        localStorage.setItem('user_info', JSON.stringify(data))
        setToast({ type: 'success', message: `Account created! Welcome, ${data.full_name || data.email}.` })

        setTimeout(() => {
          resetForm()
          onClose()
          router.push('/dashboard')
        }, 1000)

      } else {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.detail || 'Sign in failed.')
        }

        console.log('[Login success]', data)
        localStorage.setItem('user_info', JSON.stringify(data))
        setToast({ type: 'success', message: 'Signed in successfully!' })
        
        setTimeout(() => {
          resetForm()
          onClose()
          router.push('/dashboard')
        }, 1000)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setToast({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFullName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setErrors({})
    setToast(null)
    setShowPassword(false)
    setShowConfirm(false)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setErrors({})
    setToast(null)
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) { resetForm(); onClose() } }}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Gradient header strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400" />

        <div className="p-8">
          {/* Close button */}
          <button
            onClick={() => { resetForm(); onClose() }}
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900">
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {mode === 'signup'
                ? 'Start tracking prices smarter today.'
                : 'Sign in to your predictKart account.'}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Toast */}
          {toast && (
            <div
              className={`mb-5 flex items-start gap-3 p-3.5 rounded-xl text-sm font-medium border ${
                toast.type === 'success'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {toast.type === 'success'
                ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
              <span>{toast.message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Full Name — signup only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                <div className={`flex items-center gap-2 px-4 py-3 bg-gray-50 border rounded-xl transition-colors ${errors.fullName ? 'border-red-400' : 'border-gray-200 focus-within:border-blue-500'}`}>
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    autoComplete="name"
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <div className={`flex items-center gap-2 px-4 py-3 bg-gray-50 border rounded-xl transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200 focus-within:border-blue-500'}`}>
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className={`flex items-center gap-2 px-4 py-3 bg-gray-50 border rounded-xl transition-colors ${errors.password ? 'border-red-400' : 'border-gray-200 focus-within:border-blue-500'}`}>
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password — signup only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
                <div className={`flex items-center gap-2 px-4 py-3 bg-gray-50 border rounded-xl transition-colors ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus-within:border-blue-500'}`}>
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 h-auto font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'signup' ? 'Creating account…' : 'Signing in…'}</>
                : mode === 'signup' ? 'Create Account' : 'Sign In'
              }
            </Button>
          </form>

          {/* Footer switch */}
          <p className="mt-5 text-center text-xs text-gray-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-blue-600 font-semibold hover:underline"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
