import { motion } from 'framer-motion'
import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { TIER_LABELS } from '../../logic/guardrailEngine'

/**
 * GuardrailMeter — visual security tier indicator (Tier 0–3).
 *
 * Props:
 *   tier          number  0 | 1 | 2 | 3       default: 0
 *   showDetails   bool    show per-tier labels  default: true
 */

const TIERS = [
  {
    label:       'BASELINE',
    sublabel:    'Universal guardrails for all projects',
    color:       '#6272A4',
    glow:        'rgba(98,114,164,0.4)',
  },
  {
    label:       'ELEVATED',
    sublabel:    'Input validation + HTTPS + rate limiting',
    color:       '#F1FA8C',
    glow:        'rgba(241,250,140,0.4)',
  },
  {
    label:       'HARDENED',
    sublabel:    'Auth patterns + CORS + XSS/SQLi prevention',
    color:       '#FFB86C',
    glow:        'rgba(255,184,108,0.4)',
  },
  {
    label:       'MAXIMUM',
    sublabel:    'Encryption at rest + audit logging + PCI rules',
    color:       '#FF5555',
    glow:        'rgba(255,85,85,0.4)',
  },
]

function TierSegment({ index, activeTier }) {
  const t         = TIERS[index]
  const isFilled  = index <= activeTier
  const isActive  = index === activeTier

  return (
    <motion.div
      style={{
        flex:            1,
        height:          '10px',
        borderRadius:    '2px',
        border:          `1px solid ${isFilled ? t.color : '#44475A'}`,
        overflow:        'hidden',
        position:        'relative',
      }}
      animate={{
        backgroundColor: isFilled ? t.color : '#282A36',
        boxShadow:       isActive  ? `0 0 10px ${t.glow}` : 'none',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Shimmer on active segment */}
      {isActive && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          style={{
            position:   'absolute',
            inset:      0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          }}
        />
      )}
    </motion.div>
  )
}

export default function GuardrailMeter({ tier = 0, showDetails = true }) {
  const active = TIERS[tier] ?? TIERS[0]

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {tier >= 2
            ? <ShieldAlert size={14} style={{ color: active.color }} />
            : <ShieldCheck  size={14} style={{ color: active.color }} />
          }
          <span
            style={{
              fontFamily:  'var(--font-pixel)',
              fontSize:    '8px',
              color:       active.color,
              textShadow:  `0 0 8px ${active.glow}`,
            }}
          >
            TIER {tier}
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-vt)',
            fontSize:   '18px',
            color:      active.color,
          }}
        >
          {active.label}
        </span>
      </div>

      {/* Segment bar */}
      <div className="flex gap-1 mb-2">
        {TIERS.map((_, i) => (
          <TierSegment key={i} index={i} activeTier={tier} />
        ))}
      </div>

      {/* Sublabel */}
      {showDetails && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   '11px',
            color:      '#6272A4',
          }}
        >
          {active.sublabel}
        </p>
      )}
    </div>
  )
}
