import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check as CheckIcon, FileCode2 } from 'lucide-react'
import { BlinkingCursor } from '../ui'
import SkillBadge     from './SkillBadge'
import GuardrailMeter from './GuardrailMeter'
import { runPartialDecisionTree }    from '../../logic/decisionTree'
import { assembleConfigSections }    from '../../logic/configAssembler'

/**
 * ConfigPreview — live right-panel config assembler.
 *
 * Reads answers, runs the partial decision tree on every render,
 * and displays the config being assembled in real time across 3 tabs.
 *
 * Props:
 *   answers   object — current answers map (same as Questionnaire)
 */

// ── Section readiness gate ────────────────────────────────────────────────────
// Each section requires certain answers before it can show real content.
function getSectionReady(answers) {
  const hasLayer3Any = answers.hasAuth || answers.storesData ||
                       answers.hasPayments || answers.hasSensitiveData

  return {
    role:       !!answers.projectType,
    context:    !!answers.projectDescription,
    techStack:  !!answers.stackApproach,
    directives: true,
    guardrails: !!hasLayer3Any,
    skillPacks: !!answers.projectType,
    buildSeq:   !!(answers.projectType && answers.deployment),
  }
}

// ── Config line renderer ──────────────────────────────────────────────────────
function ConfigLine({ line, lineIndex }) {
  const isComment  = line.startsWith('<!--')
  const isHeading  = line.startsWith('## ')
  const isBullet   = line.startsWith('- ')
  const isDivider  = line.trim() === '---'
  const isQuote    = line.startsWith('> ')
  const isCode     = line.startsWith('`') || (line.startsWith('  ') && line.trim().startsWith('-'))
  const isEmpty    = line.trim() === ''

  if (isDivider) {
    return (
      <div
        key={lineIndex}
        style={{
          height:          '1px',
          backgroundColor: '#44475A',
          margin:          '12px 0',
        }}
      />
    )
  }
  if (isEmpty) return <div key={lineIndex} style={{ height: '8px' }} />

  let color = '#F8F8F2'
  let fontFamily = 'var(--font-mono)'
  let fontSize = '11px'
  let fontWeight = 'normal'
  let textShadow = 'none'
  let paddingLeft = '0'

  if (isComment) {
    color = '#6272A4'; fontSize = '10px'
  } else if (isHeading) {
    color = '#BD93F9'; fontFamily = 'var(--font-pixel)'; fontSize = '9px'
    fontWeight = 'bold'; textShadow = '0 0 8px rgba(189,147,249,0.4)'
  } else if (isBullet) {
    color = '#8BE9FD'; paddingLeft = '4px'
  } else if (isQuote) {
    color = '#FFB86C'; fontFamily = 'var(--font-mono)'; fontSize = '10px'
  }

  return (
    <motion.div
      key={lineIndex}
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: Math.min(lineIndex * 0.008, 0.3) }}
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color,
        textShadow,
        paddingLeft,
        lineHeight: isHeading ? 2 : 1.7,
        whiteSpace: 'pre-wrap',
        wordBreak:  'break-word',
      }}
    >
      {line}
    </motion.div>
  )
}

// ── Section block: pending vs live ────────────────────────────────────────────
function SectionBlock({ sectionKey, content, isReady, label }) {
  if (!isReady) {
    return (
      <div className="mb-2" style={{ opacity: 0.35 }}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize:   '9px',
            color:      '#6272A4',
            marginBottom: '6px',
          }}
        >
          ## {label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   '11px',
            color:      '#44475A',
          }}
        >
          waiting for input
          <BlinkingCursor color="purple" size="sm" />
        </div>
        <div style={{ height: '8px' }} />
      </div>
    )
  }

  const lines = content.split('\n')
  return (
    <AnimatePresence>
      <motion.div
        key={sectionKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mb-2"
      >
        {lines.map((line, i) => (
          <ConfigLine key={i} line={line} lineIndex={i} />
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'config',   label: 'CONFIG'   },
  { id: 'skills',   label: 'SKILLS'   },
  { id: 'security', label: 'SECURITY' },
]

// ── Main component ────────────────────────────────────────────────────────────
export default function ConfigPreview({ answers }) {
  const [activeTab, setActiveTab]   = useState('config')
  const [copied,    setCopied]      = useState(false)

  // Run decision tree — null if projectType not yet answered
  const result = useMemo(
    () => runPartialDecisionTree(answers),
    [answers]
  )

  const sections  = useMemo(
    () => result ? assembleConfigSections(answers, result) : null,
    [answers, result]
  )

  const ready = useMemo(() => getSectionReady(answers), [answers])

  const hasAnyContent = !!answers.projectType

  // ── Copy handler ────────────────────────────────────────────────────────────
  function handleCopy() {
    if (!result || !sections) return
    const full = Object.values(sections).join('\n\n---\n\n')
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Section order / labels ──────────────────────────────────────────────────
  const SECTION_DEFS = [
    { key: 'role',       label: 'Role'                },
    { key: 'context',    label: 'Project Context'     },
    { key: 'techStack',  label: 'Tech Stack'          },
    { key: 'directives', label: 'Behavioral Directives'},
    { key: 'guardrails', label: 'Security Guardrails' },
    { key: 'skillPacks', label: 'Skill Packs Loaded'  },
    { key: 'buildSeq',   label: 'Build Sequence'      },
  ]

  return (
    <div
      style={{
        backgroundColor: '#1e1f2e',   // slightly darker than bg
        border:          '1px solid #44475A',
        borderRadius:    '4px',
        boxShadow:       '2px 2px 0 #44475A',
        display:         'flex',
        flexDirection:   'column',
        height:          '100%',
        overflow:        'hidden',
      }}
    >
      {/* Terminal chrome */}
      <div
        style={{
          backgroundColor: '#282A36',
          borderBottom:    '1px solid #44475A',
          padding:         '10px 14px',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          flexShrink:      0,
        }}
      >
        {/* Window dots */}
        <div className="flex gap-1.5">
          {['#FF5555', '#F1FA8C', '#50FA7B'].map(c => (
            <div
              key={c}
              style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c, opacity: 0.7 }}
            />
          ))}
        </div>

        {/* Filename */}
        <div className="flex items-center gap-2">
          <FileCode2 size={12} style={{ color: '#BD93F9' }} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   '11px',
              color:      result ? '#F8F8F2' : '#6272A4',
            }}
          >
            {result?.outputFile ?? 'configkit-output'}
          </span>
        </div>

        {/* Copy */}
        <button
          onClick={handleCopy}
          disabled={!result}
          style={{
            cursor:     result ? 'pointer' : 'not-allowed',
            opacity:    result ? 1 : 0.3,
            color:      copied ? '#50FA7B' : '#6272A4',
            background: 'none',
            border:     'none',
            padding:    '2px',
            transition: 'color 150ms',
          }}
          title="Copy to clipboard"
        >
          {copied
            ? <CheckIcon size={13} />
            : <Copy size={13} />
          }
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display:         'flex',
          borderBottom:    '1px solid #44475A',
          backgroundColor: '#282A36',
          flexShrink:      0,
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex:            1,
              padding:         '8px 4px',
              background:      'none',
              border:          'none',
              borderBottom:    activeTab === tab.id ? '2px solid #BD93F9' : '2px solid transparent',
              cursor:          'pointer',
              fontFamily:      'var(--font-pixel)',
              fontSize:        '7px',
              color:           activeTab === tab.id ? '#BD93F9' : '#6272A4',
              transition:      'color 150ms',
              letterSpacing:   '0.05em',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        style={{
          flex:       1,
          overflowY:  'auto',
          padding:    '14px',
        }}
      >
        {/* ── CONFIG tab ─────────────────────────────────────────────────── */}
        {activeTab === 'config' && (
          <div>
            {!hasAnyContent ? (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize:   '11px',
                  color:      '#44475A',
                  lineHeight: 2,
                }}
              >
                <span style={{ color: '#6272A4' }}>{'// '}</span>
                answer a question to start assembling
                <BlinkingCursor color="purple" size="sm" />
              </div>
            ) : (
              SECTION_DEFS.map(({ key, label }) => (
                <SectionBlock
                  key={key}
                  sectionKey={key}
                  content={sections?.[key] ?? ''}
                  isReady={ready[key] && !!sections?.[key]}
                  label={label}
                />
              ))
            )}
          </div>
        )}

        {/* ── SKILLS tab ──────────────────────────────────────────────────── */}
        {activeTab === 'skills' && (
          <div>
            {!result ? (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#44475A' }}>
                Skills will appear here as you answer questions.
              </p>
            ) : (
              <>
                {/* Skill count */}
                <p
                  style={{
                    fontFamily:   'var(--font-vt)',
                    fontSize:     '18px',
                    color:        '#BD93F9',
                    marginBottom: '12px',
                  }}
                >
                  {result.skills.length} SKILL{result.skills.length !== 1 ? 'S' : ''} LOADED
                </p>

                {/* Grouped by track */}
                {['core', 'stack', 'guardrail', 'deployment'].map(track => {
                  const trackSkills = result.skillsByTrack[track]
                  if (!trackSkills?.length) return null
                  const TRACK_COLORS_LABEL = {
                    core: '#8BE9FD', stack: '#BD93F9',
                    guardrail: '#FFB86C', deployment: '#50FA7B',
                  }
                  return (
                    <div key={track} style={{ marginBottom: '14px' }}>
                      <p
                        style={{
                          fontFamily:   'var(--font-vt)',
                          fontSize:     '15px',
                          color:        TRACK_COLORS_LABEL[track],
                          marginBottom: '6px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {track.toUpperCase()}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {trackSkills.map((name, i) => (
                          <SkillBadge key={name} skillName={name} index={i} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* ── SECURITY tab ────────────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <GuardrailMeter tier={result?.guardrailTier ?? 0} />

            {result && result.guardrailInstructions.length > 0 && (
              <>
                <div
                  style={{
                    height:          '1px',
                    backgroundColor: '#44475A',
                    margin:          '12px 0',
                  }}
                />
                <p
                  style={{
                    fontFamily:   'var(--font-pixel)',
                    fontSize:     '7px',
                    color:        '#6272A4',
                    marginBottom: '10px',
                    letterSpacing: '0.05em',
                  }}
                >
                  ACTIVE GUARDRAILS
                </p>
                <div className="space-y-2">
                  {result.guardrailInstructions.map((instr, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        fontFamily:  'var(--font-mono)',
                        fontSize:    '10px',
                        color:       '#F8F8F2',
                        lineHeight:  1.7,
                        paddingLeft: '12px',
                        borderLeft:  `2px solid #44475A`,
                      }}
                    >
                      {instr}
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer: tier badge */}
      {result && (
        <div
          style={{
            borderTop:       '1px solid #44475A',
            padding:         '8px 14px',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'space-between',
            backgroundColor: '#282A36',
            flexShrink:      0,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#6272A4' }}>
            {result.meta.skillCount} skills · tier {result.guardrailTier}
          </span>
          <span
            style={{
              fontFamily:  'var(--font-vt)',
              fontSize:    '16px',
              color:       result.guardrailTier >= 2 ? '#FFB86C' : '#50FA7B',
            }}
          >
            {result.guardrailLabel}
          </span>
        </div>
      )}
    </div>
  )
}
