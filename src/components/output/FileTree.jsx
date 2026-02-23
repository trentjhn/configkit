import { motion } from 'framer-motion'
import { Folder, FolderOpen, FileText, FileCode2, FileJson } from 'lucide-react'

/**
 * FileTree — retro terminal-style directory tree display.
 *
 * Props:
 *   paths   string[]  — from getFileTree(result), e.g.:
 *                        ['configkit-output/', 'configkit-output/CLAUDE.md',
 *                         'configkit-output/.agent/', ...]
 *   result  object    — decision tree result (for highlight)
 */

// ── Icon resolver ─────────────────────────────────────────────────────────────
function getFileIcon(name, isDir) {
  if (isDir) return null // handled separately
  if (name.endsWith('.md'))  return FileText
  if (name.endsWith('.txt')) return FileText
  if (name.endsWith('.json')) return FileJson
  if (name.startsWith('.'))  return FileCode2
  return FileCode2
}

// ── Depth from path ───────────────────────────────────────────────────────────
function getDepth(path) {
  // Count non-trailing slashes after the root segment
  const parts = path.replace(/\/$/, '').split('/')
  return parts.length - 1
}

function getFileName(path) {
  return path.replace(/\/$/, '').split('/').pop() || path
}

function isDirectory(path) {
  return path.endsWith('/')
}

// ── Tree connector characters ─────────────────────────────────────────────────
function TreeRow({ path, index, isLast, siblings }) {
  const depth    = getDepth(path)
  const name     = getFileName(path)
  const isDir    = isDirectory(path)
  const Icon     = isDir ? null : getFileIcon(name, false)

  // Color rules
  let color = '#F8F8F2'
  let iconColor = '#6272A4'
  if (isDir) {
    color     = '#BD93F9'
    iconColor = '#BD93F9'
  } else if (name.startsWith('SKILL.md')) {
    color     = '#8BE9FD'
    iconColor = '#8BE9FD'
  } else if (name === 'CLAUDE.md' || name.endsWith('.md') || name.endsWith('.txt') || name.startsWith('.')) {
    color     = '#50FA7B'
    iconColor = '#50FA7B'
  }

  // Build indentation prefix using box-drawing characters
  // depth 0 = root, 1 = direct child, 2 = grandchild, etc.
  const INDENT = '  ' // 2 chars per level (monospace)
  const prefix = INDENT.repeat(depth)

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.12, delay: Math.min(index * 0.012, 0.4) }}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '6px',
        padding:    '2px 0',
      }}
    >
      {/* Indentation + connector */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize:   '11px',
          color:      '#44475A',
          whiteSpace: 'pre',
          userSelect: 'none',
        }}
      >
        {prefix}
        {depth > 0 ? (isLast ? '└── ' : '├── ') : ''}
      </span>

      {/* Icon */}
      {isDir ? (
        depth === 0
          ? <FolderOpen size={12} style={{ color: iconColor, flexShrink: 0 }} />
          : <Folder     size={12} style={{ color: iconColor, flexShrink: 0 }} />
      ) : (
        Icon && <Icon size={12} style={{ color: iconColor, flexShrink: 0 }} />
      )}

      {/* Name */}
      <span
        style={{
          fontFamily:  'var(--font-mono)',
          fontSize:    '11px',
          color,
          whiteSpace:  'nowrap',
          lineHeight:  1.5,
        }}
      >
        {name}{isDir ? '/' : ''}
      </span>
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function FileTree({ paths = [], result }) {
  if (!paths.length) return null

  // Determine which entries are "last" at each depth level.
  // We track per-parent whether each child is the final one.
  const lastAtDepth = {}
  for (let i = 0; i < paths.length; i++) {
    const depth = getDepth(paths[i])
    // Look ahead: is the next path at the same or shallower depth?
    const nextDepth = i + 1 < paths.length ? getDepth(paths[i + 1]) : -1
    lastAtDepth[i] = nextDepth <= depth
  }

  return (
    <div
      style={{
        backgroundColor: '#1e1f2e',
        border:          '1px solid #44475A',
        borderRadius:    '4px',
        padding:         '14px 16px',
        overflowX:       'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily:   'var(--font-pixel)',
          fontSize:     '7px',
          color:        '#6272A4',
          marginBottom: '10px',
          letterSpacing: '0.08em',
        }}
      >
        OUTPUT STRUCTURE
      </div>

      {/* Tree rows */}
      {paths.map((path, i) => (
        <TreeRow
          key={path}
          path={path}
          index={i}
          isLast={lastAtDepth[i]}
        />
      ))}

      {/* Footer stats */}
      {result && (
        <div
          style={{
            marginTop:   '10px',
            paddingTop:  '8px',
            borderTop:   '1px solid #44475A',
            fontFamily:  'var(--font-mono)',
            fontSize:    '10px',
            color:       '#6272A4',
            display:     'flex',
            gap:         '16px',
          }}
        >
          <span>1 config file</span>
          <span>{result.skills.length} skill{result.skills.length !== 1 ? 's' : ''}</span>
          <span style={{ color: '#50FA7B' }}>{
            // estimateZipSize inline (avoids extra import)
            `~${Math.round((2800 + result.skills.length * 650) / 1024)} KB`
          }</span>
        </div>
      )}
    </div>
  )
}
