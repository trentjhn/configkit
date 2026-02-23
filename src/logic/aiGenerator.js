/**
 * aiGenerator.js
 *
 * Calls the Anthropic Messages API to generate the four AI-authored sections
 * of the config file. The API key is read from the environment variable
 * VITE_ANTHROPIC_API_KEY — never stored client-side or in code.
 *
 * Cost optimisations applied:
 *   - Model: claude-haiku-4-5 (~4× cheaper than Sonnet, equal quality for
 *     structured generation tasks like this)
 *   - max_tokens: 1000 (actual output rarely exceeds 800; signals conciseness)
 *   - Prompt: terse instructions (~130 words vs ~300 in verbose version)
 *
 * Returns: { role, context, directives, buildSeq } — all strings, or null
 * per section if parsing fails. Callers should treat nulls as "fall back to
 * template output" rather than errors.
 */

import { STACK_LABELS } from './roleBuilder.js'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-haiku-4-5-20251001'

// ── Label maps ────────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  'web-app':           'Web Application',
  'cli-tool':          'CLI Tool',
  'api-backend':       'API / Backend Service',
  'data-pipeline':     'Data Pipeline',
  'discord-slack-bot': 'Bot (Discord / Slack)',
  'mobile-app':        'Mobile Application',
  'other':             'Software Project',
}

const DEPLOY_LABELS = {
  'vercel':     'Vercel',
  'aws':        'AWS',
  'gcp':        'GCP',
  'local-only': 'Local only',
  'not-sure':   'TBD',
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(answers, result) {
  const stack     = result.resolvedStack.map(t => STACK_LABELS[t] ?? t)
  const stackStr  = stack.length ? stack.join(', ') : 'Not specified'
  const typeStr   = TYPE_LABELS[answers.projectType]   ?? answers.projectType  ?? 'Not specified'
  const deployStr = DEPLOY_LABELS[answers.deployment]  ?? answers.deployment   ?? 'Not specified'

  const secFlags = []
  if (answers.hasAuth          === 'yes') secFlags.push('User authentication')
  if (answers.storesData       === 'yes') secFlags.push('Persistent data storage')
  if (answers.hasPayments      === 'yes') secFlags.push('Payment processing')
  if (answers.hasSensitiveData === 'yes') secFlags.push('Sensitive data')
  const secStr = secFlags.length ? secFlags.join(', ') : 'None'

  return `Generate a CLAUDE.md config for a coding AI assistant on this project.

Project: ${answers.projectDescription?.trim() || 'Not provided.'}
Type: ${typeStr}
Stack: ${stackStr}
Deploy: ${deployStr}
Security: ${secStr}
Guardrail tier: ${result.guardrailTier} — ${result.guardrailLabel}

Output ONLY these 4 sections with exact headings. Every line must be specific to this project — no generic advice.

## Role
2-3 sentences. Who is this assistant, what are they building, what stack, what priorities.

## Project Context
3-5 sentences. What it does, who uses it, key technical decisions, what success looks like.

## Behavioral Directives
8-10 bullet points starting with "- ". Opinionated, project-specific rules: exact library choices for this stack, code organisation patterns, anti-patterns to avoid. No platitudes.

## Build Sequence
6-8 numbered steps from scratch. Reference specific commands and libraries from the stack. Scaffolding first, testing or deployment last.`
}

// ── Section parser ────────────────────────────────────────────────────────────

function parseSections(text) {
  const extract = (heading) => {
    const re = new RegExp(`## ${heading}\\n+([\\s\\S]*?)(?=\\n## |$)`)
    return text.match(re)?.[1]?.trim() ?? null
  }

  return {
    role:       extract('Role'),
    context:    extract('Project Context'),
    directives: extract('Behavioral Directives'),
    buildSeq:   extract('Build Sequence'),
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Generates the four AI-authored config sections.
 *
 * @param {object} answers  — questionnaire answers
 * @param {object} result   — runDecisionTree(answers) output
 * @returns {Promise<{ role, context, directives, buildSeq }>}
 */
export async function generateConfig(answers, result) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set. Add it to your .env file.')
  }

  const response = await fetch(API_URL, {
    method:  'POST',
    headers: {
      'x-api-key':                                 apiKey,
      'anthropic-version':                         '2023-06-01',
      'content-type':                              'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 1000,
      messages:   [{ role: 'user', content: buildPrompt(answers, result) }],
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error?.message ?? `Anthropic API error ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''

  return parseSections(text)
}
