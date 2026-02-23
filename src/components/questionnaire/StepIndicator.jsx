import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

/**
 * StepIndicator — retro arcade stage selector.
 *
 * Shows all 4 layers as tabs. Each tab has three states:
 *   completed — solid accent, checkmark, clickable to navigate back
 *   active    — glowing accent, pulsing
 *   locked    — muted, not clickable
 *
 * Props:
 *   currentLayer   number 1-4
 *   layers         LAYERS array from questions.js
 *   completedLayers Set<number> of layer numbers fully answered
 *   onNavigate     fn(layerNumber) — called when clicking a completed layer
 */

const LAYER_ACCENT = {
  cyan:   '#8BE9FD',
  purple: '#BD93F9',
  orange: '#FFB86C',
  green:  '#50FA7B',
}

export default function StepIndicator({
  currentLayer,
  layers,
  completedLayers = new Set(),
  onNavigate,
}) {
  return (
    <div className="w-full">
      {/* Stage label */}
      <div
        className="flex items-center justify-between mb-3"
        style={{ fontFamily: 'var(--font-vt)', fontSize: '16px' }}
      >
        <span style={{ color: '#6272A4' }}>STAGE SELECT</span>
        <span style={{ color: '#BD93F9' }}>
          {currentLayer} / {layers.length}
        </span>
      </div>

      {/* Stage tabs */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${layers.length}, 1fr)` }}>
        {layers.map(layer => {
          const accent      = LAYER_ACCENT[layer.color] ?? '#BD93F9'
          const isActive    = layer.number === currentLayer
          const isCompleted = completedLayers.has(layer.number)
          const isLocked    = !isActive && !isCompleted
          const canClick    = isCompleted && !isActive

          return (
            <motion.button
              key={layer.id}
              type="button"
              onClick={() => canClick && onNavigate?.(layer.number)}
              disabled={isLocked}
              style={{
                backgroundColor: isActive
                  ? `${accent}18`
                  : isCompleted
                    ? `${accent}10`
                    : 'transparent',
                border:          `1px solid ${
                  isActive    ? accent :
                  isCompleted ? `${accent}66` :
                  '#44475A'
                }`,
                borderRadius:    '3px',
                boxShadow:       isActive
                  ? `2px 2px 0 ${accent}, 0 0 16px ${accent}40`
                  : isCompleted
                    ? `1px 1px 0 ${accent}80`
                    : '1px 1px 0 #44475A',
                cursor:          canClick ? 'pointer' : isLocked ? 'not-allowed' : 'default',
                padding:         '10px 8px',
                textAlign:       'left',
                position:        'relative',
                overflow:        'hidden',
              }}
              animate={isActive ? {
                boxShadow: [
                  `2px 2px 0 ${accent}, 0 0 10px ${accent}30`,
                  `2px 2px 0 ${accent}, 0 0 22px ${accent}60`,
                  `2px 2px 0 ${accent}, 0 0 10px ${accent}30`,
                ],
              } : {}}
              transition={isActive ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            >
              {/* Stage number */}
              <div
                className="flex items-center justify-between mb-1"
              >
                <span
                  style={{
                    fontFamily: 'var(--font-vt)',
                    fontSize:   '16px',
                    color:      isActive ? accent : isCompleted ? `${accent}99` : '#6272A4',
                  }}
                >
                  {String(layer.number).padStart(2, '0')}
                </span>
                {isCompleted && (
                  <Check
                    size={10}
                    style={{ color: accent, opacity: isActive ? 0 : 1 }}
                  />
                )}
              </div>

              {/* Stage name */}
              <span
                style={{
                  display:    'block',
                  fontFamily: 'var(--font-pixel)',
                  fontSize:   '6px',
                  lineHeight: 1.6,
                  color:      isActive ? '#F8F8F2' : isCompleted ? `#F8F8F2aa` : '#44475A',
                  wordBreak:  'break-word',
                }}
              >
                {layer.name}
              </span>

              {/* Active pulse bar at bottom */}
              {isActive && (
                <motion.div
                  style={{
                    position:        'absolute',
                    bottom:          0,
                    left:            0,
                    right:           0,
                    height:          '2px',
                    backgroundColor: accent,
                  }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
