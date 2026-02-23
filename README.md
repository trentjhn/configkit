```
 ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗ ██╗  ██╗██╗████████╗
██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝ ██║ ██╔╝██║╚══██╔══╝
██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗█████╔╝ ██║   ██║
██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║██╔═██╗ ██║   ██║
╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝██║  ██╗██║   ██║
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝
```

<div align="center">

**▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓**

`LLM CONFIG GENERATOR` · `DRACULA THEME` · `NO ACCOUNT REQUIRED`

**▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓**

</div>

---

## `>_` WHAT IS THIS

ConfigKit generates expert-level LLM config files for developers who don't want to write them from scratch. Answer 6 plain-English questions. Get a production-ready `CLAUDE.md` (or `.cursorrules`, `GEMINI.txt`, etc.) built to your exact spec — plus a `/skills` folder of structured `SKILL.md` files ready to drop into your project.

**The output isn't a template.** It's Claude reading your project description and assembling a config with your actual stack, your actual security requirements, and your actual build sequence.

---

## `>_` STATS

```
┌─────────────────────────────────────────────────────────┐
│  QUESTIONS    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  6           │
│  SKILL PACKS  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  45          │
│  LLM TARGETS  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  4           │
│  ACCOUNT REQ  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0           │
└─────────────────────────────────────────────────────────┘
```

---

## `>_` FEATURES

**► BUILT TO SPEC**
Your project description becomes the source of truth. Role definition, behavioral directives, and build sequence are written by Claude — specific to your project, not a generic template.

**► SECURITY GUARDRAILS**
Automatically assigns a guardrail tier (0–3) based on auth, payments, and sensitive data. Tier 3 includes PCI-aware patterns, audit logging, and strict secret rotation rules.

**► SKILL PACK LIBRARY**
45 structured `SKILL.md` files in [Antigravity format](https://github.com/anthropics/anthropic-cookbook) — selected for your exact stack and bundled into a ready-to-use `/skills` folder.

---

## `>_` OUTPUT FORMAT

```
configkit-output/
  ├── CLAUDE.md               ← AI-generated config (or .cursorrules, GEMINI.txt, etc.)
  └── .agent/
      └── skills/
          ├── building-web-apps/
          │   └── SKILL.md
          ├── managing-react-state/
          │   └── SKILL.md
          └── implementing-auth-patterns/
              └── SKILL.md
```

Config structure:
```
## Role               ← AI-written, project-specific
## Project Context    ← AI-written, based on your description
## Tech Stack         ← Deterministic from your answers
## Behavioral Directives  ← AI-written, opinionated rules
## Security Guardrails    ← Tier-based, deterministic
## Skill Packs Loaded     ← Full list of included skills
## Build Sequence         ← AI-written, stack-specific steps
```

---

## `>_` TECH STACK

```
React 19    Vite 8      Tailwind CSS 3    Framer Motion 12
JSZip 3     Lucide React                 Anthropic API (Haiku)
```

Fully client-side. No backend. No database. No auth.
The only server call is to the Anthropic Messages API for config generation.

---

## `>_` GETTING STARTED

**Using ConfigKit** — no account, no setup, no API key. Just open the app and press START.

---

**Self-hosting your own instance:**

**1. Clone & install**
```bash
git clone https://github.com/trentjhn/configkit.git
cd configkit
npm install
```

**2. Add an Anthropic API key** *(operator only — not exposed to end users)*
```bash
echo "VITE_ANTHROPIC_API_KEY=sk-ant-..." > .env
```
> Get a key at [console.anthropic.com](https://console.anthropic.com). Uses `claude-haiku-4-5` — fractions of a cent per generation.

**3. Run**
```bash
npm run dev
```

---

## `>_` GUARDRAIL TIERS

```
TIER 0 — Everyone     No hardcoded keys, env vars, error handling
TIER 1 — Any yes      Input validation, HTTPS, no sensitive client storage
TIER 2 — 2+ yes       Auth patterns, CORS policy, XSS / SQLi prevention
TIER 3 — Payments/PII Encryption at rest, audit logging, PII-safe logging
```

Tiers are additive — Tier 3 includes everything from Tiers 0, 1, and 2.

---

## `>_` LLM TARGETS

| Selection | Output file |
|-----------|-------------|
| Claude Code | `CLAUDE.md` |
| Gemini CLI | `GEMINI.txt` |
| Cursor | `.cursorrules` |
| Windsurf | `.windsurfrules` |

---

## `>_` DESIGN SYSTEM

Dracula Retro Arcade — [Dracula](https://draculatheme.com/) palette, pixel fonts, CRT scanlines, terminal animations.

```
Fonts:   Press Start 2P  ·  JetBrains Mono  ·  VT323
Colors:  #282A36 bg  ·  #BD93F9 purple  ·  #50FA7B green  ·  #8BE9FD cyan
```

---

<div align="center">

`░░░░░░░░░░░░░░ INSERT COIN TO CONTINUE ░░░░░░░░░░░░░░`

</div>
