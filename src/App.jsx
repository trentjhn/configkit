import { useState } from 'react'
import ScanlineOverlay from './components/layout/ScanlineOverlay'
import Landing         from './pages/Landing'
import Questionnaire   from './pages/Questionnaire'
import Generating      from './pages/Generating'
import Output          from './pages/Output'

// View state machine: 'landing' | 'questionnaire' | 'generating' | 'output'

// Security flag IDs that get derived from the securityFlags multi-select
const SECURITY_FLAGS = ['hasAuth', 'storesData', 'hasPayments', 'hasSensitiveData']

export default function App() {
  const [view,       setView]       = useState('landing')
  const [aiSections, setAiSections] = useState(null)

  // Initialize security flags as 'no' so the decision tree always has valid values
  // even if the user never interacts with the securityFlags question
  const [answers, setAnswers] = useState({
    hasAuth:         'no',
    storesData:      'no',
    hasPayments:     'no',
    hasSensitiveData: 'no',
  })

  function handleAnswer(questionId, value) {
    setAnswers(prev => {
      const next = { ...prev, [questionId]: value }

      // Derive individual boolean flags from the securityFlags multi-select
      if (questionId === 'securityFlags') {
        SECURITY_FLAGS.forEach(flag => {
          next[flag] = value.includes(flag) ? 'yes' : 'no'
        })
      }

      return next
    })
  }

  function handleStart() {
    setView('questionnaire')
  }

  function handleComplete() {
    setAiSections(null)   // reset from any previous run
    setView('generating')
  }

  function handleGeneratingDone(sections) {
    setAiSections(sections)
    setView('output')
  }

  function handleBackToQuestionnaire() {
    setView('questionnaire')
  }

  function handleBackToLanding() {
    setView('landing')
    setAnswers({
      hasAuth:         'no',
      storesData:      'no',
      hasPayments:     'no',
      hasSensitiveData: 'no',
    })
    setAiSections(null)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#282A36' }}>
      <ScanlineOverlay />

      {view === 'landing' && (
        <Landing onStart={handleStart} />
      )}

      {view === 'questionnaire' && (
        <Questionnaire
          answers={answers}
          onAnswer={handleAnswer}
          onComplete={handleComplete}
          onBack={handleBackToLanding}
        />
      )}

      {view === 'generating' && (
        <Generating
          answers={answers}
          onComplete={handleGeneratingDone}
        />
      )}

      {view === 'output' && (
        <Output
          answers={answers}
          aiSections={aiSections}
          onBack={handleBackToQuestionnaire}
        />
      )}
    </div>
  )
}
