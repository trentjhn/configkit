/**
 * BlinkingCursor — inline terminal cursor block.
 *
 * Props:
 *   color  'purple' | 'cyan' | 'green' | 'pink' | 'yellow'   default: 'purple'
 *   size   'sm' | 'md' | 'lg'                                 default: 'md'
 *   active bool — false stops the blink (shows solid cursor)  default: true
 */

const COLORS = {
  purple: '#BD93F9',
  cyan:   '#8BE9FD',
  green:  '#50FA7B',
  pink:   '#FF79C6',
  yellow: '#F1FA8C',
}

const SIZES = {
  sm: { width: '7px',  height: '0.85em' },
  md: { width: '10px', height: '1em' },
  lg: { width: '13px', height: '1.1em' },
}

export default function BlinkingCursor({
  color = 'purple',
  size = 'md',
  active = true,
}) {
  const { width, height } = SIZES[size] ?? SIZES.md
  const bg = COLORS[color] ?? COLORS.purple

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width,
        height,
        backgroundColor: bg,
        verticalAlign: 'text-bottom',
        animation: active ? 'blink 1s step-end infinite' : 'none',
        marginLeft: '2px',
      }}
    />
  )
}
