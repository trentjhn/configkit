/**
 * guardrailEngine.js
 *
 * Determines the security guardrail tier from Layer 3 answers and
 * returns the full additive instruction set for that tier.
 *
 * Tier logic (from CLAUDE.md):
 *   Tier 0 — always applied (baseline for all projects)
 *   Tier 1 — any Layer 3 answer is 'yes'
 *   Tier 2 — 2+ Layer 3 answers are 'yes'
 *   Tier 3 — hasPayments === 'yes' OR hasSensitiveData === 'yes'
 *
 * Tiers are additive: Tier 3 always includes 0, 1, and 2.
 */

// ─── Instruction Sets Per Tier ────────────────────────────────────────────────

const TIER_INSTRUCTIONS = [
  // Tier 0 — universal baseline
  [
    'Never hardcode credentials, API keys, tokens, or secrets anywhere in source code',
    'Store all configuration and secrets in environment variables; document required vars in .env.example',
    'Implement proper error handling on every async operation — no silent failures or swallowed exceptions',
    'Never log sensitive data (tokens, passwords, personal info) to the console or log files',
  ],
  // Tier 1 — any user-facing surface
  [
    'Validate and sanitise all user-supplied input before processing or persisting it',
    'Never store sensitive data in localStorage, sessionStorage, or client-side cookies without encryption',
    'Enforce HTTPS for all network communication; reject plain HTTP in production',
    'Apply basic rate limiting to all public-facing API endpoints',
  ],
  // Tier 2 — auth and data in play
  [
    'Use httpOnly, Secure, SameSite cookies for session tokens — never expose tokens to JavaScript',
    'Implement token rotation and short expiry windows; handle refresh token revocation',
    'Define an explicit CORS policy; never use wildcard (*) origins in production',
    'Apply parameterised queries or an ORM throughout — never concatenate user input into SQL',
    'Escape all output rendered to HTML to prevent XSS; use a Content Security Policy header',
  ],
  // Tier 3 — payments and/or sensitive personal data
  [
    'Encrypt sensitive fields at rest (use AES-256 or equivalent); never store plaintext PII or payment data',
    'Implement audit logging for all data access and mutations to sensitive records',
    'Apply principle of least privilege to all database roles and service accounts',
    'Never log, cache, or transmit raw PII, payment card data, or health records',
    'Enforce strict secret rotation practices with documented rotation schedules',
  ],
]

const TIER_LABELS = ['BASELINE', 'ELEVATED', 'HARDENED', 'MAXIMUM']

const TIER_COLORS = ['comment', 'yellow', 'orange', 'red']

// ─── Core Engine ──────────────────────────────────────────────────────────────

/**
 * Counts how many of the four Layer 3 questions were answered 'yes'.
 */
function countSecurityYes(answers) {
  return ['hasAuth', 'storesData', 'hasPayments', 'hasSensitiveData']
    .filter(key => answers[key] === 'yes')
    .length
}

/**
 * Determines the numeric guardrail tier (0–3) from answers.
 */
export function determineTier(answers) {
  const yesCount = countSecurityYes(answers)

  // Tier 3: payments or sensitive data — immediate escalation
  if (answers.hasPayments === 'yes' || answers.hasSensitiveData === 'yes') return 3

  // Tier 2: two or more Layer 3 flags
  if (yesCount >= 2) return 2

  // Tier 1: at least one Layer 3 flag
  if (yesCount >= 1) return 1

  // Tier 0: baseline for all
  return 0
}

/**
 * Returns the full guardrail result object.
 *
 * @param {object} answers - The full answers map from the questionnaire
 * @returns {{
 *   tier:         number,          // 0 | 1 | 2 | 3
 *   label:        string,          // e.g. 'HARDENED'
 *   color:        string,          // Dracula accent name
 *   instructions: string[],        // Additive flat list for the active tier
 *   byTier:       string[][],      // Per-tier instruction arrays (for display)
 *   yesCount:     number,          // How many Layer 3 Qs were 'yes'
 * }}
 */
export function determineGuardrails(answers) {
  const tier     = determineTier(answers)
  const yesCount = countSecurityYes(answers)

  // Accumulate tiers 0 → tier (additive)
  const instructions = TIER_INSTRUCTIONS
    .slice(0, tier + 1)
    .flat()

  return {
    tier,
    label:        TIER_LABELS[tier],
    color:        TIER_COLORS[tier],
    instructions,
    byTier:       TIER_INSTRUCTIONS.slice(0, tier + 1),
    yesCount,
  }
}

// Re-export static data for display components (GuardrailMeter)
export { TIER_LABELS, TIER_COLORS, TIER_INSTRUCTIONS }
