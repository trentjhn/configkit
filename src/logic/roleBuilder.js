/**
 * roleBuilder.js
 *
 * Assembles the role definition string from questionnaire answers.
 *
 * Output format (from CLAUDE.md):
 *   "You are a [base role] specializing in [stack], with deep expertise in [security specializations]."
 *
 * The role string becomes the first block in the generated config file.
 */

// ─── Base Roles by Project Type ───────────────────────────────────────────────

const BASE_ROLES = {
  'web-app':            'Senior Full-Stack Engineer',
  'cli-tool':           'Senior Backend Engineer and Systems Developer',
  'api-backend':        'Senior Backend Engineer and API Architect',
  'data-pipeline':      'Senior Data Engineer and Pipeline Architect',
  'discord-slack-bot':  'Senior Backend Engineer and Bot Developer',
  'mobile-app':         'Senior Mobile Engineer',
  'other':              'Senior Software Engineer',
}

// ─── Stack → Human-readable specialization label ─────────────────────────────

const STACK_LABELS = {
  react:    'React',
  nextjs:   'Next.js',
  vue:      'Vue',
  svelte:   'Svelte',
  nodejs:   'Node.js',
  python:   'Python',
  go:       'Go',
  java:     'Java',
  postgres: 'PostgreSQL',
  mysql:    'MySQL',
  mongodb:  'MongoDB',
  redis:    'Redis',
  docker:   'Docker',
  stripe:   'Stripe',
  supabase: 'Supabase',
  prisma:   'Prisma ORM',
}

// ─── Recommended Stacks by Project Type (when stackApproach = 'recommend') ───

export const RECOMMENDED_STACKS = {
  'web-app':           ['react', 'nextjs', 'postgres', 'prisma'],
  'cli-tool':          ['nodejs', 'python'],
  'api-backend':       ['nodejs', 'postgres'],
  'data-pipeline':     ['python', 'postgres'],
  'discord-slack-bot': ['nodejs'],
  'mobile-app':        ['react'],
  'other':             ['nodejs'],
}

// ─── Security Specializations from Layer 3 ───────────────────────────────────

function buildSecuritySpecs(answers) {
  const specs = []
  if (answers.hasAuth         === 'yes') specs.push('secure authentication and session management')
  if (answers.hasPayments     === 'yes') specs.push('PCI-DSS-aware payment integration patterns')
  if (answers.hasSensitiveData === 'yes') specs.push('sensitive data handling and privacy-first architecture')
  return specs
}

// ─── Core Builder ─────────────────────────────────────────────────────────────

/**
 * Returns the effective stack tech array, resolving 'recommend' to a curated list.
 */
export function resolveStack(answers) {
  if (answers.stackApproach === 'recommend') {
    return RECOMMENDED_STACKS[answers.projectType] ?? ['nodejs']
  }
  return Array.isArray(answers.stackTech) ? answers.stackTech : []
}

/**
 * Builds the full role definition sentence from answers.
 *
 * @param {object} answers - The full answers map
 * @returns {string} - Complete role sentence
 */
export function buildRole(answers) {
  const baseRole   = BASE_ROLES[answers.projectType] ?? 'Senior Software Engineer'
  const stack      = resolveStack(answers)
  const stackSpecs = stack.map(t => STACK_LABELS[t]).filter(Boolean)
  const secSpecs   = buildSecuritySpecs(answers)

  const parts = [`You are a ${baseRole}`]

  if (stackSpecs.length > 0) {
    parts.push(`specializing in ${joinNatural(stackSpecs)}`)
  }

  if (secSpecs.length > 0) {
    parts.push(`with deep expertise in ${joinNatural(secSpecs)}`)
  }

  let role = parts.join(', ') + '.'

  // Anchor the role to the specific project when a description is provided.
  // This makes the LLM's behaviour more targeted rather than generic.
  if (answers.projectDescription?.trim()) {
    role += `\n\n**Project:** ${answers.projectDescription.trim()}`
  }

  return role
}

/**
 * Returns an object with all the role component parts (for the preview panel).
 */
export function buildRoleComponents(answers) {
  const baseRole   = BASE_ROLES[answers.projectType] ?? 'Senior Software Engineer'
  const stack      = resolveStack(answers)
  const stackSpecs = stack.map(t => STACK_LABELS[t]).filter(Boolean)
  const secSpecs   = buildSecuritySpecs(answers)

  return {
    baseRole,
    stackSpecs,
    secSpecs,
    full: buildRole(answers),
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Joins an array with commas and 'and' before the last item.
 * ['React', 'Node.js', 'PostgreSQL'] → "React, Node.js, and PostgreSQL"
 */
function joinNatural(arr) {
  if (arr.length === 0) return ''
  if (arr.length === 1) return arr[0]
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`
  return `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`
}

export { BASE_ROLES, STACK_LABELS }
