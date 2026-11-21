import React from 'react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'right',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer'

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5 font-semibold',
  }

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] text-[#F4F0FF] shadow-[0_0_25px_-5px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_-2px_rgba(139,92,246,0.7)] hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'bg-[#171725]/90 hover:bg-[#1e1e32] text-[#F4F0FF] border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 shadow-sm hover:shadow-[0_4px_20px_rgba(139,92,246,0.15)] hover:scale-[1.02] active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-[#8B5CF6]/10 text-[#F4F0FF] border border-[#8B5CF6]/40 hover:border-[#A78BFA] hover:text-white',
    ghost:
      'bg-transparent hover:bg-white/5 text-[#9490A8] hover:text-[#F4F0FF]',
    glow:
      'bg-white text-[#101019] font-semibold hover:bg-[#F4F0FF] shadow-[0_0_30px_rgba(244,240,255,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-[1.02] active:scale-[0.98]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  )
}
