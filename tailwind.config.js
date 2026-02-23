/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dracula: {
          bg:           '#282A36',
          line:         '#44475A',
          fg:           '#F8F8F2',
          comment:      '#6272A4',
          cyan:         '#8BE9FD',
          green:        '#50FA7B',
          orange:       '#FFB86C',
          pink:         '#FF79C6',
          purple:       '#BD93F9',
          red:          '#FF5555',
          yellow:       '#F1FA8C',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono:  ['"JetBrains Mono"', 'monospace'],
        vt:    ['"VT323"', 'monospace'],
      },
      transitionDuration: {
        DEFAULT: '150ms',
        fast:    '150ms',
        normal:  '200ms',
      },
      boxShadow: {
        'pixel':      '2px 2px 0 #6272A4',
        'pixel-cyan': '2px 2px 0 #8BE9FD, 0 0 12px rgba(139,233,253,0.3)',
        'glow-purple':'0 0 12px rgba(189,147,249,0.5)',
        'glow-cyan':  '0 0 12px rgba(139,233,253,0.5)',
        'glow-green': '0 0 12px rgba(80,250,123,0.5)',
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
