import { motion } from 'framer-motion'
import { BlinkingCursor } from '../ui'
import OptionButton from './OptionButton'
import { getAllOptions } from '../../data/questions'

/**
 * QuestionCard — renders one question with the appropriate input type.
 *
 * Props:
 *   question     question object from questions.js
 *   answer       current answer value: string | string[] | ''
 *   onAnswer     fn(questionId, value)
 *   layerColor   'cyan' | 'purple' | 'orange' | 'green'
 *   index        number — stagger animation index
 */

const LAYER_COLORS = {
  cyan:   '#8BE9FD',
  purple: '#BD93F9',
  orange: '#FFB86C',
  green:  '#50FA7B',
}

// Grid column counts by option count
function gridCols(count) {
  if (count <= 2)  return 'grid-cols-1 sm:grid-cols-2'
  if (count <= 4)  return 'grid-cols-1 sm:grid-cols-2'
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}

// ── Single / Boolean select ──────────────────────────────────────────────────
function SingleSelect({ question, answer, onAnswer, cols }) {
  const opts = getAllOptions(question)
  return (
    <div className={`grid ${cols} gap-3`}>
      {opts.map(opt => (
        <OptionButton
          key={opt.value}
          option={opt}
          selected={answer === opt.value}
          onSelect={v => onAnswer(question.id, v)}
        />
      ))}
    </div>
  )
}

// ── Multi select (with optional categories) ──────────────────────────────────
function MultiSelect({ question, answer = [], onAnswer, layerColor }) {
  const selected = Array.isArray(answer) ? answer : []

  function toggle(value) {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    onAnswer(question.id, next)
  }

  // Categorised layout (e.g. stackTech)
  if (question.categories) {
    return (
      <div className="space-y-5">
        {question.categories.map(cat => (
          <div key={cat.label}>
            <p
              className="mb-2"
              style={{
                fontFamily: 'var(--font-vt)',
                fontSize:   '16px',
                color:      LAYER_COLORS[layerColor] ?? '#BD93F9',
                letterSpacing: '0.05em',
              }}
            >
              {cat.label}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {cat.options.map(opt => (
                <OptionButton
                  key={opt.value}
                  option={opt}
                  selected={selected.includes(opt.value)}
                  onSelect={toggle}
                  multiSelect
                  size="sm"
                />
              ))}
            </div>
          </div>
        ))}
        {selected.length > 0 && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#6272A4' }}>
            {selected.length} {selected.length === 1 ? 'technology' : 'technologies'} selected
          </p>
        )}
      </div>
    )
  }

  // Flat multi-select
  const cols = gridCols(getAllOptions(question).length)
  return (
    <div className={`grid ${cols} gap-3`}>
      {getAllOptions(question).map(opt => (
        <OptionButton
          key={opt.value}
          option={opt}
          selected={selected.includes(opt.value)}
          onSelect={toggle}
          multiSelect
        />
      ))}
    </div>
  )
}

// ── Free text ────────────────────────────────────────────────────────────────
function TextInput({ question, answer = '', onAnswer, layerColor }) {
  const accentHex  = LAYER_COLORS[layerColor] ?? '#BD93F9'
  const charCount  = answer.length
  const maxLength  = question.maxLength ?? 500
  const nearLimit  = charCount > maxLength * 0.85

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Terminal prompt prefix */}
        <span
          className="absolute top-3 left-3 select-none"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   '13px',
            color:      accentHex,
          }}
        >
          &gt;
        </span>
        <textarea
          value={answer}
          onChange={e => onAnswer(question.id, e.target.value)}
          maxLength={maxLength}
          rows={3}
          placeholder={question.placeholder ?? ''}
          className="pixel-input w-full resize-none"
          style={{
            paddingLeft: '24px',
            fontFamily:  'var(--font-mono)',
            fontSize:    '13px',
            lineHeight:  '1.7',
          }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#6272A4' }}>
          {answer.length > 0 && <BlinkingCursor color="purple" size="sm" />}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-vt)',
            fontSize:   '16px',
            color:      nearLimit ? '#FF5555' : '#6272A4',
          }}
        >
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  )
}

// ── Main QuestionCard ────────────────────────────────────────────────────────
export default function QuestionCard({ question, answer, onAnswer, layerColor = 'purple', index = 0 }) {
  const accentHex = LAYER_COLORS[layerColor] ?? '#BD93F9'
  const opts      = getAllOptions(question)
  const cols      = gridCols(opts.length)

  const isBool   = question.type === 'boolean'
  const isSingle = question.type === 'single'
  const isMulti  = question.type === 'multi'
  const isText   = question.type === 'text'

  const isAnswered = Array.isArray(answer)
    ? answer.length > 0
    : answer !== undefined && answer !== ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.25, delay: index * 0.08 }}
      style={{
        backgroundColor: '#44475A',
        border:          `1px solid ${isAnswered ? accentHex + '66' : '#6272A4'}`,
        borderRadius:    '4px',
        boxShadow:       isAnswered
          ? `2px 2px 0 ${accentHex}, 0 0 12px ${accentHex}30`
          : '2px 2px 0 #6272A4',
        padding:         '24px',
        transition:      'border-color 200ms, box-shadow 200ms',
      }}
    >
      {/* Question number badge */}
      <div className="flex items-start gap-3 mb-4">
        <span
          style={{
            fontFamily:      'var(--font-vt)',
            fontSize:        '18px',
            color:           accentHex,
            lineHeight:      1,
            minWidth:        '28px',
          }}
        >
          {typeof question.number === 'number' ? `Q${question.number}` : ''}
        </span>

        <div className="flex-1">
          {/* Question text */}
          <h3
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize:   '10px',
              color:      '#F8F8F2',
              lineHeight: 1.8,
              marginBottom: question.hint ? '8px' : '0',
            }}
          >
            {question.question}
            {question.required && (
              <span style={{ color: '#FF5555', marginLeft: '4px' }}>*</span>
            )}
          </h3>

          {/* Hint */}
          {question.hint && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize:   '11px',
                color:      '#6272A4',
                lineHeight: 1.6,
              }}
            >
              {question.hint}
            </p>
          )}
        </div>

        {/* Answered indicator */}
        {isAnswered && (
          <span
            style={{
              fontFamily: 'var(--font-vt)',
              fontSize:   '16px',
              color:      accentHex,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✓
          </span>
        )}
      </div>

      {/* Input area */}
      <div className="mt-4">
        {(isSingle || isBool) && (
          <SingleSelect
            question={question}
            answer={answer}
            onAnswer={onAnswer}
            cols={isBool ? 'grid-cols-2' : cols}
          />
        )}
        {isMulti && (
          <MultiSelect
            question={question}
            answer={answer}
            onAnswer={onAnswer}
            layerColor={layerColor}
          />
        )}
        {isText && (
          <TextInput
            question={question}
            answer={answer}
            onAnswer={onAnswer}
            layerColor={layerColor}
          />
        )}
      </div>
    </motion.div>
  )
}
