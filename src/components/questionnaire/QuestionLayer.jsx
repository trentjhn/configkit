import { motion, AnimatePresence } from 'framer-motion'
import QuestionCard from './QuestionCard'
import { getLayerQuestions, getLayer } from '../../data/questions'

/**
 * QuestionLayer — renders all questions for one layer with enter/exit animation.
 *
 * Props:
 *   layerNumber   number 1-4
 *   answers       full answers object
 *   onAnswer      fn(questionId, value)
 *   direction     1 (forward) | -1 (backward) — controls slide direction
 */

const LAYER_ACCENT = {
  cyan:   '#8BE9FD',
  purple: '#BD93F9',
  orange: '#FFB86C',
  green:  '#50FA7B',
}

const variants = {
  enter:   dir => ({ x: dir > 0 ?  60 : -60, opacity: 0 }),
  center:             { x: 0,                  opacity: 1 },
  exit:    dir => ({ x: dir > 0 ? -60 :  60, opacity: 0 }),
}

export default function QuestionLayer({ layerNumber, answers, onAnswer, direction = 1 }) {
  const layer     = getLayer(layerNumber)
  const questions = getLayerQuestions(layerNumber, answers)
  const accent    = LAYER_ACCENT[layer?.color] ?? '#BD93F9'

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={layerNumber}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full"
      >
        {/* Layer header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {/* Accent bar */}
            <div
              style={{
                width:           '4px',
                height:          '32px',
                backgroundColor: accent,
                borderRadius:    '2px',
                boxShadow:       `0 0 8px ${accent}80`,
                flexShrink:      0,
              }}
            />
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize:   '11px',
                  color:      accent,
                  lineHeight: 1.6,
                  textShadow: `0 0 10px ${accent}60`,
                }}
              >
                {layer?.name}
              </h2>
              {layer?.description && (
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize:   '12px',
                    color:      '#6272A4',
                    marginTop:  '2px',
                  }}
                >
                  {layer.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {questions.map((question, i) => (
            <QuestionCard
              key={question.id}
              question={question}
              answer={answers[question.id]}
              onAnswer={onAnswer}
              layerColor={layer?.color ?? 'purple'}
              index={i}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
