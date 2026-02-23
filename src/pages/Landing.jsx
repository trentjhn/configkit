import { useRef, useEffect }                           from 'react'
import { motion }                                        from 'framer-motion'
import { Zap, Shield, ArrowRight, FileCode2, Cpu }      from 'lucide-react'
import { PixelButton, GlowText, BlinkingCursor }        from '../components/ui'

/**
 * Landing page — hero, stats, value props. Fits in 100vh, no scroll.
 *
 * Props:
 *   onStart  fn()  — navigate to questionnaire
 */

// ── ASCII trail config ─────────────────────────────────────────────────────────
const TRAIL_CHARS = ['|', '/', '\\', '-', '_', '+', '>', '<', '*']
const TRAIL_DIST  = 10   // min px of movement before spawning a character

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, color, title, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      whileHover={{
        borderColor: color,
        boxShadow:   `2px 2px 0 ${color}, 0 0 18px ${color}28`,
        y:           -2,
        transition:  { duration: 0.12, ease: 'easeOut' },
      }}
      style={{
        flex:            '1 1 160px',
        backgroundColor: '#1e1f2e',
        border:          `1px solid ${color}33`,
        borderRadius:    '4px',
        padding:         '14px',
        boxShadow:       `2px 2px 0 ${color}22`,
        cursor:          'default',
      }}
    >
      <Icon size={14} style={{ color, marginBottom: '8px' }} />
      <div
        style={{
          fontFamily:   'var(--font-pixel)',
          fontSize:     '6px',
          color,
          marginBottom: '6px',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   '10px',
          color:      '#6272A4',
          lineHeight: 1.6,
        }}
      >
        {desc}
      </div>
    </motion.div>
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function Stat({ value, label, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-vt)', fontSize: '26px', color }}>
        {value}
      </div>
      <div
        style={{
          fontFamily:   'var(--font-pixel)',
          fontSize:     '5px',
          color:        '#6272A4',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Landing({ onStart }) {
  const containerRef = useRef(null)
  const lastPosRef   = useRef(null)

  // ── ASCII trail — direct DOM manipulation, no React state ─────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x    = e.clientX - rect.left
      const y    = e.clientY - rect.top

      if (lastPosRef.current) {
        const dist = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y)
        if (dist < TRAIL_DIST) return
      }
      lastPosRef.current = { x, y }

      const char = TRAIL_CHARS[Math.floor(Math.random() * TRAIL_CHARS.length)]
      const el   = document.createElement('span')
      el.textContent  = char
      el.style.cssText = [
        'position: absolute',
        `left: ${x - 4}px`,
        `top: ${y - 6}px`,
        'font-family: var(--font-mono)',
        'font-size: 11px',
        'color: #50FA7B',
        'text-shadow: 0 0 6px rgba(80,250,123,0.9)',
        'pointer-events: none',
        'user-select: none',
        'z-index: 10',
        'animation: ascii-decay 450ms ease-out forwards',
      ].join(';')

      container.appendChild(el)
      el.addEventListener('animationend', () => el.remove(), { once: true })
    }

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        height:          '100vh',
        overflow:        'hidden',
        position:        'relative',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '0 20px',
        backgroundColor: '#282A36',
        backgroundImage: 'radial-gradient(circle, #44475A 1px, transparent 1px)',
        backgroundSize:  '28px 28px',
        cursor:          "url('/cursor.svg') 0 0, auto",
      }}
    >
      <div style={{ width: '100%', maxWidth: '720px', textAlign: 'center' }}>

        {/* ── Badge ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            display:         'inline-flex',
            alignItems:      'center',
            gap:             '8px',
            padding:         '5px 12px',
            border:          '1px solid #44475A',
            borderRadius:    '2px',
            backgroundColor: '#1e1f2e',
            marginBottom:    '18px',
          }}
        >
          <FileCode2 size={10} style={{ color: '#BD93F9' }} />
          <span
            style={{
              fontFamily:    'var(--font-pixel)',
              fontSize:      '6px',
              color:         '#6272A4',
              letterSpacing: '0.06em',
            }}
          >
            LLM CONFIG GENERATOR
          </span>
        </motion.div>

        {/* ── Title ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28, delay: 0.05 }}
          style={{ marginBottom: '14px' }}
        >
          <GlowText
            as="h1"
            font="pixel"
            color="purple"
            size="clamp(20px, 4vw, 30px)"
            pulse
          >
            CONFIGKIT
          </GlowText>
        </motion.div>

        {/* ── Tagline ───────────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.09 }}
          style={{
            fontFamily:   'var(--font-vt)',
            fontSize:     'clamp(16px, 2.2vw, 22px)',
            color:        '#F8F8F2',
            lineHeight:   1.4,
            marginBottom: '6px',
          }}
        >
          Describe your project.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.13 }}
          style={{
            fontFamily:   'var(--font-vt)',
            fontSize:     'clamp(16px, 2.2vw, 22px)',
            color:        '#BD93F9',
            lineHeight:   1.4,
            marginBottom: '28px',
          }}
        >
          Get an expert CLAUDE.md — built to spec, ready to paste.
          <BlinkingCursor color="purple" size="md" />
        </motion.p>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.18 }}
          style={{ marginBottom: '32px' }}
        >
          <PixelButton
            variant="primary"
            size="lg"
            icon={<Zap size={14} />}
            iconRight={<ArrowRight size={14} />}
            onClick={onStart}
          >
            START CONFIGURING
          </PixelButton>
        </motion.div>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.22 }}
          style={{
            display:        'flex',
            justifyContent: 'center',
            gap:            '36px',
            flexWrap:       'wrap',
            marginBottom:   '24px',
            padding:        '14px 0',
            borderTop:      '1px solid #44475A',
            borderBottom:   '1px solid #44475A',
          }}
        >
          <Stat value="6"  label="QUESTIONS"   color="#BD93F9" />
          <Stat value="45" label="SKILL PACKS" color="#8BE9FD" />
          <Stat value="4"  label="LLM TARGETS" color="#50FA7B" />
          <Stat value="0"  label="ACCOUNT REQ" color="#FFB86C" />
        </motion.div>

        {/* ── Feature cards ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <FeatureCard
            icon={Cpu}
            color="#8BE9FD"
            title="BUILT TO SPEC"
            desc="Your description becomes the source of truth. Role, directives, and build sequence engineered for your exact project."
            delay={0.28}
          />
          <FeatureCard
            icon={Shield}
            color="#FFB86C"
            title="SECURITY GUARDRAILS"
            desc="Automatically tiers your config (0–3) based on auth, payments, and sensitive data requirements."
            delay={0.32}
          />
          <FeatureCard
            icon={FileCode2}
            color="#50FA7B"
            title="SKILL PACK LIBRARY"
            desc="Bundles 45 structured SKILL.md files tailored to your exact stack and development workflow."
            delay={0.36}
          />
        </div>

        {/* ── Footer note ───────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.4 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   '9px',
            color:      '#44475A',
            marginTop:  '16px',
          }}
        >
          No account required. Config generation uses the Anthropic API.
        </motion.p>

      </div>
    </div>
  )
}
