/**
 * decisionTree.js
 *
 * Orchestrator for the ConfigKit decision tree.
 * Calls guardrailEngine → roleBuilder → skillSelector in dependency order
 * and returns a single result object consumed by configAssembler and all
 * preview components.
 *
 * Usage:
 *   import { runDecisionTree } from './decisionTree'
 *   const result = runDecisionTree(answers)
 */

import { determineGuardrails }              from './guardrailEngine.js'
import { buildRole, buildRoleComponents, resolveStack } from './roleBuilder.js'
import { selectSkills, selectSkillsByTrack } from './skillSelector.js'

// ─── Output File Name by LLM Target ──────────────────────────────────────────

const OUTPUT_FILES = {
  'claude-code': 'CLAUDE.md',
  'gemini-cli':  'GEMINI.txt',
  'cursor':      '.cursorrules',
  'windsurf':    '.windsurfrules',
  'other':       'PROJECT_CONFIG.md',
}

// ─── Behavioral Directives (universal, always emitted) ───────────────────────

const BEHAVIORAL_DIRECTIVES = [
  'Write production-ready code by default — no placeholders, no TODO stubs unless explicitly asked',
  'Prefer editing existing files over creating new ones; avoid file bloat',
  'Read files before modifying them; understand existing patterns before suggesting changes',
  'Use the minimum complexity that satisfies the requirement — resist over-engineering',
  'All clickable elements need cursor-pointer and visible hover feedback',
  'Never skip error handling at system boundaries (user input, external APIs, file I/O)',
  'Ask before taking irreversible or high-blast-radius actions (deleting files, force pushing)',
]

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Runs the full decision tree against the given answers.
 *
 * @param {object} answers - The complete answers map from the questionnaire
 * @returns {DecisionTreeResult}
 *
 * @typedef {object} DecisionTreeResult
 * @property {string}   role                  - Full role sentence
 * @property {object}   roleComponents        - Decomposed role parts (baseRole, stackSpecs, secSpecs)
 * @property {string[]} skills                - Ordered skill name array
 * @property {object}   skillsByTrack         - Skills grouped by track
 * @property {number}   guardrailTier         - 0 | 1 | 2 | 3
 * @property {string}   guardrailLabel        - 'BASELINE' | 'ELEVATED' | 'HARDENED' | 'MAXIMUM'
 * @property {string}   guardrailColor        - Dracula accent name
 * @property {string[]} guardrailInstructions - Full additive instruction list
 * @property {string[][]} guardrailByTier     - Per-tier instruction arrays
 * @property {string[]} behavioralDirectives  - Universal directives
 * @property {string}   outputFile            - e.g. 'CLAUDE.md'
 * @property {string[]} resolvedStack         - Effective tech stack (after recommend resolution)
 * @property {object}   meta                  - Summary counts for preview panel
 */
export function runDecisionTree(answers) {
  // 1. Guardrails first — tier is needed by skill selector
  const guardrails = determineGuardrails(answers)

  // 2. Role
  const role           = buildRole(answers)
  const roleComponents = buildRoleComponents(answers)

  // 3. Skills — require tier from step 1
  const skills        = selectSkills(answers, guardrails.tier)
  const skillsByTrack = selectSkillsByTrack(answers, guardrails.tier)

  // 4. Output file
  const outputFile = OUTPUT_FILES[answers.llmTarget] ?? 'PROJECT_CONFIG.md'

  // 5. Resolved stack (after recommend → curated list)
  const resolvedStack = resolveStack(answers)

  return {
    role,
    roleComponents,
    skills,
    skillsByTrack,
    guardrailTier:         guardrails.tier,
    guardrailLabel:        guardrails.label,
    guardrailColor:        guardrails.color,
    guardrailInstructions: guardrails.instructions,
    guardrailByTier:       guardrails.byTier,
    behavioralDirectives:  BEHAVIORAL_DIRECTIVES,
    outputFile,
    resolvedStack,
    meta: {
      skillCount:      skills.length,
      coreSkills:      skillsByTrack.core.length,
      stackSkills:     skillsByTrack.stack.length,
      guardrailSkills: skillsByTrack.guardrail.length,
      deploySkills:    skillsByTrack.deployment.length,
      guardrailTier:   guardrails.tier,
    },
  }
}

/**
 * Returns a partial result from a partially-completed answers object.
 * Safe to call on every keystroke for the live preview panel.
 * Returns null if the minimum required answers are not yet present.
 */
export function runPartialDecisionTree(answers) {
  // Need at least a project type to produce meaningful output
  if (!answers.projectType) return null
  return runDecisionTree(answers)
}

export { OUTPUT_FILES, BEHAVIORAL_DIRECTIVES }
