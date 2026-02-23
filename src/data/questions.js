/**
 * questions.js — Single source of truth for all questionnaire questions.
 *
 * Redesigned to 2 layers, 6 questions (+ 1 conditional sub-question).
 * The description question is open-ended and feeds the AI generator.
 * Security flags replace the 4 individual boolean questions — derived
 * into hasAuth/storesData/hasPayments/hasSensitiveData in App.jsx.
 *
 * Question types:
 *   'single'  — pick one option  (rendered as OptionButton grid)
 *   'multi'   — pick many        (rendered as toggleable OptionButton grid)
 *   'text'    — free text input  (rendered as BlinkingCursor-styled textarea)
 *
 * Conditional questions:
 *   `conditionalOn: { id, value }` — only shown when answers[id] === value
 *   `conditionalOn: { id, notIn }` — hidden when answers[id] is in notIn list
 *
 * Layer numbering:
 *   Layer 1 — Project Setup     (Q 1-4, with conditional Q3b)
 *   Layer 2 — Tell Us More      (Q 5-6)
 */

// ─── Layer Metadata ──────────────────────────────────────────────────────────

export const LAYERS = [
  {
    number:      1,
    id:          'setup',
    name:        'PROJECT SETUP',
    description: 'LLM target, project type, stack, and deployment.',
    color:       'purple',
    questions:   ['llmTarget', 'projectType', 'stackApproach', 'stackTech', 'deployment'],
  },
  {
    number:      2,
    id:          'description',
    name:        'TELL US MORE',
    description: 'Describe your project and flag any security requirements.',
    color:       'cyan',
    questions:   ['projectDescription', 'securityFlags'],
  },
]

// ─── Questions Array ──────────────────────────────────────────────────────────

export const QUESTIONS = [

  // ── Layer 1: Project Setup ─────────────────────────────────────────────────

  {
    id:       'llmTarget',
    layer:    1,
    number:   1,
    type:     'single',
    question: 'Which LLM are you building with?',
    hint:     'Determines the config filename and output format conventions.',
    required: true,
    options: [
      {
        value:       'claude-code',
        label:       'Claude Code',
        description: 'Outputs CLAUDE.md',
        icon:        'Cpu',
        accent:      'orange',
        outputFile:  'CLAUDE.md',
      },
      {
        value:       'gemini-cli',
        label:       'Gemini CLI',
        description: 'Outputs GEMINI.txt',
        icon:        'Sparkles',
        accent:      'cyan',
        outputFile:  'GEMINI.txt',
      },
      {
        value:       'cursor',
        label:       'Cursor',
        description: 'Outputs .cursorrules',
        icon:        'MousePointer2',
        accent:      'purple',
        outputFile:  '.cursorrules',
      },
      {
        value:       'windsurf',
        label:       'Windsurf',
        description: 'Outputs .windsurfrules',
        icon:        'Wind',
        accent:      'cyan',
        outputFile:  '.windsurfrules',
      },
      {
        value:       'other',
        label:       'Other',
        description: 'Outputs PROJECT_CONFIG.md',
        icon:        'FileText',
        accent:      'comment',
        outputFile:  'PROJECT_CONFIG.md',
      },
    ],
  },

  {
    id:       'projectType',
    layer:    1,
    number:   2,
    type:     'single',
    question: 'What are you building?',
    hint:     'This determines your base role and core skill pack.',
    required: true,
    options: [
      {
        value:       'web-app',
        label:       'Web App',
        description: 'Frontend or full-stack web application',
        icon:        'Monitor',
        accent:      'cyan',
      },
      {
        value:       'cli-tool',
        label:       'CLI Tool',
        description: 'Command-line utility or dev tool',
        icon:        'Terminal',
        accent:      'green',
      },
      {
        value:       'api-backend',
        label:       'API / Backend',
        description: 'REST or GraphQL API service',
        icon:        'Server',
        accent:      'purple',
      },
      {
        value:       'data-pipeline',
        label:       'Data Pipeline',
        description: 'ETL, batch processing, or streaming data',
        icon:        'GitMerge',
        accent:      'yellow',
      },
      {
        value:       'discord-slack-bot',
        label:       'Bot',
        description: 'Discord, Slack, or messaging platform bot',
        icon:        'Bot',
        accent:      'pink',
      },
      {
        value:       'mobile-app',
        label:       'Mobile App',
        description: 'iOS, Android, or React Native app',
        icon:        'Smartphone',
        accent:      'orange',
      },
      {
        value:       'other',
        label:       'Other',
        description: 'Something that doesn\'t fit above',
        icon:        'Boxes',
        accent:      'comment',
      },
    ],
  },

  {
    id:       'stackApproach',
    layer:    1,
    number:   3,
    type:     'single',
    question: 'What\'s your tech stack?',
    hint:     'Choose your own or let ConfigKit pick a proven combo for your project type.',
    required: true,
    options: [
      {
        value:       'choose',
        label:       'I\'ll Choose',
        description: 'Select the specific technologies you\'re using',
        icon:        'ListChecks',
        accent:      'purple',
      },
      {
        value:       'recommend',
        label:       'Recommend One',
        description: 'ConfigKit picks the best stack for your project type',
        icon:        'Wand2',
        accent:      'cyan',
      },
    ],
  },

  {
    // Sub-question — only shown when stackApproach === 'choose'
    id:             'stackTech',
    layer:          1,
    number:         '3b',      // not counted in step total; part of step 3
    type:           'multi',
    question:       'Which technologies are you using?',
    hint:           'Select all that apply. Each selection loads targeted skill files.',
    required:       false,
    conditionalOn:  { id: 'stackApproach', value: 'choose' },
    categories: [
      {
        label: 'FRONTEND',
        options: [
          { value: 'react',   label: 'React',    description: 'UI library',               icon: 'Layers',       accent: 'cyan'   },
          { value: 'nextjs',  label: 'Next.js',  description: 'React + SSR framework',    icon: 'Triangle',     accent: 'fg'     },
          { value: 'vue',     label: 'Vue',       description: 'Progressive UI framework', icon: 'Hexagon',      accent: 'green'  },
          { value: 'svelte',  label: 'Svelte',    description: 'Compiled UI framework',   icon: 'Flame',        accent: 'orange' },
        ],
      },
      {
        label: 'BACKEND',
        options: [
          { value: 'nodejs',  label: 'Node.js',  description: 'JS runtime',               icon: 'Circle',       accent: 'green'  },
          { value: 'python',  label: 'Python',   description: 'Scripting / ML / APIs',    icon: 'Code2',        accent: 'yellow' },
          { value: 'go',      label: 'Go',        description: 'Compiled systems lang',   icon: 'Wind',         accent: 'cyan'   },
          { value: 'java',    label: 'Java',      description: 'JVM ecosystem',           icon: 'Coffee',       accent: 'orange' },
        ],
      },
      {
        label: 'DATABASE',
        options: [
          { value: 'postgres',  label: 'PostgreSQL', description: 'Relational SQL',       icon: 'Database',     accent: 'cyan'   },
          { value: 'mysql',     label: 'MySQL',      description: 'Relational SQL',       icon: 'Database',     accent: 'orange' },
          { value: 'mongodb',   label: 'MongoDB',    description: 'Document store',       icon: 'Leaf',         accent: 'green'  },
          { value: 'redis',     label: 'Redis',      description: 'In-memory cache/db',   icon: 'Zap',          accent: 'red'    },
        ],
      },
      {
        label: 'INFRASTRUCTURE',
        options: [
          { value: 'docker',   label: 'Docker',    description: 'Containerization',       icon: 'Container',    accent: 'cyan'   },
          { value: 'stripe',   label: 'Stripe',    description: 'Payment processing',     icon: 'CreditCard',   accent: 'purple' },
          { value: 'supabase', label: 'Supabase',  description: 'BaaS / Postgres host',  icon: 'Bolt',         accent: 'green'  },
          { value: 'prisma',   label: 'Prisma',    description: 'ORM / query builder',   icon: 'GitBranch',    accent: 'pink'   },
        ],
      },
    ],
  },

  {
    id:       'deployment',
    layer:    1,
    number:   4,
    type:     'single',
    question: 'Where will this be deployed?',
    hint:     'Loads deployment-specific skill files and config conventions.',
    required: true,
    options: [
      {
        value:       'vercel',
        label:       'Vercel',
        description: 'Zero-config frontend & edge functions',
        icon:        'Triangle',
        accent:      'fg',
      },
      {
        value:       'aws',
        label:       'AWS',
        description: 'EC2, Lambda, S3, ECS and the full suite',
        icon:        'Cloud',
        accent:      'orange',
      },
      {
        value:       'gcp',
        label:       'GCP',
        description: 'Cloud Run, GKE, BigQuery, Firebase',
        icon:        'Globe',
        accent:      'cyan',
      },
      {
        value:       'local-only',
        label:       'Local Only',
        description: 'Runs on my machine, not deployed',
        icon:        'HardDrive',
        accent:      'green',
      },
      {
        value:       'not-sure',
        label:       'Not Sure Yet',
        description: 'Deployment decision pending',
        icon:        'HelpCircle',
        accent:      'comment',
      },
    ],
  },

  // ── Layer 2: Tell Us More ──────────────────────────────────────────────────

  {
    id:          'projectDescription',
    layer:       2,
    number:      5,
    type:        'text',
    question:    'Describe your project.',
    hint:        'The AI uses this to generate your Role, Project Context, Behavioral Directives, and Build Sequence. The more specific you are, the better your config will be.',
    placeholder: 'e.g. A B2B SaaS dashboard for construction project managers. Teams create projects, assign tasks to subcontractors, and track milestone completion. Built on React + Node.js + PostgreSQL. We charge per seat and handle payment through Stripe. The main technical challenge is the real-time progress tracking across multiple job sites.',
    required:    true,
  },

  {
    id:       'securityFlags',
    layer:    2,
    number:   6,
    type:     'multi',
    question: 'Any security requirements?',
    hint:     'Select all that apply. Each selection escalates your guardrail tier and loads targeted security skill files. Leave blank if none.',
    required: false,
    options: [
      {
        value:       'hasAuth',
        label:       'User Auth',
        description: 'Real users log in or create accounts',
        icon:        'Lock',
        accent:      'yellow',
      },
      {
        value:       'storesData',
        label:       'User Data',
        description: 'Persistent user-linked data is stored',
        icon:        'Database',
        accent:      'cyan',
      },
      {
        value:       'hasPayments',
        label:       'Payments',
        description: 'Payment processing or transactions',
        icon:        'CreditCard',
        accent:      'red',
      },
      {
        value:       'hasSensitiveData',
        label:       'Sensitive Data',
        description: 'Health, location, messages, or financial data',
        icon:        'Shield',
        accent:      'orange',
      },
    ],
  },
]

// ─── Helper Utilities ─────────────────────────────────────────────────────────

/**
 * Returns true if a question should be displayed given the current answers.
 * Questions without `conditionalOn` are always visible.
 */
export function isQuestionVisible(question, answers = {}) {
  if (!question.conditionalOn) return true
  const { id, value, notIn, in: inList } = question.conditionalOn
  const current = answers[id]
  if (value  !== undefined) return current === value
  if (notIn  !== undefined) return !notIn.includes(current)
  if (inList !== undefined) return inList.includes(current)
  return true
}

/**
 * Returns all questions for a given layer number (1–2).
 * Only returns questions visible given current answers.
 */
export function getLayerQuestions(layerNumber, answers = {}) {
  return QUESTIONS.filter(
    q => q.layer === layerNumber && isQuestionVisible(q, answers)
  )
}

/**
 * Returns the ordered list of "step" questions (canonical numbered steps).
 * Excludes sub-questions (number is a string like '3b').
 */
export function getStepQuestions() {
  return QUESTIONS.filter(q => typeof q.number === 'number')
}

/**
 * Returns all options in a flat array for a given question.
 * Handles both `options` (flat) and `categories` (grouped) structures.
 */
export function getAllOptions(question) {
  if (question.options) return question.options
  if (question.categories) {
    return question.categories.flatMap(cat => cat.options)
  }
  return []
}

/**
 * Returns the layer metadata object for a given layer number.
 */
export function getLayer(layerNumber) {
  return LAYERS.find(l => l.number === layerNumber) ?? null
}

/**
 * Given current answers, returns how many of the canonical steps
 * have been answered (i.e., answers[id] is non-empty).
 */
export function countAnswered(answers = {}) {
  return getStepQuestions().filter(q => {
    const val = answers[q.id]
    if (Array.isArray(val)) return val.length > 0
    return val !== undefined && val !== ''
  }).length
}

/**
 * Returns true when all required visible questions have been answered.
 */
export function isComplete(answers = {}) {
  const visibleRequired = QUESTIONS.filter(
    q => q.required && isQuestionVisible(q, answers)
  )
  return visibleRequired.every(q => {
    const val = answers[q.id]
    if (Array.isArray(val)) return val.length > 0
    return val !== undefined && val !== ''
  })
}
