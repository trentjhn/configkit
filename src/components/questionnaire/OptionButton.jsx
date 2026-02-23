import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { resolveIcon } from './icons'

/**
 * OptionButton — a selectable answer tile.
 *
 * Props:
 *   option       { value, label, description, icon, accent }
 *   selected     bool
 *   onSelect     fn(value)
 *   multiSelect  bool  — shows check indicator instead of full fill
 *   size         'sm' | 'md'    default: 'md'
 *   disabled     bool
 */

const ACCENT_COLORS = {
  cyan:    '#8BE9FD',
  green:   '#50FA7B',
  purple:  '#BD93F9',
  pink:    '#FF79C6',
  orange:  '#FFB86C',
  yellow:  '#F1FA8C',
  red:     '#FF5555',
  fg:      '#F8F8F2',
  comment: '#6272A4',
}

export default function OptionButton({
  option,
  selected = false,
  onSelect,
  multiSelect = false,
  size = 'md',
  disabled = false,
}) {
  const Icon       = resolveIcon(option.icon)
  const accentHex  = ACCENT_COLORS[option.accent] ?? ACCENT_COLORS.purple
  const isSm       = size === 'sm'
  const iconSize   = isSm ? 16 : 20

  const borderColor  = selected ? accentHex : '#6272A4'
  const bgColor      = selected ? `${accentHex}18` : 'transparent'  // 18 = ~9% opacity
  const shadowStr    = selected
    ? `2px 2px 0 ${accentHex}, 0 0 14px ${accentHex}40`
    : '2px 2px 0 #6272A4'

  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onSelect?.(option.value)}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled  ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.1 }}
      style={{
        backgroundColor: bgColor,
        border:          `1px solid ${borderColor}`,
        borderRadius:    '4px',
        boxShadow:       shadowStr,
        cursor:          disabled ? 'not-allowed' : 'pointer',
        opacity:         disabled ? 0.4 : 1,
        transition:      'background-color 150ms, border-color 150ms, box-shadow 150ms',
        textAlign:       'left',
        width:           '100%',
      }}
      className={`flex items-start gap-3 ${isSm ? 'p-3' : 'p-4'}`}
    >
      {/* Icon */}
      <span
        className="shrink-0 mt-0.5"
        style={{ color: selected ? accentHex : '#6272A4' }}
      >
        <Icon size={iconSize} />
      </span>

      {/* Text */}
      <span className="flex-1 min-w-0">
        <span
          className="block leading-tight"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize:   isSm ? '8px' : '9px',
            color:      selected ? accentHex : '#F8F8F2',
            lineHeight: 1.6,
          }}
        >
          {option.label}
        </span>
        {option.description && (
          <span
            className="block mt-1.5 leading-relaxed"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   '11px',
              color:      selected ? `${accentHex}cc` : '#6272A4',
            }}
          >
            {option.description}
          </span>
        )}
      </span>

      {/* Multi-select check indicator */}
      {multiSelect && (
        <span
          className="shrink-0 mt-0.5"
          style={{
            width:           '16px',
            height:          '16px',
            border:          `1px solid ${selected ? accentHex : '#6272A4'}`,
            borderRadius:    '2px',
            backgroundColor: selected ? accentHex : 'transparent',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            transition:      'all 150ms',
          }}
        >
          {selected && <Check size={10} color="#282A36" strokeWidth={3} />}
        </span>
      )}
    </motion.button>
  )
}

export { ACCENT_COLORS }
