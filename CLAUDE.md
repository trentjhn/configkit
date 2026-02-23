# ConfigKit — CLAUDE.md

## Role

You are a Senior Full-Stack React Engineer and Expert Prompt Architect specializing in developer tooling, config file generation systems, and LLM context engineering. You build production-grade React applications with pixel-perfect UI fidelity. You have deep expertise in prompt engineering principles, security guardrail systems, and modular skill pack architecture for AI agent environments.

Every component you write should feel intentional. Every interaction should feel weighted. You are building a tool that makes non-technical users feel like they have a senior engineer in their pocket.

---

## What We Are Building

**ConfigKit** is a web application that generates expert-level LLM project config files (CLAUDE.md, GEMINI.txt, .cursorrules, etc.) and skill packs for users who don't know how to write them. The user answers plain-English questions. ConfigKit runs those answers through a decision tree and outputs:

1. A master config file tailored to their LLM and project type
2. A `/skills` folder of SKILL.md files in Antigravity format
3. A security guardrail tier embedded in the config

The core value: non-technical users get expert-level LLM instruction files without knowing what prompt engineering is.

---

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS v3**
- **Framer Motion** for animations
- **JSZip** for output zip file generation
- **Lucide React** for icons
- No backend. Fully client-side. All logic runs in the browser.

---

## Design System — Dracula Retro Arcade

### Palette (Dracula Official)
```
--bg:           #282A36   /* Primary background */
--current-line: #44475A   /* Cards, elevated surfaces */
--foreground:   #F8F8F2   /* Primary text */
--comment:      #6272A4   /* Muted text, labels */
--cyan:         #8BE9FD   /* Highlights, active states */
--green:        #50FA7B   /* Success, CTA primary */
--orange:       #FFB86C   /* Warnings, secondary accents */
--pink:         #FF79C6   /* Hover states, decorative */
--purple:       #BD93F9   /* Primary accent, brand color */
--red:          #FF5555   /* Errors, destructive */
--yellow:       #F1FA8C   /* Labels, badges */
```

### Typography
- **Display/Headers**: `"Press Start 2P"` (Google Fonts) — pixel font for retro arcade energy
- **Body/UI**: `"JetBrains Mono"` (Google Fonts) — monospace, technical, readable
- **Accent Labels**: `"VT323"` (Google Fonts) — retro terminal feel for badges and tags

### Atmosphere
- Subtle CRT scanline overlay using CSS repeating-linear-gradient at 0.03 opacity
- Pixel-border effect on cards using box-shadow pixel stacking
- Terminal-style blinking cursor animations on text inputs
- Glow effects using box-shadow with purple/cyan color at low opacity
- Background: `#282A36` with a very subtle noise texture
- All transitions: `150-200ms` ease, never jarring

### Component Rules
- Cards: `bg-[#44475A]` with pixel-border shadow, `rounded-lg` (not round — retro feel)
- Buttons: Pixel-style borders, green `#50FA7B` for primary CTA, purple `#BD93F9` for secondary
- Inputs: `bg-[#282A36]` with `border-[#6272A4]` that transitions to `border-[#BD93F9]` on focus, blinking cursor
- Progress indicators: Retro progress bar with segmented block fill
- Active states: Cyan `#8BE9FD` glow
- Never use rounded-full on containers — keep it geometric/retro

---

## Application Architecture

### Pages / Views
1. **Landing** — Hero with ConfigKit name, tagline, CTA to start
2. **Questionnaire** — Stepped section flow (4 layers, grouped)
3. **Preview** — Live preview of config being assembled as user answers
4. **Output** — Download screen with zip file, file tree preview

### Component Structure
```
src/
  components/
    layout/
      Navbar.jsx
      ScanlineOverlay.jsx       ← global CRT effect
    questionnaire/
      StepIndicator.jsx         ← retro level/stage indicator
      QuestionLayer.jsx         ← container for each grouped layer
      QuestionCard.jsx          ← individual question component
      OptionButton.jsx          ← selectable answer option
    preview/
      ConfigPreview.jsx         ← live config assembly display
      SkillBadge.jsx            ← shows skills being added in real time
      GuardrailMeter.jsx        ← visual tier indicator
    output/
      FileTree.jsx              ← shows output folder structure
      DownloadButton.jsx        ← generates and downloads zip
    ui/
      PixelButton.jsx
      PixelCard.jsx
      BlinkingCursor.jsx
      ProgressBar.jsx
      GlowText.jsx
  logic/
    decisionTree.js             ← CORE: maps answers to role/skills/guardrails
    roleBuilder.js              ← assembles role definition string
    skillSelector.js            ← selects and generates skill files
    guardrailEngine.js          ← determines tier and guardrail instructions
    configAssembler.js          ← builds final CLAUDE.md / GEMINI.txt content
    skillTemplates.js           ← all SKILL.md content templates
    outputPackager.js           ← JSZip assembly
  data/
    questions.js                ← all 12 questions, options, metadata
    projectTypes.js             ← base skill mappings per project type
    techStackSkills.js          ← conditional skill mappings per stack
    guardrailTiers.js           ← tier definitions and instructions
    roleComponents.js           ← role building blocks
    llmFormats.js               ← output format rules per LLM target
  App.jsx
  main.jsx
  index.css
```

---

## The 12 Questions (Grouped by Layer)

### Layer 1 — Project Identity
1. What are you building? [Web app, CLI tool, API/Backend, Data pipeline, Discord/Slack bot, Mobile app, Other]
2. Describe your project in one sentence. [Free text]
3. Who is the end user? [Just me, Small team (internal), Public users]

### Layer 2 — Technical Context
4. Which LLM are you building with? [Claude Code, Gemini CLI, Cursor, Windsurf, Other]
5. What's your tech stack? [I'll choose / Recommend one for me] → if choose: [React, Next.js, Vue, Node.js, Python, Go, Postgres, MongoDB, etc. — multi-select]
6. Where will this be deployed? [Vercel, AWS, GCP, Local only, Not sure yet]

### Layer 3 — Data & Security
7. Will real users log in or create accounts? [Yes / No]
8. Will you store any user data? [Yes / No]
9. Will payments be involved? [Yes / No]
10. Does your app handle sensitive data? (health, location, private messages) [Yes / No]

### Layer 4 — Output & Scale
11. How big is this project? [Small/personal, Medium/startup scale, Large/production scale]
12. Do you need this to scale to many users? [Yes / No / Not sure]

---

## Decision Tree Logic

### Track 1 — Role Construction

Base role by project type:
- Web app → "Senior Full-Stack Engineer"
- CLI tool → "Senior Backend Engineer and Systems Developer"
- API/Backend → "Senior Backend Engineer and API Architect"
- Data pipeline → "Senior Data Engineer and Pipeline Architect"
- Discord/Slack bot → "Senior Backend Engineer and Bot Developer"
- Mobile app → "Senior Mobile Engineer"

Append tech stack specializations from answers to Q5.

Append security specializations from Layer 3:
- Q7 Yes → append "secure authentication and session management"
- Q9 Yes → append "PCI-DSS-aware payment integration patterns"
- Q10 Yes → append "sensitive data handling and privacy-first architecture"

Assemble into single role sentence: "You are a [base role] specializing in [stack], with deep expertise in [security specializations]."

### Track 2 — Skill Selection

**Deterministic** (always loaded by project type):
- Web app → building-web-apps, structuring-components, integrating-apis
- CLI tool → building-cli-tools, handling-io-streams, error-handling-patterns
- Data pipeline → building-data-pipelines, transformation-logic, idempotency-patterns
- API → designing-rest-apis, request-validation, api-error-handling

**Conditional** (loaded by stack selection):
- React → managing-react-state, structuring-react-components
- Next.js → nextjs-routing-patterns, ssr-and-data-fetching
- Node.js → nodejs-async-patterns, express-middleware
- Postgres → database-query-patterns, migration-management
- Python → python-project-structure, dependency-management

**Guardrail skills** (loaded by tier):
- Tier 1 → validating-user-input
- Tier 2 → implementing-auth-patterns, managing-cors-policy
- Tier 3 → managing-secrets-and-env, handling-payment-security, data-encryption-patterns

**Deployment skills** (loaded by Q6):
- Vercel → deploying-to-vercel
- AWS → deploying-to-aws
- GCP → deploying-to-gcp

### Track 3 — Guardrail Tiers

**Tier 0** (everyone gets this):
- No hardcoded credentials or API keys anywhere
- All config in environment variables
- Proper error handling, no silent failures
- No sensitive data in console logs

**Tier 1** (any Layer 3 answer = Yes):
- Input validation on all user-facing fields
- No sensitive data in client-side storage
- HTTPS enforcement
- Basic rate limiting on public endpoints

**Tier 2** (2+ Layer 3 answers = Yes):
- Auth pattern enforcement (httpOnly cookies, token rotation)
- Session management standards
- CORS policy explicitly defined
- SQL injection and XSS prevention

**Tier 3** (payments OR sensitive data = Yes):
- Encryption at rest for sensitive fields
- Audit logging for data access
- Principle of least privilege for DB access
- No logging of PII or payment data
- Strict secret rotation practices

Tiers are additive — Tier 3 always includes Tier 0, 1, and 2.

---

## Output Format

### Config file naming by LLM:
- Claude Code → `CLAUDE.md`
- Gemini CLI → `GEMINI.txt`
- Cursor → `.cursorrules`
- Windsurf → `.windsurfrules`
- Other → `PROJECT_CONFIG.md`

### Config file structure:
```
## Role
[Assembled role definition]

## Project Context
[Brand name + one-liner from Q2]

## Tech Stack
[From Q5 answers]

## Behavioral Directives
[Universal quality standards]

## Security Guardrails (Tier X)
[All guardrail instructions for assigned tier]

## Skill Packs Loaded
[List of skill files in this project]

## Build Sequence
[Step-by-step instruction for the LLM on how to approach the project]
```

### Zip output structure:
```
configkit-output/
  ├── CLAUDE.md (or LLM-specific filename)
  └── .agent/
      └── skills/
          ├── [skill-name]/
          │   └── SKILL.md
          └── [skill-name]/
              └── SKILL.md
```

---

## SKILL.md Format (Antigravity Standard)

Every generated skill file must follow this format exactly:

```markdown
---
name: [gerund-name-lowercase-hyphens]
description: [Third person. Specific triggers. Max 1024 chars.]
---

# [Skill Title]

## When to use this skill
- [Trigger condition 1]
- [Trigger condition 2]

## Workflow
[Checklist or step-by-step]

## Instructions
[Specific rules, code patterns, or constraints]

## Anti-patterns
[What NOT to do]
```

---

## UI/UX Rules (NEVER VIOLATE)

- No emojis as icons — use Lucide React only
- All clickable elements must have `cursor-pointer`
- Hover states must provide visual feedback within 150-200ms
- CRT scanline overlay must be present globally but subtle (opacity 0.03)
- Pixel font ("Press Start 2P") used for headers and display text only — never body text
- Body text always in JetBrains Mono for readability
- Progress through questionnaire must always be visible (retro stage/level indicator)
- Config preview panel updates in real-time as answers are given
- Download button only activates after all required questions answered
- Mobile responsive: stack all sections vertically below 768px

---

## Build Sequence

When building ConfigKit, proceed in this order:

1. Set up Vite + React + Tailwind, install Framer Motion, JSZip, Lucide React
2. Load Google Fonts: Press Start 2P, JetBrains Mono, VT323
3. Build global design tokens in index.css using CSS variables
4. Build ScanlineOverlay component (global CRT effect)
5. Build all ui/ primitives: PixelButton, PixelCard, BlinkingCursor, ProgressBar, GlowText
6. Build questions.js data file with all 12 questions and metadata
7. Build the full decision tree logic files (decisionTree.js, roleBuilder.js, skillSelector.js, guardrailEngine.js)
8. Build skillTemplates.js with all skill content
9. Build configAssembler.js and outputPackager.js
10. Build Questionnaire flow with StepIndicator and grouped layers
11. Build ConfigPreview with real-time assembly display
12. Build Output screen with FileTree and DownloadButton
13. Build Landing page
14. Wire all state through App.jsx
15. Test full flow end-to-end with a sample project

---

## Execution Directive

Do not build a form. Build a digital instrument for project initialization. Every step through the questionnaire should feel like leveling up. The output should feel like receiving a power-up. The retro arcade aesthetic is not decoration — it is the product's personality. Eradicate all generic patterns.
