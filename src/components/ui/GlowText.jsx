/**
 * GlowText — polymorphic text with Dracula glow.
 *
 * When `pulse` is true, uses Framer Motion to animate textShadow directly
 * so the glow hugs the letter shapes rather than the element's bounding box.
 *
 * Props:
 *   as      string | component — HTML tag or component to render  default: 'span'
 *   color   'purple' | 'cyan' | 'green' | 'pink' | 'yellow'      default: 'purple'
 *   font    'pixel' | 'mono' | 'vt'                               default: 'pixel'
 *   size    CSS font-size string, e.g. '24px', '1rem'             default: inherit
 *   pulse   bool — animate glow intensity                         default: false
 *   children ReactNode
 *   className string
 */

import { motion } from 'framer-motion'

// Each pulse array has 4 keyframes: rest → peak → peak-hold → rest
// All frames use identical layer count so Framer Motion interpolates smoothly.
// times: [0, 0.38, 0.62, 1] — quick inhale, hold at peak, slow exhale
const GLOW = {
  purple: {
    color:  '#BD93F9',
    shadow: '0 0 10px rgba(189,147,249,0.7), 0 0 20px rgba(189,147,249,0.3)',
    pulse:  [
      '0 0 4px rgba(189,147,249,0.2),  0 0 10px rgba(189,147,249,0.07), 0 0 18px rgba(189,147,249,0.02)',
      '0 0 10px rgba(189,147,249,0.75), 0 0 24px rgba(189,147,249,0.35), 0 0 44px rgba(189,147,249,0.12)',
      '0 0 10px rgba(189,147,249,0.75), 0 0 24px rgba(189,147,249,0.35), 0 0 44px rgba(189,147,249,0.12)',
      '0 0 4px rgba(189,147,249,0.2),  0 0 10px rgba(189,147,249,0.07), 0 0 18px rgba(189,147,249,0.02)',
    ],
  },
  cyan: {
    color:  '#8BE9FD',
    shadow: '0 0 10px rgba(139,233,253,0.7), 0 0 20px rgba(139,233,253,0.3)',
    pulse:  [
      '0 0 4px rgba(139,233,253,0.2),  0 0 10px rgba(139,233,253,0.07), 0 0 18px rgba(139,233,253,0.02)',
      '0 0 10px rgba(139,233,253,0.75), 0 0 24px rgba(139,233,253,0.35), 0 0 44px rgba(139,233,253,0.12)',
      '0 0 10px rgba(139,233,253,0.75), 0 0 24px rgba(139,233,253,0.35), 0 0 44px rgba(139,233,253,0.12)',
      '0 0 4px rgba(139,233,253,0.2),  0 0 10px rgba(139,233,253,0.07), 0 0 18px rgba(139,233,253,0.02)',
    ],
  },
  green: {
    color:  '#50FA7B',
    shadow: '0 0 10px rgba(80,250,123,0.7),  0 0 20px rgba(80,250,123,0.3)',
    pulse:  [
      '0 0 4px rgba(80,250,123,0.2),   0 0 10px rgba(80,250,123,0.07),  0 0 18px rgba(80,250,123,0.02)',
      '0 0 10px rgba(80,250,123,0.75),  0 0 24px rgba(80,250,123,0.35),  0 0 44px rgba(80,250,123,0.12)',
      '0 0 10px rgba(80,250,123,0.75),  0 0 24px rgba(80,250,123,0.35),  0 0 44px rgba(80,250,123,0.12)',
      '0 0 4px rgba(80,250,123,0.2),   0 0 10px rgba(80,250,123,0.07),  0 0 18px rgba(80,250,123,0.02)',
    ],
  },
  pink: {
    color:  '#FF79C6',
    shadow: '0 0 10px rgba(255,121,198,0.7), 0 0 20px rgba(255,121,198,0.3)',
    pulse:  [
      '0 0 4px rgba(255,121,198,0.2),  0 0 10px rgba(255,121,198,0.07), 0 0 18px rgba(255,121,198,0.02)',
      '0 0 10px rgba(255,121,198,0.75), 0 0 24px rgba(255,121,198,0.35), 0 0 44px rgba(255,121,198,0.12)',
      '0 0 10px rgba(255,121,198,0.75), 0 0 24px rgba(255,121,198,0.35), 0 0 44px rgba(255,121,198,0.12)',
      '0 0 4px rgba(255,121,198,0.2),  0 0 10px rgba(255,121,198,0.07), 0 0 18px rgba(255,121,198,0.02)',
    ],
  },
  yellow: {
    color:  '#F1FA8C',
    shadow: '0 0 10px rgba(241,250,140,0.7), 0 0 20px rgba(241,250,140,0.3)',
    pulse:  [
      '0 0 4px rgba(241,250,140,0.2),  0 0 10px rgba(241,250,140,0.07), 0 0 18px rgba(241,250,140,0.02)',
      '0 0 10px rgba(241,250,140,0.75), 0 0 24px rgba(241,250,140,0.35), 0 0 44px rgba(241,250,140,0.12)',
      '0 0 10px rgba(241,250,140,0.75), 0 0 24px rgba(241,250,140,0.35), 0 0 44px rgba(241,250,140,0.12)',
      '0 0 4px rgba(241,250,140,0.2),  0 0 10px rgba(241,250,140,0.07), 0 0 18px rgba(241,250,140,0.02)',
    ],
  },
}

const FONTS = {
  pixel: 'var(--font-pixel)',
  mono:  'var(--font-mono)',
  vt:    'var(--font-vt)',
}

export default function GlowText({
  as: Tag = 'span',
  color = 'purple',
  font = 'pixel',
  size,
  pulse = false,
  children,
  className = '',
  style = {},
  ...rest
}) {
  const glow = GLOW[color] ?? GLOW.purple

  const baseStyle = {
    color:      glow.color,
    fontFamily: FONTS[font] ?? FONTS.pixel,
    fontSize:   size,
    ...style,
  }

  if (pulse) {
    const MotionTag = motion[Tag] ?? motion.span
    return (
      <MotionTag
        className={className}
        style={baseStyle}
        animate={{ textShadow: glow.pulse }}
        transition={{
          duration:   4,
          times:      [0, 0.38, 0.62, 1],
          repeat:     Infinity,
          ease:       'easeInOut',
        }}
        {...rest}
      >
        {children}
      </MotionTag>
    )
  }

  return (
    <Tag
      className={className}
      style={{ ...baseStyle, textShadow: glow.shadow }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
