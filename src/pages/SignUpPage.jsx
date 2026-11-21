import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export function SignUpPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Validation function
  const validateForm = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
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
      const { error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
          },
        },
      })

      if (error) {
        setServerError(error.message)
        setIsLoading(false)
        return
      }

      setSuccessMessage('Account created! Redirecting to login...')
      setIsLoading(false)

      setTimeout(() => {
        onNavigate('login')
      }, 1500)
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred. Please try again.')
      setIsLoading(false)
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
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F0FF] font-['Outfit'] mb-2">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-[#9490A8]">
              Join ArtNova to connect with fellow creators
            </p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9490A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  disabled={isLoading}
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value })
                    if (errors.fullName) setErrors({ ...errors, fullName: null })
                  }}
                  placeholder="e.g. Alex Morgan"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#101019] border rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none text-xs transition-colors disabled:opacity-50 ${
                    errors.fullName
                      ? 'border-rose-500/70 focus:border-rose-500'
                      : 'border-[#8B5CF6]/20 focus:border-[#8B5CF6]'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.fullName}
                </p>
              )}
            </div>

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
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#101019] border rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none text-xs transition-colors disabled:opacity-50 ${
                    errors.email
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
              <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                Password
              </label>
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
                  placeholder="At least 6 characters"
                  className={`w-full pl-10 pr-10 py-2.5 bg-[#101019] border rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none text-xs transition-colors disabled:opacity-50 ${
                    errors.password
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#A78BFA] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9490A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  disabled={isLoading}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: null })
                  }}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 bg-[#101019] border rounded-xl text-white placeholder-[#9490A8]/50 focus:outline-none text-xs transition-colors disabled:opacity-50 ${
                    errors.confirmPassword
                      ? 'border-rose-500/70 focus:border-rose-500'
                      : 'border-[#8B5CF6]/20 focus:border-[#8B5CF6]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9490A8] hover:text-[#F4F0FF] p-1 transition-colors cursor-pointer"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {errors.confirmPassword}
                </p>
              )}
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
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading || !!successMessage}
                className="w-full justify-center"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>

            {/* Link to Login */}
            <div className="text-center pt-2">
              <p className="text-xs text-[#9490A8]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-[#A78BFA] hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
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

export default SignUpPage
