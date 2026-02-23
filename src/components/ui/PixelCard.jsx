import { motion } from 'framer-motion'

/**
 * PixelCard — the primary surface primitive.
 *
 * Props:
 *   variant     'default' | 'elevated' | 'selected' | 'ghost'   default: 'default'
 *   glow        'none' | 'purple' | 'cyan' | 'green'            default: 'none'
 *   interactive bool — enables hover/tap animations (use for clickable cards)
 *   selected    bool — applies selected visual state
 *   padding     'none' | 'sm' | 'md' | 'lg'                    default: 'md'
 *   onClick     fn
 *   children    ReactNode
 *   className   string
 *   layoutId    string — Framer Motion shared layout
 */

const GLOW_SHADOWS = {
  none:   '',
  purple: '0 0 16px rgba(189,147,249,0.35)',
  cyan:   '0 0 16px rgba(139,233,253,0.35)',
  green:  '0 0 16px rgba(80,250,123,0.35)',
}

const PADDING = {
  none: 'p-0',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-8',
}

const BORDER_COLORS = {
  none:   '#6272A4',
  purple: '#BD93F9',
  cyan:   '#8BE9FD',
  green:  '#50FA7B',
}

export default function PixelCard({
  variant = 'default',
  glow = 'none',
  interactive = false,
  selected = false,
  padding = 'md',
  onClick,
  children,
  className = '',
  layoutId,
  ...rest
}) {
  // Resolve final visual state: selected overrides glow
  const activeGlow   = selected ? 'purple' : glow
  const borderColor  = selected
    ? '#BD93F9'
    : BORDER_COLORS[glow] ?? '#6272A4'

  const baseStyle = {
    backgroundColor: variant === 'ghost' ? 'transparent' : '#44475A',
    border: `1px solid ${borderColor}`,
    borderRadius: '4px',
    boxShadow: [
      // Pixel-border offset shadow (always present)
      `2px 2px 0 ${selected ? '#BD93F9' : '#6272A4'}`,
      // Optional glow
      GLOW_SHADOWS[activeGlow],
    ].filter(Boolean).join(', '),
  }

  const hoverStyle = interactive && !selected
    ? {
        borderColor: '#BD93F9',
        boxShadow: [
          '2px 2px 0 #BD93F9',
          GLOW_SHADOWS.purple,
        ].join(', '),
      }
    : {}

  const motionProps = interactive
    ? {
        whileHover: { scale: 1.01, ...hoverStyle },
        whileTap:   { scale: 0.99 },
        transition: { duration: 0.12 },
      }
    : {}

  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      style={baseStyle}
      className={[
        PADDING[padding],
        interactive ? 'cursor-pointer' : '',
        'transition-colors duration-150',
        className,
      ].join(' ')}
      {...motionProps}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
