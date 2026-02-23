import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react'
import { PixelButton, GlowText } from '../components/ui'
import StepIndicator from '../components/questionnaire/StepIndicator'
import QuestionLayer  from '../components/questionnaire/QuestionLayer'
import {
  LAYERS,
  getLayerQuestions,
  getStepQuestions,
  countAnswered,
} from '../data/questions'

/**
 * Questionnaire page — the 4-layer stepped question flow.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  Sticky top bar: logo · progress · StepIndicator    │
 *   ├─────────────────────────────────┬───────────────────┤
 *   │  Left: scrollable questions     │  Right: preview   │
 *   │  (full width on mobile)         │  (lg+ only)       │
 *   └─────────────────────────────────┴───────────────────┘
 *
 * Props:
 *   answers    object — current answers map (lifted to App)
 *   onAnswer   fn(questionId, value)
 *   onComplete fn() — called when all layers are finished
 *   onBack     fn() — navigate back to Landing
 */

function isLayerComplete(layerNumber, answers) {
  const questions = getLayerQuestions(layerNumber, answers)
  return questions
    .filter(q => q.required)
    .every(q => {
      const val = answers[q.id]
      if (Array.isArray(val)) return val.length > 0
      return val !== undefined && val !== ''
    })
}

export default function Questionnaire({ answers, onAnswer, onComplete, onBack }) {
  const [currentLayer, setCurrentLayer] = useState(1)
  const [direction,    setDirection]    = useState(1)

  const completedLayers = useMemo(() => {
    const set = new Set()
    LAYERS.forEach(l => {
      if (isLayerComplete(l.number, answers)) set.add(l.number)
    })
    return set
  }, [answers])

  const canAdvance  = isLayerComplete(currentLayer, answers)
  const isLastLayer = currentLayer === LAYERS.length
  const answered    = countAnswered(answers)
  const total       = getStepQuestions().length

  function goTo(layerNum) {
    setDirection(layerNum > currentLayer ? 1 : -1)
    setCurrentLayer(layerNum)
  }

  function handleNext() {
    if (isLastLayer) onComplete?.()
    else goTo(currentLayer + 1)
  }

  function handlePrev() {
    if (currentLayer === 1) onBack?.()
    else goTo(currentLayer - 1)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#282A36' }}>

      {/* ── Sticky top bar ───────────────────────────────────────────────── */}
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
          <div className="flex items-center justify-between mb-4">
            <GlowText font="pixel" color="purple" size="12px">
              CONFIGKIT
            </GlowText>
            <span style={{ fontFamily: 'var(--font-vt)', fontSize: '18px', color: '#6272A4' }}>
              {answered}/{total} LOADED
            </span>
          </div>
          <StepIndicator
            currentLayer={currentLayer}
            layers={LAYERS}
            completedLayers={completedLayers}
            onNavigate={goTo}
          />
        </div>
      </div>

      {/* ── Questions body ────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-5 py-8">

        <div>
          <QuestionLayer
            layerNumber={currentLayer}
            answers={answers}
            onAnswer={onAnswer}
            direction={direction}
          />

          {/* Navigation */}
          <motion.div
            className="flex items-center justify-between mt-8 pt-6"
            style={{ borderTop: '1px solid #44475A' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <PixelButton
              variant="ghost"
              size="sm"
              icon={<ArrowLeft size={12} />}
              onClick={handlePrev}
            >
              {currentLayer === 1 ? 'HOME' : 'BACK'}
            </PixelButton>

            <div className="flex items-center gap-3">
              {/* Layer dot indicators */}
              <div className="flex gap-1.5">
                {LAYERS.map(l => (
                  <div
                    key={l.id}
                    style={{
                      width:           '6px',
                      height:          '6px',
                      borderRadius:    '1px',
                      backgroundColor: l.number === currentLayer
                        ? '#BD93F9'
                        : completedLayers.has(l.number) ? '#6272A4' : '#44475A',
                      boxShadow: l.number === currentLayer
                        ? '0 0 6px rgba(189,147,249,0.8)' : 'none',
                      transition: 'all 150ms',
                    }}
                  />
                ))}
              </div>

              <PixelButton
                variant={isLastLayer ? 'primary' : 'secondary'}
                size="sm"
                icon={isLastLayer ? <Zap size={12} /> : undefined}
                iconRight={isLastLayer ? undefined : <ArrowRight size={12} />}
                onClick={handleNext}
                disabled={!canAdvance}
              >
                {isLastLayer ? 'GENERATE' : 'NEXT'}
              </PixelButton>
            </div>
          </motion.div>

          {!canAdvance && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-center"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#6272A4' }}
            >
              Answer all required questions to continue
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
