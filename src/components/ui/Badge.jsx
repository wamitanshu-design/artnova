import React from 'react'

export function Badge({
  children,
  variant = 'purple',
  size = 'md',
  className = '',
  icon: Icon,
}) {
  const baseStyles =
    'inline-flex items-center font-medium rounded-full transition-colors'

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2',
  }

  const variantStyles = {
    purple:
      'bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30',
    lavender:
      'bg-[#A78BFA]/15 text-[#F4F0FF] border border-[#A78BFA]/25',
    glass:
      'bg-white/[0.04] text-[#F4F0FF] border border-white/10 backdrop-blur-md',
    emerald:
      'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    amber:
      'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    rose:
      'bg-rose-500/15 text-rose-300 border border-rose-500/30',
  }

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  )
}
