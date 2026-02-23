import { motion } from 'framer-motion'

/**
 * ProgressBar — retro segmented block progress indicator.
 *
 * Each segment corresponds to one step in the questionnaire.
 * States: empty → active (current) → filled (completed).
 *
 * Props:
 *   current  number — 1-based index of the active step
 *   total    number — total number of segments
 *   label    bool   — show "STEP X / Y" label above bar    default: true
 *   color    'cyan' | 'purple' | 'green'                   default: 'cyan'
 */

const SEGMENT_COLORS = {
  filled: {
    cyan:   { bg: '#8BE9FD', shadow: '0 0 8px rgba(139,233,253,0.5)' },
    purple: { bg: '#BD93F9', shadow: '0 0 8px rgba(189,147,249,0.5)' },
    green:  { bg: '#50FA7B', shadow: '0 0 8px rgba(80,250,123,0.5)' },
  },
  active: {
    cyan:   { bg: '#BD93F9', shadow: '0 0 12px rgba(189,147,249,0.7)' },
    purple: { bg: '#8BE9FD', shadow: '0 0 12px rgba(139,233,253,0.7)' },
    green:  { bg: '#BD93F9', shadow: '0 0 12px rgba(189,147,249,0.7)' },
  },
}

function Segment({ state, color }) {
  const isFilled = state === 'filled'
  const isActive = state === 'active'
  const isEmpty  = state === 'empty'

  const colorSet = isActive
    ? SEGMENT_COLORS.active[color]
    : isFilled
      ? SEGMENT_COLORS.filled[color]
      : null

  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: colorSet ? colorSet.bg : '#44475A',
        boxShadow: colorSet ? colorSet.shadow : 'none',
      }}
      transition={{ duration: 0.2 }}
      style={{
        height: '12px',
        flex: 1,
        border: `1px solid ${isActive || isFilled ? 'transparent' : '#6272A4'}`,
        borderRadius: '1px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Active pulse shimmer */}
      {isActive && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
        />
      )}
    </motion.div>
  )
}

export default function ProgressBar({
  current = 1,
  total = 4,
  label = true,
  color = 'cyan',
}) {
  const segments = Array.from({ length: total }, (_, i) => {
    const step = i + 1
    if (step < current)  return 'filled'
    if (step === current) return 'active'
    return 'empty'
  })

  return (
    <div className="w-full">
      {label && (
        <div
          className="flex justify-between items-center mb-2"
          style={{ fontFamily: 'var(--font-vt)', fontSize: '18px' }}
        >
          <span style={{ color: '#6272A4' }}>PROGRESS</span>
          <span style={{ color: '#BD93F9' }}>
            STEP {current} / {total}
          </span>
        </div>
      )}

      <div className="flex gap-1">
        {segments.map((state, i) => (
          <Segment key={i} state={state} color={color} />
        ))}
      </div>
    </div>
  )
}
