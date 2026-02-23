/**
 * skillSelector.js
 *
 * Selects the set of skill names to load based on questionnaire answers and
 * the guardrail tier. Returns an ordered, deduplicated array of skill name
 * strings — one per skill file that will be generated in the output zip.
 *
 * Skill selection tracks (from CLAUDE.md):
 *   1. Deterministic — always loaded by project type
 *   2. Conditional   — loaded by tech stack selection
 *   3. Guardrail     — loaded by tier
 *   4. Deployment    — loaded by deployment target
 */

import { resolveStack } from './roleBuilder.js'

// ─── Track 1: Deterministic Skills by Project Type ───────────────────────────

const PROJECT_TYPE_SKILLS = {
  'web-app':           ['building-web-apps', 'structuring-components', 'integrating-apis'],
  'cli-tool':          ['building-cli-tools', 'handling-io-streams', 'error-handling-patterns'],
  'api-backend':       ['designing-rest-apis', 'request-validation', 'api-error-handling'],
  'data-pipeline':     ['building-data-pipelines', 'transformation-logic', 'idempotency-patterns'],
  'discord-slack-bot': ['building-cli-tools', 'handling-io-streams', 'error-handling-patterns'],
  'mobile-app':        ['building-web-apps', 'structuring-components', 'integrating-apis'],
  'other':             ['error-handling-patterns', 'integrating-apis'],
}

// ─── Track 2: Conditional Skills by Stack Technology ─────────────────────────

const STACK_SKILLS = {
  react:    ['managing-react-state', 'structuring-react-components'],
  nextjs:   ['nextjs-routing-patterns', 'ssr-and-data-fetching'],
  vue:      ['managing-vue-state', 'structuring-vue-components'],
  svelte:   ['svelte-component-patterns'],
  nodejs:   ['nodejs-async-patterns', 'express-middleware'],
  python:   ['python-project-structure', 'dependency-management'],
  go:       ['go-project-structure', 'go-concurrency-patterns'],
  java:     ['java-project-structure', 'spring-patterns'],
  postgres: ['database-query-patterns', 'migration-management'],
  mysql:    ['database-query-patterns', 'migration-management'],
  mongodb:  ['mongodb-schema-patterns', 'aggregation-pipeline'],
  redis:    ['redis-caching-patterns'],
  docker:   ['containerisation-patterns'],
  stripe:   ['stripe-integration-patterns'],
  supabase: ['supabase-patterns'],
  prisma:   ['prisma-schema-patterns'],
}

// ─── Track 3: Guardrail Skills — selected conditionally on actual answers ──────
// Skills are only added if the user's answers indicate they're actually needed.
// This prevents skill bloat from blind tier accumulation.

// ─── Track 4: Deployment Skills ──────────────────────────────────────────────

const DEPLOYMENT_SKILLS = {
  'vercel':      ['deploying-to-vercel'],
  'aws':         ['deploying-to-aws'],
  'gcp':         ['deploying-to-gcp'],
  'local-only':  [],
  'not-sure':    [],
}

// ─── Metadata for each skill (used by SkillBadge and skillTemplates) ─────────

export const SKILL_METADATA = {
  // Web
  'building-web-apps':              { label: 'Building Web Apps',           track: 'core',       accent: 'cyan'   },
  'structuring-components':         { label: 'Structuring Components',      track: 'core',       accent: 'cyan'   },
  'integrating-apis':               { label: 'Integrating APIs',            track: 'core',       accent: 'cyan'   },
  // CLI
  'building-cli-tools':             { label: 'Building CLI Tools',          track: 'core',       accent: 'green'  },
  'handling-io-streams':            { label: 'Handling IO Streams',         track: 'core',       accent: 'green'  },
  'error-handling-patterns':        { label: 'Error Handling',              track: 'core',       accent: 'green'  },
  // API
  'designing-rest-apis':            { label: 'Designing REST APIs',         track: 'core',       accent: 'purple' },
  'request-validation':             { label: 'Request Validation',          track: 'core',       accent: 'purple' },
  'api-error-handling':             { label: 'API Error Handling',          track: 'core',       accent: 'purple' },
  // Data
  'building-data-pipelines':        { label: 'Building Data Pipelines',     track: 'core',       accent: 'yellow' },
  'transformation-logic':           { label: 'Transformation Logic',        track: 'core',       accent: 'yellow' },
  'idempotency-patterns':           { label: 'Idempotency Patterns',        track: 'core',       accent: 'yellow' },
  // React / Next
  'managing-react-state':           { label: 'React State',                 track: 'stack',      accent: 'cyan'   },
  'structuring-react-components':   { label: 'React Components',            track: 'stack',      accent: 'cyan'   },
  'nextjs-routing-patterns':        { label: 'Next.js Routing',             track: 'stack',      accent: 'fg'     },
  'ssr-and-data-fetching':          { label: 'SSR & Data Fetching',         track: 'stack',      accent: 'fg'     },
  // Vue / Svelte
  'managing-vue-state':             { label: 'Vue State',                   track: 'stack',      accent: 'green'  },
  'structuring-vue-components':     { label: 'Vue Components',              track: 'stack',      accent: 'green'  },
  'svelte-component-patterns':      { label: 'Svelte Patterns',             track: 'stack',      accent: 'orange' },
  // Node / Python / Go / Java
  'nodejs-async-patterns':          { label: 'Node.js Async',               track: 'stack',      accent: 'green'  },
  'express-middleware':             { label: 'Express Middleware',           track: 'stack',      accent: 'green'  },
  'python-project-structure':       { label: 'Python Structure',            track: 'stack',      accent: 'yellow' },
  'dependency-management':          { label: 'Dependency Management',       track: 'stack',      accent: 'yellow' },
  'go-project-structure':           { label: 'Go Structure',                track: 'stack',      accent: 'cyan'   },
  'go-concurrency-patterns':        { label: 'Go Concurrency',              track: 'stack',      accent: 'cyan'   },
  'java-project-structure':         { label: 'Java Structure',              track: 'stack',      accent: 'orange' },
  'spring-patterns':                { label: 'Spring Patterns',             track: 'stack',      accent: 'orange' },
  // Database
  'database-query-patterns':        { label: 'Query Patterns',              track: 'stack',      accent: 'purple' },
  'migration-management':           { label: 'DB Migrations',               track: 'stack',      accent: 'purple' },
  'mongodb-schema-patterns':        { label: 'MongoDB Schemas',             track: 'stack',      accent: 'green'  },
  'aggregation-pipeline':           { label: 'Aggregation Pipeline',        track: 'stack',      accent: 'green'  },
  'redis-caching-patterns':         { label: 'Redis Caching',               track: 'stack',      accent: 'red'    },
  'prisma-schema-patterns':         { label: 'Prisma Schema',               track: 'stack',      accent: 'pink'   },
  'supabase-patterns':              { label: 'Supabase',                    track: 'stack',      accent: 'green'  },
  // Infrastructure
  'containerisation-patterns':      { label: 'Containerisation',            track: 'stack',      accent: 'cyan'   },
  'stripe-integration-patterns':    { label: 'Stripe Integration',          track: 'stack',      accent: 'purple' },
  // Guardrail
  'validating-user-input':          { label: 'Input Validation',            track: 'guardrail',  accent: 'yellow' },
  'implementing-auth-patterns':     { label: 'Auth Patterns',               track: 'guardrail',  accent: 'orange' },
  'managing-cors-policy':           { label: 'CORS Policy',                 track: 'guardrail',  accent: 'orange' },
  'managing-secrets-and-env':       { label: 'Secrets & Env',               track: 'guardrail',  accent: 'red'    },
  'handling-payment-security':      { label: 'Payment Security',            track: 'guardrail',  accent: 'red'    },
  'data-encryption-patterns':       { label: 'Data Encryption',             track: 'guardrail',  accent: 'red'    },
  // Deployment
  'deploying-to-vercel':            { label: 'Deploy → Vercel',             track: 'deployment', accent: 'fg'     },
  'deploying-to-aws':               { label: 'Deploy → AWS',                track: 'deployment', accent: 'orange' },
  'deploying-to-gcp':               { label: 'Deploy → GCP',                track: 'deployment', accent: 'cyan'   },
}

// ─── Description Keyword → Skill Injection ───────────────────────────────────
// Scans the free-text project description for signals that the user's explicit
// stack selections may have missed. Only injects skills that exist in SKILL_METADATA.

const DESCRIPTION_KEYWORDS = [
  { keywords: ['payment', 'stripe', 'checkout', 'billing', 'subscription', 'purchase'], skill: 'stripe-integration-patterns' },
  { keywords: ['cache', 'caching', 'redis'],                                             skill: 'redis-caching-patterns'       },
  { keywords: ['supabase'],                                                               skill: 'supabase-patterns'            },
  { keywords: ['prisma', ' orm'],                                                         skill: 'prisma-schema-patterns'       },
  { keywords: ['docker', 'container', 'kubernetes', 'k8s'],                              skill: 'containerisation-patterns'    },
  { keywords: ['auth', 'login', 'jwt', 'oauth', 'sso', 'sign in', 'sign up'],           skill: 'implementing-auth-patterns'   },
  { keywords: ['real-time', 'realtime', 'live update', 'websocket'],                    skill: 'redis-caching-patterns'       },
  { keywords: ['secret', 'api key', 'credential', '.env'],                              skill: 'managing-secrets-and-env'     },
  { keywords: ['encrypt', 'encryption', 'at rest'],                                     skill: 'data-encryption-patterns'     },
  { keywords: ['mongodb', 'mongo'],                                                       skill: 'mongodb-schema-patterns'      },
]

function selectFromDescription(description) {
  if (!description) return []
  const lower = description.toLowerCase()
  const skills = []
  for (const { keywords, skill } of DESCRIPTION_KEYWORDS) {
    if (keywords.some(kw => lower.includes(kw))) {
      skills.push(skill)
    }
  }
  return skills
}

// ─── Core Selector ───────────────────────────────────────────────────────────

/**
 * Returns the ordered, deduplicated list of skill names for the given answers
 * and guardrail tier.
 *
 * @param {object} answers - Full questionnaire answers
 * @param {number} tier    - Guardrail tier (0-3), from guardrailEngine
 * @returns {string[]}     - Ordered skill name array
 */
export function selectSkills(answers, tier = 0) {
  const seen   = new Set()
  const skills = []

  function add(name) {
    if (!seen.has(name)) {
      seen.add(name)
      skills.push(name)
    }
  }

  // Track 1: Deterministic by project type
  const coreSkills = PROJECT_TYPE_SKILLS[answers.projectType] ?? []
  coreSkills.forEach(add)

  // Track 2: Conditional by stack
  const stack = resolveStack(answers)
  stack.forEach(tech => {
    const techSkills = STACK_SKILLS[tech] ?? []
    techSkills.forEach(add)
  })

  // Track 3: Guardrail skills — conditional on actual answers
  if (tier >= 1) {
    // Input validation is always relevant once any security concern exists
    add('validating-user-input')
  }
  if (tier >= 2) {
    // Auth patterns only if the project actually uses authentication
    if (answers.hasAuth === 'yes') add('implementing-auth-patterns')
    // CORS is only relevant for web-facing projects
    if (['web-app', 'api-backend', 'mobile-app'].includes(answers.projectType)) {
      add('managing-cors-policy')
    }
  }
  if (tier >= 3) {
    // Secrets management applies broadly at tier 3
    add('managing-secrets-and-env')
    // Payment security only if payments are involved
    if (answers.hasPayments === 'yes')      add('handling-payment-security')
    // Encryption only if sensitive data is involved
    if (answers.hasSensitiveData === 'yes') add('data-encryption-patterns')
  }

  // Track 4: Description keyword injection
  // Picks up stack signals from free text that explicit selections may have missed.
  selectFromDescription(answers.projectDescription).forEach(add)

  // Track 5: Deployment
  const deploySkills = DEPLOYMENT_SKILLS[answers.deployment] ?? []
  deploySkills.forEach(add)

  return skills
}

/**
 * Returns skills grouped by track for display in the preview panel.
 * { core: [], stack: [], guardrail: [], deployment: [] }
 */
export function selectSkillsByTrack(answers, tier = 0) {
  const all = selectSkills(answers, tier)
  return all.reduce((groups, name) => {
    const track = SKILL_METADATA[name]?.track ?? 'core'
    if (!groups[track]) groups[track] = []
    groups[track].push(name)
    return groups
  }, { core: [], stack: [], guardrail: [], deployment: [] })
}

export { PROJECT_TYPE_SKILLS, STACK_SKILLS, DEPLOYMENT_SKILLS }
