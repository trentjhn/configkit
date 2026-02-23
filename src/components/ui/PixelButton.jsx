import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

/**
 * PixelButton — the primary interactive primitive.
 *
 * Props:
 *   variant  'primary' | 'secondary' | 'danger' | 'ghost'   default: 'primary'
 *   size     'sm' | 'md' | 'lg'                             default: 'md'
 *   loading  bool — shows spinning icon, disables interaction
 *   disabled bool
 *   icon     ReactNode — Lucide icon rendered left of label
 *   iconRight ReactNode — Lucide icon rendered right of label
 *   full     bool — width: 100%
 *   onClick  fn
 *   children ReactNode
 */

const VARIANTS = {
  primary: {
    base:  'border-[#50FA7B] text-[#50FA7B]',
    hover: 'hover:bg-[#50FA7B] hover:text-[#282A36] hover:shadow-glow-green',
    glow:  '0 0 14px rgba(80,250,123,0.5)',
  },
  secondary: {
    base:  'border-[#BD93F9] text-[#BD93F9]',
    hover: 'hover:bg-[#BD93F9] hover:text-[#282A36] hover:shadow-glow-purple',
    glow:  '0 0 14px rgba(189,147,249,0.5)',
  },
  danger: {
    base:  'border-[#FF5555] text-[#FF5555]',
    hover: 'hover:bg-[#FF5555] hover:text-[#282A36]',
    glow:  '0 0 14px rgba(255,85,85,0.5)',
  },
  ghost: {
    base:  'border-[#6272A4] text-[#6272A4]',
    hover: 'hover:border-[#BD93F9] hover:text-[#BD93F9]',
    glow:  '0 0 14px rgba(189,147,249,0.3)',
  },
}

const SIZES = {
  sm: 'px-3 py-1.5 text-[8px] gap-1.5',
  md: 'px-5 py-2.5 text-[10px] gap-2',
  lg: 'px-7 py-3.5 text-[11px] gap-2.5',
}

const ICON_SIZES = { sm: 12, md: 14, lg: 16 }

export default function PixelButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  full = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary
  const isDisabled = disabled || loading
  const iconSize = ICON_SIZES[size]

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.96 } : undefined}
      transition={{ duration: 0.1 }}
      className={[
        // Layout
        'inline-flex items-center justify-center',
        full ? 'w-full' : '',
        SIZES[size],
        // Typography
        'font-pixel leading-none tracking-wide',
        // Shape — retro pixel feel, never rounded-full
        'border-2 rounded-sm',
        // Colors
        v.base,
        // Hover (non-disabled)
        !isDisabled ? v.hover : '',
        // Transitions
        'transition-all duration-150',
        // Disabled state
        isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        // Background — always transparent base so border reads clearly
        'bg-transparent',
        className,
      ].join(' ')}
      style={
        !isDisabled
          ? { '--btn-glow': v.glow }
          : undefined
      }
      {...rest}
    >
      {/* Left icon / loading spinner */}
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      {/* Label */}
      {children && (
        <span>{children}</span>
      )}

      {/* Right icon */}
      {!loading && iconRight && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </motion.button>
  )
}
