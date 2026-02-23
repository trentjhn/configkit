import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { runDecisionTree }  from '../logic/decisionTree'
import { generateConfig }   from '../logic/aiGenerator'

/**
 * Generating — terminal-style animation screen shown between
 * questionnaire completion and the output screen.
 *
 * Runs two parallel processes:
 *   1. Animation: reveals log lines one by one (deterministic, ~2-3s)
 *   2. API call: generates AI config sections via Anthropic
 *
 * Transitions to output only when BOTH are complete.
 * If the API call fails, falls back gracefully (aiSections = null).
 *
 * Props:
 *   answers     object — completed answers map
 *   onComplete  fn(aiSections) — called when both processes finish
 */

const STEP_DELAY_MS = 260   // ms between each log line appearing
const DONE_DELAY_MS = 600   // ms to hold on "OUTPUT READY" before transitioning

// ── Dot-leader padding ────────────────────────────────────────────────────────
function pad(label, width = 38) {
  const dots = Math.max(4, width - label.length)
  return label + '.'.repeat(dots)
}

// ── Build log steps from actual result ───────────────────────────────────────
function buildSteps(result, answers) {
  const coreCount   = result.skillsByTrack.core?.length       ?? 0
  const stackCount  = result.skillsByTrack.stack?.length      ?? 0
  const guardCount  = result.skillsByTrack.guardrail?.length  ?? 0
  const deployCount = result.skillsByTrack.deployment?.length ?? 0

  const projectTypeLabel = (answers.projectType ?? 'unknown').toUpperCase().replace(/-/g, ' ')

  const steps = [
    { label: pad('AI CONFIG GENERATION'),       value: 'ACTIVE',         color: '#BD93F9' },
    { label: pad('ANALYZING PROJECT TYPE'),      value: projectTypeLabel, color: '#8BE9FD' },
    { label: pad('BUILDING ROLE DEFINITION'),   value: 'DONE',           color: '#50FA7B' },
  ]

  if (coreCount > 0) {
    steps.push({ label: pad(`LOADING CORE SKILLS (${coreCount})`),   value: 'DONE', color: '#50FA7B' })
  }
  if (stackCount > 0) {
    steps.push({ label: pad(`LOADING STACK SKILLS (${stackCount})`), value: 'DONE', color: '#50FA7B' })
  }
  if (guardCount > 0) {
    steps.push({ label: pad(`APPLYING TIER ${result.guardrailTier} GUARDRAILS (${guardCount})`), value: result.guardrailLabel, color: '#FFB86C' })
  }
  if (deployCount > 0) {
    steps.push({ label: pad(`LOADING DEPLOYMENT PACK (${deployCount})`), value: 'DONE', color: '#50FA7B' })
  }

  steps.push({ label: pad(`ASSEMBLING ${result.outputFile}`),               value: 'DONE', color: '#50FA7B' })
  steps.push({ label: pad(`PACKAGING ${result.skills.length} SKILL FILES`), value: 'DONE', color: '#50FA7B' })

  return steps
}

// ── Log line component ────────────────────────────────────────────────────────
function LogLine({ label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        display:    'flex',
        alignItems: 'baseline',
        gap:        '0',
        lineHeight: 1.9,
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6272A4' }}>
        {'  '}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#F8F8F2', whiteSpace: 'pre' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color }}>
        {value}
      </span>
    </motion.div>
  )
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function TerminalBar({ progress }) {
  const SEGMENTS = 32
  const filled = Math.round(progress * SEGMENTS)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6272A4', flexShrink: 0 }}>
        {'  ['}
      </span>
      <div style={{ display: 'flex', gap: '1px', flex: 1 }}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              backgroundColor: i < filled ? '#50FA7B' : '#44475A',
              boxShadow: i < filled ? '0 0 4px rgba(80,250,123,0.6)' : 'none',
            }}
            transition={{ duration: 0.1, delay: i < filled ? i * 0.01 : 0 }}
            style={{ height: '12px', flex: 1, borderRadius: '1px' }}
          />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#6272A4', flexShrink: 0 }}>
        {']'}
      </span>
      <motion.span
        animate={{ opacity: progress >= 1 ? 1 : [1, 0.4, 1] }}
        transition={{ duration: 0.8, repeat: progress >= 1 ? 0 : Infinity }}
        style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#50FA7B', width: '36px', flexShrink: 0 }}
      >
        {Math.round(progress * 100)}%
      </motion.span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Generating({ answers, onComplete }) {
  const result = useMemo(() => runDecisionTree(answers), [answers])
  const steps  = useMemo(() => buildSteps(result, answers), [result, answers])

  // Animation state
  const [visibleCount, setVisibleCount] = useState(0)
  const [animDone,     setAnimDone]     = useState(false)

  // API state
  const [apiDone,    setApiDone]    = useState(false)
  const [aiSections, setAiSections] = useState(null)

  // Creep: slowly nudge progress from 90% toward 97% while waiting for API
  const [creepVal, setCreepVal] = useState(0)

  // ── Start API call immediately on mount, in parallel with animation ────────
  useEffect(() => {
    generateConfig(answers, result)
      .then(sections => {
        setAiSections(sections)
        setApiDone(true)
      })
      .catch(() => {
        // Graceful fallback: proceed without AI sections
        setApiDone(true)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Animation: reveal log lines one at a time ──────────────────────────────
  useEffect(() => {
    if (visibleCount < steps.length) {
      const t = setTimeout(() => setVisibleCount(c => c + 1), STEP_DELAY_MS)
      return () => clearTimeout(t)
    }
    // All steps revealed — brief pause then mark animation done
    const t = setTimeout(() => setAnimDone(true), 400)
    return () => clearTimeout(t)
  }, [visibleCount, steps.length])

  // ── Creep: nudge from 90% → 97% while animation is done but API isn't ──────
  useEffect(() => {
    if (!animDone || apiDone) return
    const t = setInterval(() => setCreepVal(v => Math.min(v + 0.01, 0.07)), 500)
    return () => clearInterval(t)
  }, [animDone, apiDone])

  // ── Transition: only when BOTH animation AND API call are complete ─────────
  useEffect(() => {
    if (!animDone || !apiDone) return
    const t = setTimeout(() => onComplete(aiSections), DONE_DELAY_MS)
    return () => clearTimeout(t)
  }, [animDone, apiDone, aiSections, onComplete])

  const rawProgress    = steps.length > 0 ? visibleCount / steps.length : 0
  // Cap at 90% during animation, creep to 97% while waiting, snap to 100% when done
  const displayProgress = apiDone
    ? 1.0
    : Math.min(rawProgress * 0.90, 0.90) + creepVal
  const bothDone = animDone && apiDone

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#282A36' }}
    >
      <div style={{ width: '100%', maxWidth: '560px', padding: '0 20px' }}>

        {/* Terminal header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ marginBottom: '24px' }}
        >
          <div
            style={{
              fontFamily:    'var(--font-pixel)',
              fontSize:      '10px',
              color:         '#BD93F9',
              textShadow:    '0 0 12px rgba(189,147,249,0.6)',
              marginBottom:  '6px',
              letterSpacing: '0.08em',
            }}
          >
            CONFIGKIT
          </div>
          <div style={{ height: '1px', backgroundColor: '#44475A' }} />
        </motion.div>

        {/* Log lines */}
        <div style={{ minHeight: `${steps.length * 1.9 * 12}px` }}>
          {steps.slice(0, visibleCount).map((step, i) => (
            <LogLine
              key={i}
              label={step.label}
              value={step.value}
              color={step.color}
            />
          ))}
        </div>

        {/* Progress bar — appears after first step */}
        <AnimatePresence>
          {visibleCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <TerminalBar progress={displayProgress} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting for AI — animation done but API still running */}
        <AnimatePresence>
          {animDone && !apiDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: '24px' }}
            >
              <div style={{ height: '1px', backgroundColor: '#44475A', marginBottom: '16px' }} />
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{
                  fontFamily:    'var(--font-vt)',
                  fontSize:      '22px',
                  color:         '#BD93F9',
                  textShadow:    '0 0 16px rgba(189,147,249,0.6)',
                  letterSpacing: '0.05em',
                }}
              >
                AI GENERATING...
              </motion.div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize:   '11px',
                  color:      '#6272A4',
                  marginTop:  '6px',
                }}
              >
                Writing your config with Claude...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OUTPUT READY — both animation and API complete */}
        <AnimatePresence>
          {bothDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ marginTop: '24px' }}
            >
              <div style={{ height: '1px', backgroundColor: '#44475A', marginBottom: '16px' }} />
              <div
                style={{
                  fontFamily:    'var(--font-vt)',
                  fontSize:      '28px',
                  color:         '#50FA7B',
                  textShadow:    '0 0 20px rgba(80,250,123,0.7)',
                  letterSpacing: '0.05em',
                }}
              >
                OUTPUT READY
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize:   '11px',
                  color:      '#6272A4',
                  marginTop:  '6px',
                }}
              >
                {aiSections ? 'AI-enhanced config assembled.' : 'Config assembled.'} Loading output screen...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
