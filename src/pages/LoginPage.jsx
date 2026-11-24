import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { GoogleAuthButton } from '../components/ui/GoogleAuthButton'
import { supabase } from '../lib/supabase'
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export function LoginPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Forgot password sub-view states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')

  // Validation function
  const validateForm = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccessMessage('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      })

      if (error) {
        setServerError(error.message)
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      onNavigate('dashboard')
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred during login.')
      setIsLoading(false)
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setResetError('')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!resetEmail.trim()) {
      setErrors({ resetEmail: 'Email address is required.' })
      return
    } else if (!emailRegex.test(resetEmail.trim())) {
      setErrors({ resetEmail: 'Please enter a valid email address.' })
      return
    }

    setErrors({})
    setResetLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: window.location.origin,
      })

      if (error) {
        setResetError(error.message)
        setResetLoading(false)
        return
      }

      setResetLoading(false)
      setResetSent(true)
    } catch (err) {
      setResetError(err.message || 'Unable to send reset instructions.')
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#101019] text-[#F4F0FF] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#8B5CF6]/30">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Top Bar: Return to Home */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#9490A8] hover:text-[#F4F0FF] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to ArtNova</span>
        </button>

        {/* Small Brand Mark */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] p-[1px]">
            <div className="w-full h-full bg-[#101019] rounded-[5px] flex items-center justify-center">
              <span className="font-['Outfit'] font-bold text-[10px] text-[#F4F0FF]">A</span>
            </div>
          </div>
          <span className="font-['Outfit'] font-bold text-sm tracking-tight text-[#F4F0FF]">
            ART<span className="text-[#A78BFA]">NOVA</span>
          </span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="max-w-md w-full mx-auto">
        <div className="bg-[#171725] border border-[#8B5CF6]/20 rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F0FF] font-['Outfit'] mb-2">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-[#9490A8]">
              Log in to your ArtNova creator account
            </p>
          </div>

          {forgotPasswordOpen ? (
            /* Forgot Password Sub-View */
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white font-['Outfit'] mb-1">
                  Reset Password
                </h3>
                <p className="text-xs text-[#9490A8]">
                  Enter your email address to receive password reset instructions.
                </p>
              </div>

              {resetSent ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#A78BFA] flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[#9490A8] leading-relaxed">
                    Password reset link has been dispatched to <span className="text-white font-medium">{resetEmail}</span>. Please check your inbox.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center mt-2"
                    onClick={() => {
                      setForgotPasswordOpen(false)
                      setResetSent(false)
                      setResetEmail('')
                      setResetError('')
                    }}
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#9490A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled={resetLoading}
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your.email@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#101019] border border-[#8B5CF6]/20 rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none focus:border-[#8B5CF6] text-xs disabled:opacity-50"
                      />
                    </div>
                    {errors.resetEmail && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {errors.resetEmail}
                      </p>
                    )}
                  </div>

                  {resetError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      disabled={resetLoading}
                      onClick={() => {
                        setForgotPasswordOpen(false)
                        setResetError('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={resetLoading}
                      className="flex-1"
                    >
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Google Sign-In Button & Divider */}
              <GoogleAuthButton label="Continue with Google" />

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#8B5CF6]/20" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-[#171725] px-3 text-[#9490A8]">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#9490A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      disabled={isLoading}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        if (errors.email) setErrors({ ...errors, email: null })
                      }}
                      placeholder="your.email@domain.com"
                      className={`w-full pl-10 pr-4 py-2.5 bg-[#101019] border rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none text-xs transition-colors disabled:opacity-50 ${errors.email
                        ? 'border-rose-500/70 focus:border-rose-500'
                        : 'border-[#8B5CF6]/20 focus:border-[#8B5CF6]'
                        }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordOpen(true)
                        setServerError('')
                      }}
                      className="text-xs text-[#9490A8] hover:text-[#A78BFA] transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#9490A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      disabled={isLoading}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value })
                        if (errors.password) setErrors({ ...errors, password: null })
                      }}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-10 py-2.5 bg-[#101019] border rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none text-xs transition-colors disabled:opacity-50 ${errors.password
                        ? 'border-rose-500/70 focus:border-rose-500'
                        : 'border-[#8B5CF6]/20 focus:border-[#8B5CF6]'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9490A8] hover:text-[#F4F0FF] p-1 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    disabled={isLoading}
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData({ ...formData, rememberMe: e.target.checked })
                    }
                    className="w-4 h-4 rounded bg-[#101019] border-[#8B5CF6]/30 text-[#8B5CF6] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#8B5CF6]"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2.5 block text-xs text-[#9490A8] cursor-pointer select-none"
                  >
                    Remember me on this device
                  </label>
                </div>

                {/* Server Error Message Feedback */}
                {serverError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Success Message Feedback */}
                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isLoading}
                    className="w-full justify-center"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Logging in...</span>
                      </span>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </div>

                {/* Link to Sign Up */}
                <div className="text-center pt-2">
                  <p className="text-xs text-[#9490A8]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('signup')}
                      className="text-[#A78BFA] hover:text-white font-semibold transition-colors cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="max-w-md w-full mx-auto text-center mt-6">
        <p className="text-[11px] text-[#9490A8]">
          © {new Date().getFullYear()} ArtNova. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default LoginPage