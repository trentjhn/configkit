import { motion } from 'framer-motion'
import { SKILL_METADATA } from '../../logic/skillSelector'

/**
 * SkillBadge — compact animated pill for a single selected skill.
 *
 * Props:
 *   skillName   string   — key from SKILL_METADATA
 *   index       number   — stagger animation index
 */

const TRACK_COLORS = {
  core:       '#8BE9FD',
  stack:      '#BD93F9',
  guardrail:  '#FFB86C',
  deployment: '#50FA7B',
}

const TRACK_LABELS = {
  core:       'CORE',
  stack:      'STACK',
  guardrail:  'GUARD',
  deployment: 'DEPLOY',
}

export default function SkillBadge({ skillName, index = 0 }) {
  const meta  = SKILL_METADATA[skillName]
  const track = meta?.track  ?? 'core'
  const label = meta?.label  ?? skillName
  const color = TRACK_COLORS[track] ?? '#BD93F9'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1,    y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04, ease: 'easeOut' }}
      style={{
        display:         'inline-flex',
        alignItems:      'center',
        gap:             '6px',
        padding:         '4px 8px',
        border:          `1px solid ${color}44`,
        borderRadius:    '3px',
        backgroundColor: `${color}10`,
        boxShadow:       `1px 1px 0 ${color}66`,
      }}
    >
      {/* Track dot */}
      <span
        style={{
          width:           '5px',
          height:          '5px',
          borderRadius:    '1px',
          backgroundColor: color,
          flexShrink:      0,
          boxShadow:       `0 0 4px ${color}`,
        }}
      />

      {/* Skill label */}
      <span
        style={{
          fontFamily:  'var(--font-mono)',
          fontSize:    '10px',
          color:       '#F8F8F2',
          lineHeight:  1,
          whiteSpace:  'nowrap',
        }}
      >
        {label}
      </span>

      {/* Track tag */}
      <span
        style={{
          fontFamily:  'var(--font-vt)',
          fontSize:    '12px',
          color:       color,
          lineHeight:  1,
          opacity:     0.7,
        }}
      >
        {TRACK_LABELS[track]}
      </span>
    </motion.div>
  )
}
