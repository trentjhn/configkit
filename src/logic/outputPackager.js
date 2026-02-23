/**
 * outputPackager.js
 *
 * Assembles and downloads the ConfigKit output zip.
 *
 * Zip structure:
 *   configkit-output/
 *     ├── {outputFile}          e.g. CLAUDE.md
 *     └── .agent/
 *         └── skills/
 *             ├── {skill-name}/
 *             │   └── SKILL.md
 *             └── {skill-name}/
 *                 └── SKILL.md
 *
 * Usage:
 *   const blob = await buildZip(answers, result)
 *   triggerDownload(blob, 'configkit-output.zip')
 */

import JSZip from 'jszip'
import { assembleConfig }  from './configAssembler.js'
import { getSkillTemplate } from './skillTemplates.js'

// ─── Zip Builder ──────────────────────────────────────────────────────────────

/**
 * Builds the output zip from answers and the decision tree result.
 *
 * @param {object} answers  - Full questionnaire answers
 * @param {object} result   - Output of runDecisionTree(answers)
 * @returns {Promise<Blob>} - Zip blob ready for download
 */
export async function buildZip(answers, result) {
  const zip     = new JSZip()
  const root    = zip.folder('configkit-output')
  const skills  = root.folder('skills')

  // 1. Main config file
  const configContent = assembleConfig(answers, result)
  root.file(result.outputFile, configContent)

  // 2. One SKILL.md per selected skill
  for (const skillName of result.skills) {
    const content = getSkillTemplate(skillName)
    skills.folder(skillName).file('SKILL.md', content)
  }

  // 3. Generate and return the blob
  const blob = await zip.generateAsync({
    type:               'blob',
    compression:        'DEFLATE',
    compressionOptions: { level: 6 },
  })

  return blob
}

// ─── Download Trigger ─────────────────────────────────────────────────────────

/**
 * Triggers a browser file download for a Blob.
 *
 * @param {Blob}   blob     - The file content
 * @param {string} filename - The suggested filename
 */
export function triggerDownload(blob, filename = 'configkit-output.zip') {
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Revoke after a short delay to allow the download to start
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * Convenience: builds the zip and immediately triggers a download.
 *
 * @param {object} answers
 * @param {object} result
 * @returns {Promise<void>}
 */
export async function buildAndDownload(answers, result) {
  const blob = await buildZip(answers, result)
  triggerDownload(blob, 'configkit-output.zip')
}

// ─── Preview Utilities ────────────────────────────────────────────────────────

/**
 * Returns the file tree as an array of path strings for the FileTree component.
 *
 * @param {object} result - Decision tree result
 * @returns {string[]}    - e.g. ['configkit-output/', 'configkit-output/CLAUDE.md', ...]
 */
export function getFileTree(result) {
  const tree = [
    'configkit-output/',
    `configkit-output/${result.outputFile}`,
    'configkit-output/skills/',
  ]

  for (const skillName of result.skills) {
    tree.push(`configkit-output/skills/${skillName}/`)
    tree.push(`configkit-output/skills/${skillName}/SKILL.md`)
  }

  return tree
}

/**
 * Returns a human-readable size estimate string for the output zip.
 * Based on avg skill template size (~600 bytes) + config file size.
 *
 * @param {object} result
 * @returns {string} e.g. "~18 KB"
 */
export function estimateZipSize(result) {
  const AVG_SKILL_BYTES  = 650
  const AVG_CONFIG_BYTES = 2800
  const totalBytes = AVG_CONFIG_BYTES + (result.skills.length * AVG_SKILL_BYTES)
  const kb = Math.round(totalBytes / 1024)
  return `~${kb} KB`
}
