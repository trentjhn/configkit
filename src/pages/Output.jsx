import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap, Shield, Code2 } from 'lucide-react'
import { PixelButton, GlowText, BlinkingCursor } from '../components/ui'
import FileTree      from '../components/output/FileTree'
import DownloadButton from '../components/output/DownloadButton'
import GuardrailMeter from '../components/preview/GuardrailMeter'
import { runDecisionTree }    from '../logic/decisionTree'
import { assembleConfig }     from '../logic/configAssembler'
import { getFileTree }        from '../logic/outputPackager'
import { isComplete }         from '../data/questions'

/**
 * Output page — download screen shown after questionnaire completion.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  Sticky top bar: logo · stats · back button          │
 *   ├────────────────────────────┬────────────────────────┤
 *   │  Left: scrollable config   │  Right: file tree      │
 *   │  preview (full text)       │        + download btn  │
 *   └────────────────────────────┴────────────────────────┘
 *
 * Props:
 *   answers  object — completed answers map
 *   onBack   fn()   — navigate back to questionnaire
 */

// ── Config line renderer (lightweight, no animation — full text can be long) ──
function ConfigLine({ line }) {
  const isComment  = line.startsWith('<!--')
  const isHeading  = line.startsWith('## ')
  const isBullet   = line.startsWith('- ')
  const isDivider  = line.trim() === '---'
  const isQuote    = line.startsWith('> ')
  const isEmpty    = line.trim() === ''

  if (isDivider) {
    return (
      <div
        style={{
          height:          '1px',
          backgroundColor: '#44475A',
          margin:          '10px 0',
        }}
      />
    )
  }
  if (isEmpty) return <div style={{ height: '6px' }} />

  let color = '#F8F8F2'
  if (isComment)     color = '#6272A4'
  else if (isHeading) color = '#BD93F9'
  else if (isBullet)  color = '#8BE9FD'
  else if (isQuote)   color = '#FFB86C'

  return (
    <div
      style={{
        fontFamily:  isHeading ? 'var(--font-pixel)' : 'var(--font-mono)',
        fontSize:    isHeading ? '8px' : '11px',
        color,
        lineHeight:  isHeading ? 2 : 1.7,
        whiteSpace:  'pre-wrap',
        wordBreak:   'break-word',
        paddingLeft: isBullet ? '4px' : '0',
        textShadow:  isHeading ? '0 0 8px rgba(189,147,249,0.4)' : 'none',
      }}
    >
      {line}
    </div>
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             '6px',
        padding:         '6px 12px',
        border:          `1px solid ${color}44`,
        borderRadius:    '3px',
        backgroundColor: `${color}10`,
      }}
    >
      <Icon size={12} style={{ color }} />
      <span style={{ fontFamily: 'var(--font-vt)', fontSize: '16px', color }}>
        {value}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6272A4' }}>
        {label}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Output({ answers, onBack, aiSections = null }) {
  const result = useMemo(() => runDecisionTree(answers), [answers])
  const config = useMemo(() => assembleConfig(answers, result, aiSections), [answers, result, aiSections])
  const tree   = useMemo(() => getFileTree(result), [result])
  const done   = isComplete(answers)

  const configLines = config.split('\n')

  const TIER_COLORS = ['#6272A4', '#F1FA8C', '#FFB86C', '#FF5555']
  const tierColor   = TIER_COLORS[result.guardrailTier] ?? '#6272A4'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#282A36' }}>

      {/* ── Sticky top bar ─────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom:    '1px solid #44475A',
          backgroundColor: '#282A36',
          position:        'sticky',
          top:             0,
          zIndex:          50,
        }}
      >
        <div className="max-w-6xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">

            {/* Logo + status */}
            <div className="flex items-center gap-4">
              <GlowText font="pixel" color="green" size="12px">
                CONFIGKIT
              </GlowText>
              <span
                style={{
                  fontFamily: 'var(--font-vt)',
                  fontSize:   '18px',
                  color:      '#50FA7B',
                }}
              >
                CONFIG READY
              </span>
            </div>

            {/* Stat pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatPill
                icon={Zap}
                label="skills"
                value={result.meta.skillCount}
                color="#BD93F9"
              />
              <StatPill
                icon={Shield}
                label={`tier ${result.guardrailTier}`}
                value={result.guardrailLabel}
                color={tierColor}
              />
              <StatPill
                icon={Code2}
                label="file"
                value={result.outputFile}
                color="#8BE9FD"
              />
            </div>

            {/* Back button */}
            <PixelButton
              variant="ghost"
              size="sm"
              icon={<ArrowLeft size={12} />}
              onClick={onBack}
            >
              BACK
            </PixelButton>
          </div>
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 py-8 flex gap-6 items-start">

        {/* Left: full config text (scrollable) */}
        <div className="flex-1 min-w-0">

          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ marginBottom: '16px' }}
          >
            <div
              style={{
                fontFamily:   'var(--font-pixel)',
                fontSize:     '8px',
                color:        '#6272A4',
                marginBottom: '4px',
                letterSpacing: '0.08em',
              }}
            >
              GENERATED CONFIG
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize:   '11px',
                color:      '#6272A4',
              }}
            >
              {result.outputFile}
              <BlinkingCursor color="green" size="sm" />
            </div>
          </motion.div>

          {/* Config content panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              backgroundColor: '#1e1f2e',
              border:          '1px solid #44475A',
              borderRadius:    '4px',
              padding:         '16px',
              boxShadow:       '2px 2px 0 #44475A',
            }}
          >
            {configLines.map((line, i) => (
              <ConfigLine key={i} line={line} />
            ))}
          </motion.div>
        </div>

        {/* Right: sticky panel — file tree + download */}
        <div
          className="hidden lg:block"
          style={{
            width:      '320px',
            flexShrink: 0,
            position:   'sticky',
            top:        '100px',
            display:    'flex',
            flexDirection: 'column',
            gap:        '16px',
          }}
        >
          {/* File tree */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
          >
            <FileTree paths={tree} result={result} />
          </motion.div>

          {/* Guardrail meter */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
            style={{
              backgroundColor: '#1e1f2e',
              border:          '1px solid #44475A',
              borderRadius:    '4px',
              padding:         '14px',
            }}
          >
            <GuardrailMeter tier={result.guardrailTier} showDetails={true} />
          </motion.div>

          {/* Download button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.25 }}
          >
            <DownloadButton
              answers={answers}
              result={result}
              disabled={!done}
            />
            {!done && (
              <p
                style={{
                  fontFamily:  'var(--font-mono)',
                  fontSize:    '10px',
                  color:       '#6272A4',
                  textAlign:   'center',
                  marginTop:   '8px',
                }}
              >
                Complete all required questions to download
              </p>
            )}
          </motion.div>
        </div>

      </div>

      {/* Mobile: download button pinned at bottom */}
      <div
        className="lg:hidden"
        style={{
          position:        'sticky',
          bottom:          0,
          padding:         '12px 20px',
          backgroundColor: '#282A36',
          borderTop:       '1px solid #44475A',
        }}
      >
        <DownloadButton answers={answers} result={result} disabled={!done} />
      </div>

    </div>
  )
}
