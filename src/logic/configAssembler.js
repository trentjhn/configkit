/**
 * configAssembler.js
 *
 * Assembles the full config file content string from the decision tree result
 * and questionnaire answers.
 *
 * Output sections (per CLAUDE.md spec):
 *   ## Role
 *   ## Project Context
 *   ## Tech Stack
 *   ## Behavioral Directives
 *   ## Security Guardrails (Tier X: LABEL)
 *   ## Skill Packs Loaded
 *   ## Build Sequence
 */

import { STACK_LABELS, resolveStack } from './roleBuilder.js'

// ─── Human-readable labels for answer values ─────────────────────────────────

const PROJECT_TYPE_LABELS = {
  'web-app':           'Web Application',
  'cli-tool':          'CLI Tool',
  'api-backend':       'API / Backend Service',
  'data-pipeline':     'Data Pipeline',
  'discord-slack-bot': 'Bot (Discord / Slack)',
  'mobile-app':        'Mobile Application',
  'other':             'Software Project',
}

const DEPLOYMENT_LABELS = {
  'vercel':     'Vercel',
  'aws':        'AWS',
  'gcp':        'GCP',
  'local-only': 'Local only (not deployed)',
  'not-sure':   'Deployment target TBD',
}

// ─── Build Sequence Generator ─────────────────────────────────────────────────

/**
 * Generates a project-specific build sequence based on answers.
 * This is the most valuable section for the LLM — it tells it how to approach
 * the project in the correct order.
 */
function buildSequence(answers, result) {
  const steps = []
  const stack = resolveStack(answers)
  const hasReact   = stack.includes('react')   || stack.includes('nextjs')
  const hasNode    = stack.includes('nodejs')
  const hasPython  = stack.includes('python')
  const hasDB      = stack.some(t => ['postgres', 'mysql', 'mongodb'].includes(t))
  const hasPrisma  = stack.includes('prisma')
  const hasSupabase = stack.includes('supabase')

  const type = answers.projectType

  // Step 1 is always: scaffold + environment
  const scaffoldStep = buildScaffoldStep(type, stack, answers.deployment)
  steps.push(scaffoldStep)

  // Step 2: project structure
  steps.push(buildStructureStep(type, stack))

  // Step 3: database / data layer (if applicable)
  if (hasDB || hasPrisma || hasSupabase) {
    steps.push(buildDataLayerStep(answers, stack))
  }

  // Type-specific middle steps
  const middleSteps = buildMiddleSteps(type, answers, stack)
  steps.push(...middleSteps)

  // Security steps — ordered by tier
  if (result.guardrailTier >= 1) {
    steps.push(buildSecurityStep(answers, result.guardrailTier))
  }

  // Testing step
  steps.push('Write unit tests for all business logic and integration tests for external boundaries before marking any feature complete')

  // Deployment step (if not local)
  if (answers.deployment && answers.deployment !== 'local-only') {
    steps.push(buildDeployStep(answers.deployment, stack))
  }

  return steps.map((step, i) => `${i + 1}. ${step}`).join('\n')
}

function buildScaffoldStep(type, stack, deployment) {
  const hasReact   = stack.includes('react')
  const hasNextjs  = stack.includes('nextjs')
  const hasPython  = stack.includes('python')
  const hasNode    = stack.includes('nodejs')
  const hasGo      = stack.includes('go')

  if (type === 'web-app') {
    if (hasNextjs) return 'Scaffold the project with `npx create-next-app@latest` using the App Router; configure TypeScript, ESLint, and Tailwind at setup'
    if (hasReact)  return 'Scaffold the project with `npm create vite@latest` (React + TypeScript template); set up ESLint, Prettier, and path aliases immediately'
    return 'Scaffold the frontend project; configure the build tool, linter, and code formatter before writing any feature code'
  }
  if (type === 'api-backend') {
    if (hasNode)   return 'Initialise the Node.js project (`npm init`); install Express/Fastify, set up TypeScript, and configure the project structure (routes/, controllers/, services/, middleware/)'
    if (hasPython) return 'Create a Python virtual environment; install FastAPI/Flask with uvicorn; set up pyproject.toml and the package structure (api/, services/, models/)'
    if (hasGo)     return 'Initialise the Go module (`go mod init`); create the cmd/ and internal/ directory structure; set up the main entry point and dependency injection wiring'
    return 'Scaffold the API project; establish the directory structure and dependency management before any route implementation'
  }
  if (type === 'cli-tool') {
    if (hasNode)   return 'Initialise the Node.js project; install commander or yargs; set up the bin/ entry point and src/ module structure'
    if (hasPython) return 'Set up the Python project with pyproject.toml; install Click or Typer; configure the package entry point and src/ layout'
    return 'Scaffold the CLI project; set up the build system and entry point configuration'
  }
  if (type === 'data-pipeline') {
    if (hasPython) return 'Set up the Python project with pyproject.toml; install pipeline dependencies (pandas, SQLAlchemy, etc.); create the pipeline/, transformers/, and connectors/ directory structure'
    return 'Scaffold the data pipeline project; set up the runtime, dependency management, and stage directory structure'
  }
  if (type === 'discord-slack-bot') {
    if (hasNode) return 'Initialise the Node.js project; install the bot SDK (discord.js / @slack/bolt); set up the commands/, events/, and middleware/ directory structure'
    return 'Scaffold the bot project; install the platform SDK and set up the event handler structure'
  }
  if (type === 'mobile-app') {
    return 'Scaffold the project with the appropriate CLI (Expo, React Native CLI, or Flutter); configure the development environment and emulator targets'
  }
  return 'Scaffold the project; configure the build system, linter, and directory structure before writing any feature code'
}

function buildStructureStep(type, stack) {
  const hasReact = stack.includes('react') || stack.includes('nextjs')
  if (type === 'web-app' && hasReact) {
    return 'Build the design system foundation first: global CSS variables/tokens, base layout components (Navbar, Footer, Page), and the reusable UI primitive components (Button, Card, Input) before any feature pages'
  }
  if (type === 'api-backend') {
    return 'Define the data models and API contract (OpenAPI spec or TypeScript interfaces) before implementing any routes; this contract is the source of truth for all subsequent work'
  }
  if (type === 'data-pipeline') {
    return 'Define the source and target schemas as typed interfaces/dataclasses before implementing any transformation logic; document the expected data shape at each pipeline stage'
  }
  return 'Define the core data models and module boundaries before implementing any features; establish naming conventions and file organisation patterns the whole codebase will follow'
}

function buildDataLayerStep(answers, stack) {
  const hasPrisma   = stack.includes('prisma')
  const hasSupabase = stack.includes('supabase')
  const hasMongo    = stack.includes('mongodb')

  if (hasPrisma)   return 'Define the Prisma schema (prisma/schema.prisma) with all models, relations, and indexes; run `prisma migrate dev` to create the initial migration; implement the singleton Prisma client module'
  if (hasSupabase) return 'Set up the Supabase project; enable Row Level Security on every table immediately; define RLS policies for each operation (SELECT, INSERT, UPDATE, DELETE) before writing any queries'
  if (hasMongo)    return 'Define Mongoose schemas with validation rules and indexes for every collection; create a database connection singleton; add indexes for all query fields before any data operations'
  return 'Set up the database connection and ORM; define the initial schema migration; verify the connection and run the first migration before building any data access logic'
}

function buildMiddleSteps(type, answers, stack) {
  const steps = []
  const hasReact  = stack.includes('react') || stack.includes('nextjs')
  const hasNextjs = stack.includes('nextjs')

  if (type === 'web-app') {
    if (hasNextjs) {
      steps.push('Build the route structure with App Router layouts; implement loading.jsx and error.jsx for every data-fetching route before adding content')
      steps.push('Build each page as a Server Component by default; only add "use client" to components that require interactivity or browser APIs')
    } else if (hasReact) {
      steps.push('Set up the router and implement the page shell components with placeholder content; verify navigation works before building page content')
      steps.push('Implement the data fetching layer (service modules or React Query); connect to real data before polishing UI')
    }
    steps.push('Build all user-facing features; implement loading states, error states, and empty states for every async operation')
  }

  if (type === 'api-backend') {
    steps.push('Implement the route structure with placeholder handlers; verify the server starts and all routes respond with 200 before adding logic')
    steps.push('Build each feature from the data layer up: repository → service → controller; test each layer independently')
    steps.push('Implement request validation middleware (Zod/Joi/Pydantic) before wiring any handler to real business logic')
  }

  if (type === 'data-pipeline') {
    steps.push('Build and test each pipeline stage independently with a small sample dataset before chaining them')
    steps.push('Implement idempotency checks and checkpointing; running the pipeline twice must produce the same result')
    steps.push('Add structured logging and metrics (records processed, failed, duration) to every stage')
  }

  if (type === 'cli-tool') {
    steps.push('Implement the command surface (argument parsing, help text, --version) before any business logic')
    steps.push('Build the core logic as pure, testable functions; connect them to the CLI layer only after unit tests pass')
  }

  if (type === 'discord-slack-bot') {
    steps.push('Register commands and verify the bot connects and responds to a basic ping before implementing any handlers')
    steps.push('Implement each command handler in isolation; test with the bot in a private test server channel')
  }

  if (answers.hasAuth === 'yes') {
    steps.push('Implement the authentication flow (registration, login, session management) and route protection middleware before building any authenticated features')
  }

  if (answers.hasPayments === 'yes') {
    steps.push('Integrate the payment provider in test mode first; implement and test the complete payment flow (create session → confirm → webhook → fulfil) end-to-end before writing any UI for it')
  }

  return steps
}

function buildSecurityStep(answers, tier) {
  const items = []
  if (tier >= 1) items.push('input validation on all user-facing fields')
  if (answers.hasAuth === 'yes') items.push('auth middleware protecting all authenticated routes')
  if (tier >= 2) items.push('CORS policy configuration and security headers (Helmet/equivalents)')
  if (tier >= 3) items.push('secrets audit (no hardcoded values), encryption for sensitive fields')
  return `Security hardening pass: verify ${items.join(', ')}; run a dependency audit before deploying`
}

function buildDeployStep(deployment, stack) {
  const hasNode   = stack.includes('nodejs')
  const hasPython = stack.includes('python')
  if (deployment === 'vercel') return 'Connect the repository to Vercel; configure environment variables in the Vercel dashboard; verify the Preview deployment for the main branch before enabling production'
  if (deployment === 'aws')    return 'Define infrastructure as code (CDK or Terraform); deploy to a staging environment first; verify health checks pass before routing production traffic'
  if (deployment === 'gcp')    return 'Build and push the container image to Artifact Registry; deploy to Cloud Run with the correct service account and Secret Manager bindings; verify the health endpoint before going live'
  return 'Configure the deployment pipeline; deploy to a staging environment first and verify all critical paths before production'
}

// ─── Section Builders ─────────────────────────────────────────────────────────

function sectionRole(result) {
  return `## Role\n\n${result.role}`
}

function sectionProjectContext(answers) {
  const typeLabel   = PROJECT_TYPE_LABELS[answers.projectType] ?? 'Software Project'
  const deployLabel = DEPLOYMENT_LABELS[answers.deployment]    ?? ''

  const lines = [
    '## Project Context',
    '',
    answers.projectDescription
      ? answers.projectDescription.trim()
      : '_No description provided._',
    '',
    `- **Type:** ${typeLabel}`,
  ]
  if (deployLabel) lines.push(`- **Deployment:** ${deployLabel}`)

  return lines.join('\n')
}

function sectionTechStack(answers, result) {
  const stack = result.resolvedStack
  if (stack.length === 0) {
    return '## Tech Stack\n\n_Stack to be determined._'
  }

  const stackLines = stack.map(t => `- ${STACK_LABELS[t] ?? t}`)
  const recommended = answers.stackApproach === 'recommend'
    ? '\n\n> Stack was auto-selected by ConfigKit based on project type.' : ''

  return `## Tech Stack\n\n${stackLines.join('\n')}${recommended}`
}

function sectionBehavioralDirectives(result) {
  const lines = result.behavioralDirectives.map(d => `- ${d}`)
  return `## Behavioral Directives\n\n${lines.join('\n')}`
}

function sectionGuardrails(result) {
  const header = `## Security Guardrails (Tier ${result.guardrailTier}: ${result.guardrailLabel})`
  const lines = result.guardrailInstructions.map(i => `- ${i}`)
  return `${header}\n\n${lines.join('\n')}`
}

function sectionSkillPacks(result) {
  if (result.skills.length === 0) {
    return '## Skill Packs Loaded\n\n_No skill packs selected._'
  }
  const lines = result.skills.map(s => `- skills/${s}/SKILL.md`)
  return `## Skill Packs Loaded\n\n${lines.join('\n')}`
}

function sectionBuildSequence(answers, result) {
  return `## Build Sequence\n\nApproach this project in the following order:\n\n${buildSequence(answers, result)}`
}

// ─── Main Assembler ───────────────────────────────────────────────────────────

/**
 * Assembles the complete config file content string.
 *
 * When aiSections is provided, the four AI-generated sections (role, context,
 * directives, buildSeq) replace the template versions. Tech stack, guardrails,
 * and skill packs always come from the deterministic decision tree.
 *
 * @param {object}      answers    - Full questionnaire answers
 * @param {object}      result     - Output of runDecisionTree(answers)
 * @param {object|null} aiSections - AI-generated sections { role, context, directives, buildSeq }
 * @returns {string}               - Complete config file content
 */
export function assembleConfig(answers, result, aiSections = null) {
  const divider = '\n\n---\n\n'

  const roleSection = aiSections?.role
    ? `## Role\n\n${aiSections.role}`
    : sectionRole(result)

  const contextSection = aiSections?.context
    ? `## Project Context\n\n${aiSections.context}`
    : sectionProjectContext(answers)

  const directivesSection = aiSections?.directives
    ? `## Behavioral Directives\n\n${aiSections.directives}`
    : sectionBehavioralDirectives(result)

  const buildSeqSection = aiSections?.buildSeq
    ? `## Build Sequence\n\n${aiSections.buildSeq}`
    : sectionBuildSequence(answers, result)

  const sections = [
    `<!-- Generated by ConfigKit -->\n<!-- ${new Date().toISOString().split('T')[0]} | ${result.outputFile} | Guardrail Tier ${result.guardrailTier}: ${result.guardrailLabel}${aiSections ? ' | AI-Enhanced' : ''} -->`,
    roleSection,
    contextSection,
    sectionTechStack(answers, result),
    directivesSection,
    sectionGuardrails(result),
    sectionSkillPacks(result),
    buildSeqSection,
  ]

  return sections.join(divider)
}

/**
 * Returns the individual sections as an object for preview purposes.
 */
export function assembleConfigSections(answers, result, aiSections = null) {
  return {
    role:        aiSections?.role      ? `## Role\n\n${aiSections.role}`                         : sectionRole(result),
    context:     aiSections?.context   ? `## Project Context\n\n${aiSections.context}`            : sectionProjectContext(answers),
    techStack:   sectionTechStack(answers, result),
    directives:  aiSections?.directives ? `## Behavioral Directives\n\n${aiSections.directives}` : sectionBehavioralDirectives(result),
    guardrails:  sectionGuardrails(result),
    skillPacks:  sectionSkillPacks(result),
    buildSeq:    aiSections?.buildSeq  ? `## Build Sequence\n\n${aiSections.buildSeq}`           : sectionBuildSequence(answers, result),
  }
}

export {
  PROJECT_TYPE_LABELS,
  DEPLOYMENT_LABELS,
}
