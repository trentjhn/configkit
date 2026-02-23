import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Loader, Check, AlertCircle } from 'lucide-react'
import { buildAndDownload } from '../../logic/outputPackager'

/**
 * DownloadButton — triggers zip generation and download.
 *
 * States: idle → loading → success → idle (after 3s)
 *         idle → loading → error   → idle (after 3s)
 *
 * Props:
 *   answers  object — current answers map
 *   result   object — decision tree result (null → disabled)
 *   disabled bool   — override disable (e.g. questionnaire incomplete)
 */

const STATE_CONFIG = {
  idle: {
    label: 'DOWNLOAD CONFIG',
    color: '#50FA7B',
    border: '#50FA7B',
    bg: 'rgba(80,250,123,0.08)',
    shadow: '2px 2px 0 #50FA7B, 0 0 14px rgba(80,250,123,0.3)',
    icon: Download,
  },
  loading: {
    label: 'GENERATING ZIP',
    color: '#BD93F9',
    border: '#BD93F9',
    bg: 'rgba(189,147,249,0.08)',
    shadow: '2px 2px 0 #BD93F9, 0 0 14px rgba(189,147,249,0.3)',
    icon: Loader,
  },
  success: {
    label: 'DOWNLOADED',
    color: '#50FA7B',
    border: '#50FA7B',
    bg: 'rgba(80,250,123,0.15)',
    shadow: '2px 2px 0 #50FA7B, 0 0 20px rgba(80,250,123,0.5)',
    icon: Check,
  },
  error: {
    label: 'FAILED — RETRY',
    color: '#FF5555',
    border: '#FF5555',
    bg: 'rgba(255,85,85,0.08)',
    shadow: '2px 2px 0 #FF5555, 0 0 14px rgba(255,85,85,0.3)',
    icon: AlertCircle,
  },
}

export default function DownloadButton({ answers, result, disabled = false }) {
  const [status, setStatus] = useState('idle')

  const isDisabled = disabled || !result || status === 'loading'
  const cfg = STATE_CONFIG[status]
  const Icon = cfg.icon

  async function handleClick() {
    if (isDisabled) return
    setStatus('loading')
    try {
      await buildAndDownload(answers, result)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error('[DownloadButton] zip failed:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled  ? {} : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '10px',
        width:          '100%',
        padding:        '14px 24px',
        fontFamily:     'var(--font-pixel)',
        fontSize:       '10px',
        color:          isDisabled ? '#44475A' : cfg.color,
        backgroundColor: isDisabled ? 'transparent' : cfg.bg,
        border:         `1px solid ${isDisabled ? '#44475A' : cfg.border}`,
        borderRadius:   '4px',
        boxShadow:      isDisabled ? 'none' : cfg.shadow,
        cursor:         isDisabled ? 'not-allowed' : 'pointer',
        transition:     'color 150ms, background-color 150ms, border-color 150ms, box-shadow 150ms',
        letterSpacing:  '0.05em',
        outline:        'none',
        position:       'relative',
        overflow:       'hidden',
      }}
    >
      {/* Shimmer on idle/success */}
      <AnimatePresence>
        {(status === 'idle' || status === 'success') && !isDisabled && (
          <motion.div
            key="shimmer"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
            style={{
              position:   'absolute',
              inset:      0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <Icon
        size={14}
        style={{
          flexShrink: 0,
          animation: status === 'loading' ? 'spin 1s linear infinite' : 'none',
        }}
      />

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
        >
          {cfg.label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
