/**
 * skillTemplates.js
 *
 * SKILL.md content for every skill the selector can return.
 * Follows the Antigravity format exactly (from CLAUDE.md spec).
 *
 * Each key matches a skill name from SKILL_METADATA in skillSelector.js.
 * outputPackager.js reads these to generate .agent/skills/[name]/SKILL.md files.
 */

// ─── Template factory ─────────────────────────────────────────────────────────

function skill(name, description, title, whenToUse, workflow, instructions, antiPatterns) {
  return `---
name: ${name}
description: ${description}
---

# ${title}

## When to use this skill
${whenToUse.map(t => `- ${t}`).join('\n')}

## Workflow
${workflow}

## Instructions
${instructions}

## Anti-patterns
${antiPatterns.map(a => `- ${a}`).join('\n')}`
}

// ─── Core Skills ──────────────────────────────────────────────────────────────

const CORE = {

  'building-web-apps': skill(
    'building-web-apps',
    'Use when scaffolding, structuring, or extending a web application. Triggers when creating new pages, routes, layouts, or top-level features. Applies to any frontend or full-stack web project regardless of framework.',
    'Building Web Apps',
    [
      'Creating a new page, route, or top-level feature',
      'Scaffolding a new web project or adding a major section',
      'Deciding on folder structure or module boundaries',
    ],
    `1. Identify the entry point and routing strategy before writing any component
2. Define the data shape (types or JSDoc) before building UI
3. Build layout shell first, then fill with real components
4. Implement loading, error, and empty states for every data-dependent view
5. Verify mobile layout at 375px, 768px, and 1280px before marking complete`,
    `- Co-locate component files with their styles and tests in the same folder
- Use named exports for components, default export only for pages/routes
- Keep pages thin — extract logic into hooks or service modules
- All user-facing strings should be defined as constants, not inline literals
- Implement a global error boundary at the app root`,
    [
      'Building the happy path and skipping loading/error/empty states',
      'Putting business logic directly in page components',
      'Using index.js barrel files deeper than two levels — causes circular import issues',
      'Mixing data-fetching concerns with rendering concerns in the same component',
    ]
  ),

  'structuring-components': skill(
    'structuring-components',
    'Use when creating, refactoring, or reviewing UI components. Triggers when a component exceeds 150 lines, when logic and presentation are mixed, or when the same pattern appears in three or more places.',
    'Structuring Components',
    [
      'A component file exceeds 150 lines',
      'The same rendering pattern appears in three or more places',
      'A component mixes data-fetching, business logic, and rendering',
      'Adding a new reusable UI element',
    ],
    `1. Classify the component: pure presentational, container, or page
2. Extract all non-rendering logic into a custom hook or service
3. Define the props interface explicitly (PropTypes or TypeScript)
4. Write the component's render output first; extract sub-components for repeated sections
5. Add a brief JSDoc comment documenting the component's purpose and key props`,
    `- Presentational components receive all data via props — no direct API calls or store reads
- Container components manage state and data-fetching; pass data down to presentational children
- One component per file; filename matches the exported component name exactly
- Props that change behaviour (not just appearance) must have explicit, descriptive names
- Avoid prop drilling beyond two levels — lift state or use context/store instead`,
    [
      'God components that handle routing, data fetching, auth checks, and rendering',
      'Anonymous default exports — they break Fast Refresh and make stack traces unreadable',
      'Passing entire objects as props when only one or two fields are needed',
      'Using array index as a key in lists with add/remove/reorder behaviour',
    ]
  ),

  'integrating-apis': skill(
    'integrating-apis',
    'Use when adding a new API call, building an API client module, or integrating a third-party service. Triggers on any fetch/axios/http call, SDK initialisation, or webhook handler.',
    'Integrating APIs',
    [
      'Adding a new fetch, axios, or SDK call',
      'Building a reusable API client or service layer',
      'Handling webhook payloads from a third-party service',
      'Wrapping an external SDK for use inside the application',
    ],
    `1. Define the request and response type shapes before writing the call
2. Create a dedicated service module (e.g. src/services/payments.js) — never call APIs inline in components
3. Implement: success path, error handling, loading state, and request cancellation
4. Log errors with context (endpoint, status code) but never log request bodies containing user data
5. Add a timeout to every external HTTP call`,
    `- All API base URLs and keys come from environment variables, never hardcoded
- Use a single axios/fetch instance with interceptors for auth headers and error normalisation
- Retry idempotent requests (GET) on network failure with exponential backoff; never auto-retry POST/DELETE
- Validate API response shape before consuming it — don't trust external data structures
- Surface meaningful error messages to the user; log technical details server-side only`,
    [
      'Calling APIs directly from component render functions or event handlers without an abstraction layer',
      'Silently catching errors and returning undefined — always propagate or handle explicitly',
      'Storing raw API responses (including tokens or PII) in component state longer than needed',
      'Using floating promise calls without await or .catch()',
    ]
  ),

  'building-cli-tools': skill(
    'building-cli-tools',
    'Use when building command-line utilities, developer tools, scripts, or automation tools. Triggers on any project where the primary interface is stdin/stdout/stderr rather than a browser or HTTP client.',
    'Building CLI Tools',
    [
      'Starting a new CLI tool or adding a command to an existing one',
      'Designing the command surface: commands, flags, and arguments',
      'Implementing stdin/stdout interaction or shell scripting behaviour',
    ],
    `1. Define the command surface (commands, flags, arguments) before writing any logic
2. Use a CLI framework (commander, yargs, or stdlib flags) — never parse process.argv manually
3. Separate the CLI layer (arg parsing, output formatting) from the core logic (pure functions)
4. Implement --help for every command and --version at the root
5. Return non-zero exit codes on failure — scripts and CI pipelines depend on this`,
    `- Write core logic as pure, testable functions with no process.exit() or console.log inside them
- All user-visible output goes through a single output module — enables --quiet and --json flags
- Support --json flag for machine-readable output on any command that produces structured data
- Validate all required arguments upfront and print a clear error before doing any work
- Handle SIGINT and SIGTERM gracefully; clean up temp files and open handles`,
    [
      'Calling process.exit() deep inside business logic — it makes the code untestable',
      'Writing to stdout for errors — errors go to stderr so they can be separated from output',
      'Hardcoding file paths — use path.resolve() and respect the working directory',
      'Mixing output formatting logic with business logic',
    ]
  ),

  'handling-io-streams': skill(
    'handling-io-streams',
    'Use when reading or writing files, piping data between processes, handling stdin/stdout streams, or processing large datasets that should not be loaded entirely into memory.',
    'Handling IO Streams',
    [
      'Reading or writing files larger than a few MB',
      'Piping data between processes or network connections',
      'Processing a file line by line or record by record',
      'Implementing a command that reads from stdin or writes to stdout',
    ],
    `1. Identify whether the data can fit in memory — if >10MB, use streams
2. Use pipeline() (Node.js stream.pipeline or equivalent) for error propagation
3. Implement backpressure handling — pause the readable when the writable is full
4. Always close streams in a finally block; use pipeline() which handles this automatically
5. Emit progress events on long-running stream operations`,
    `- Prefer stream.pipeline() over manual pipe() — it handles errors and cleanup automatically
- Set highWaterMark explicitly for performance-sensitive streams
- Transform streams should be stateless where possible for easier testing
- Handle the 'error' event on every stream — unhandled stream errors crash the process
- Use readline.createInterface() for line-by-line text processing`,
    [
      'Loading entire large files into a Buffer before processing',
      'Using pipe() without handling errors — it does not propagate errors by default',
      'Forgetting to call stream.destroy() on error paths',
      'Creating new stream instances inside hot loops',
    ]
  ),

  'error-handling-patterns': skill(
    'error-handling-patterns',
    'Use when implementing try/catch blocks, error boundaries, error middleware, or any code path that can fail. Triggers when writing async functions, third-party integrations, file operations, or any I/O boundary.',
    'Error Handling Patterns',
    [
      'Writing any async function that calls external services or performs I/O',
      'Implementing API middleware or route handlers',
      'Adding a try/catch block',
      'Handling promise rejections',
    ],
    `1. Decide on the error strategy: throw, return Result type, or callback
2. Define custom error classes for distinct failure modes (NetworkError, ValidationError, etc.)
3. Catch errors at the appropriate boundary — not too deep, not too shallow
4. Log errors with full context: operation name, input shape, error message, stack trace
5. Map internal errors to user-facing messages at the outermost boundary only`,
    `- Use custom error classes that extend Error and carry a machine-readable code property
- Never catch an error just to re-throw the same error — add context or don't catch it
- Distinguish between operational errors (expected, handle gracefully) and programmer errors (let crash)
- Always include the original error as a cause: new AppError('message', { cause: originalError })
- Set up a global unhandledRejection handler to catch missed promise errors`,
    [
      'Empty catch blocks: catch(err) {} — swallowed errors are invisible bugs',
      'Catching Error and discarding the stack trace',
      'Using error message strings for control flow — use error.code or instanceof',
      'Throwing strings instead of Error objects — strings have no stack trace',
      'Logging sensitive data (passwords, tokens) as part of error context',
    ]
  ),

  'designing-rest-apis': skill(
    'designing-rest-apis',
    'Use when designing or extending REST API endpoints. Triggers when adding new routes, designing resource schemas, implementing HTTP methods, or establishing API conventions for a project.',
    'Designing REST APIs',
    [
      'Adding a new resource or endpoint group',
      'Deciding on HTTP methods, status codes, or URL structure',
      'Establishing API conventions at the start of a project',
    ],
    `1. Define the resource model and URL hierarchy before writing any handlers
2. Map operations to HTTP verbs correctly: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
3. Design the request/response schema; version the API in the URL (/v1/) from day one
4. Implement consistent error response shape across all endpoints
5. Document each endpoint with expected status codes before implementation`,
    `- Use nouns for resource URLs, not verbs: /orders not /createOrder
- Return 201 Created with a Location header for POST operations that create a resource
- Use 422 Unprocessable Entity for validation errors; include field-level error details
- Paginate all list endpoints from the start — retrofitting pagination is painful
- Use ISO 8601 for all date/time fields`,
    [
      'Returning 200 OK with an error body — use the correct 4xx/5xx status codes',
      'Designing deep nesting beyond /resource/:id/sub-resource',
      'Using GET requests for operations that have side effects',
      'Returning different response shapes for success and error on the same endpoint',
    ]
  ),

  'request-validation': skill(
    'request-validation',
    'Use when implementing input validation for API endpoints, form submissions, or any user-supplied data. Triggers before any data is processed, stored, or used in business logic.',
    'Request Validation',
    [
      'Before processing any user-supplied input in an API handler',
      'Adding a new form field or API parameter',
      'Implementing a public-facing endpoint',
    ],
    `1. Define the schema for the expected input shape (Zod, Joi, yup, or JSON Schema)
2. Validate at the route boundary before the handler executes any logic
3. Return a structured 422 error with field-level messages on failure
4. Sanitise as well as validate: trim whitespace, normalise case where appropriate
5. Validate query parameters, path parameters, headers, and body separately`,
    `- Validate the shape AND the semantics: an email field must match the email regex, not just be a string
- Never trust client-supplied IDs to exist in the database — always verify ownership
- Reject unknown fields by default (strict mode) to prevent mass-assignment vulnerabilities
- Validate file uploads: MIME type, size limit, and filename sanitisation
- Run validation in middleware/decorators, not inside business logic functions`,
    [
      'Validating only the happy path and assuming optional fields are safely absent',
      'Using typeof checks instead of a validation library',
      'Returning raw validation errors from the library directly — map them to a consistent format',
      'Skipping validation on "internal" endpoints — internal does not mean safe',
    ]
  ),

  'api-error-handling': skill(
    'api-error-handling',
    'Use when implementing error handling for API routes. Triggers when writing route handlers, error middleware, or setting up the error response format for a web service.',
    'API Error Handling',
    [
      'Setting up a new Express/Fastify/Hono application',
      'Writing route handlers that can fail',
      'Implementing a global error handler',
    ],
    `1. Define a standard error response envelope: { error: { code, message, details? } }
2. Build a central error-handling middleware registered after all routes
3. Map custom error types to HTTP status codes in one place
4. Log the full error server-side; send only safe, non-leaking messages to the client
5. Handle async route errors — wrap handlers or use an async wrapper utility`,
    `- Use a single error shape across the entire API — clients should parse one format
- Never expose stack traces, internal paths, or database error messages to clients
- Distinguish client errors (4xx) from server errors (5xx) — never conflate them
- Include a request ID in every error response for traceability
- Return 503 with a Retry-After header for rate limiting and temporary unavailability`,
    [
      'Letting unhandled promise rejections silently fail in route handlers',
      'Using a generic 500 error for validation failures',
      'Sending different error shapes from different parts of the codebase',
      'Logging the full error object including user input — it may contain PII',
    ]
  ),

  'building-data-pipelines': skill(
    'building-data-pipelines',
    'Use when designing or implementing ETL processes, batch jobs, data transformation workflows, or streaming pipelines. Triggers on any task that moves, transforms, or aggregates data at scale.',
    'Building Data Pipelines',
    [
      'Designing an ETL or ELT workflow',
      'Building a batch job or scheduled task that processes records',
      'Implementing a data ingestion or export pipeline',
    ],
    `1. Define the source schema, target schema, and transformation rules before writing code
2. Implement idempotency first — running the pipeline twice should produce the same result
3. Build the pipeline as composable, single-responsibility stages
4. Add metrics: records processed, records failed, duration, and bytes transferred
5. Test with a small representative dataset before running against production data`,
    `- Each pipeline stage should be a pure function: input data in, transformed data out
- Use checkpoints so a failed pipeline can resume rather than restart from the beginning
- Never mutate the source data — write to a separate target or staging area
- Log record-level errors (with the offending record ID) without stopping the whole pipeline
- Schema changes in the source should be detected and halt the pipeline with a clear error`,
    [
      'Processing all records in a single transaction — use batched transactions with commit points',
      'Ignoring records that fail validation — log and quarantine them for review',
      'Hardcoding source/target connection strings instead of environment variables',
      'Building monolithic pipelines that cannot be tested stage by stage',
    ]
  ),

  'transformation-logic': skill(
    'transformation-logic',
    'Use when implementing data transformation, mapping, or normalisation logic. Triggers when converting between data formats, reshaping objects, or applying business rules to raw data.',
    'Transformation Logic',
    [
      'Converting between two data formats or schemas',
      'Applying business rules to raw input data',
      'Normalising or denormalising database records for API responses',
    ],
    `1. Write the transformation as a pure function with no side effects
2. Define the input and output types explicitly before writing the mapping
3. Handle null, undefined, and missing fields explicitly — don't assume completeness
4. Write unit tests with representative input/output pairs before the implementation
5. Use a declarative mapping object where possible, not imperative if/else chains`,
    `- Transformation functions must be pure — same input always produces same output
- Validate input shape at the entry point of the transformation, not inside it
- Keep transformations composable: small functions that can be piped together
- Document the business rules embedded in non-obvious transformations
- Use structured cloning or immutable patterns — never mutate the input object`,
    [
      'Transformations that read from or write to the database',
      'Using Object.assign() on the input argument — always work on a copy',
      'Burying complex business logic inside field mappers',
      'Returning partially-transformed objects when a field is missing',
    ]
  ),

  'idempotency-patterns': skill(
    'idempotency-patterns',
    'Use when implementing operations that must be safe to retry or replay — including API mutations, payment flows, message queue consumers, webhook handlers, and database writes that should not create duplicates.',
    'Idempotency Patterns',
    [
      'Implementing a payment, order, or financial transaction endpoint',
      'Building a message queue consumer or webhook handler',
      'Designing any operation that will be retried on failure',
    ],
    `1. Identify which operations are inherently idempotent (GET, DELETE) and which need explicit support (POST, mutations)
2. Generate a client-supplied or server-generated idempotency key for every non-idempotent operation
3. Store the idempotency key and result in a durable store; return the stored result on duplicate requests
4. Set a TTL on idempotency keys appropriate to the retry window (24h is a common default)
5. Test by sending the same request twice and asserting the result is identical`,
    `- Use a unique idempotency key per logical operation, not per HTTP request
- The idempotency store must be checked in the same transaction as the business operation
- Return the original response for duplicate requests — do not process the operation again
- Idempotency keys should be unpredictable (UUID v4) — never sequential integers
- Log when a duplicate request is detected for debugging and auditing`,
    [
      'Generating idempotency keys server-side without exposing them to the client',
      'Using composite natural keys instead of dedicated idempotency keys',
      'Skipping idempotency for "simple" operations — duplicates in payment systems are catastrophic',
      'Expiring idempotency keys too quickly relative to the client retry window',
    ]
  ),

}

// ─── Stack Skills ─────────────────────────────────────────────────────────────

const STACK = {

  'managing-react-state': skill(
    'managing-react-state',
    'Use when deciding how to manage state in a React application, adding a new state concern, or when component state has become complex, deeply nested, or shared across multiple unrelated components.',
    'Managing React State',
    [
      'Adding a new piece of shared or complex state',
      'Component prop drilling has exceeded two levels',
      'State needs to persist across navigation or component unmounts',
      'Multiple unrelated components need to read the same state',
    ],
    `1. Classify the state: local UI state → useState, shared UI state → Context, server state → React Query/SWR, global app state → Zustand/Redux
2. Start with the simplest option (useState) and only escalate when needed
3. Colocate state as close to where it is used as possible
4. Derive computed values with useMemo rather than storing them in state
5. Separate server state (loading/error/data from API) from UI state (is modal open?)`,
    `- Never store derived data in state — compute it from existing state on every render
- Use useReducer when state has multiple sub-values that change together
- Avoid useEffect for state transformations — derive values during render instead
- Keep global store slices small and focused; avoid a monolithic store object
- Initialise state lazily (useState(() => computeExpensiveInitialValue())) for expensive defaults`,
    [
      'Storing server response data directly in useState without normalisation',
      'Using Context for high-frequency updates — it re-renders all consumers',
      'Mutating state directly instead of using the setter function',
      'Lifting state to the app root when it is only needed by one subtree',
    ]
  ),

  'structuring-react-components': skill(
    'structuring-react-components',
    'Use when creating new React components, refactoring existing ones, or establishing component conventions for a React project. Applies to both client-side React and React Server Components.',
    'Structuring React Components',
    [
      'Creating a new reusable component',
      'A component exceeds 100 lines or handles more than one concern',
      'Establishing folder conventions for a new React project',
    ],
    `1. Choose the component type: Server Component (default), Client Component ('use client'), or hybrid
2. Co-locate the component file, styles, tests, and stories in one folder
3. Define the props type/interface at the top of the file
4. Extract custom hooks for all non-trivial logic
5. Export a named constant, not an arrow function — better debugging and Fast Refresh`,
    `- Prefer composition over configuration — accept children and slots instead of many boolean props
- Use the forwardRef pattern for components that wrap native elements
- Memoize with React.memo only when profiling confirms a performance problem
- Keep components pure — same props always produce the same output
- Use descriptive prop names that read like English: isLoading, onConfirm, hasError`,
    [
      "Writing 'use client' at the component level when it only needs to be on one child",
      'Putting useEffect calls at the bottom of a 200-line component file',
      'Mixing Server and Client Component logic in the same file',
      'Overusing React.memo and useMemo before profiling — premature optimisation',
    ]
  ),

  'nextjs-routing-patterns': skill(
    'nextjs-routing-patterns',
    'Use when adding pages, routes, dynamic segments, route groups, or middleware to a Next.js application using the App Router. Triggers on any file created in the app/ directory.',
    'Next.js Routing Patterns',
    [
      'Adding a new page or route segment to a Next.js App Router project',
      'Implementing dynamic routes, catch-all segments, or parallel routes',
      'Setting up route-level layouts, loading states, or error boundaries',
    ],
    `1. Use route groups (folder) to organise routes without affecting the URL
2. Define layout.jsx at each segment level for persistent UI; use template.jsx when remounting is needed
3. Implement loading.jsx and error.jsx siblings for every data-fetching page
4. Use generateStaticParams() for static generation of dynamic routes
5. Place API handlers in route.js files, not in separate pages`,
    `- Fetch data in Server Components by default; only opt into Client Components for interactivity
- Use the Next.js cache() function to deduplicate fetch calls across the component tree
- Set explicit revalidate values on fetch() calls — don't rely on the default
- Use next/link for all internal navigation — never a raw <a> tag
- Parallel routes (@ folders) are the correct pattern for modals and split-screen layouts`,
    [
      'Creating a pages/ directory alongside app/ — pick one router and commit to it',
      'Using client-side fetch in a component that could be a Server Component',
      'Nesting layouts more than three levels deep without deliberate intent',
      'Using router.push() for form submissions — use Server Actions instead',
    ]
  ),

  'ssr-and-data-fetching': skill(
    'ssr-and-data-fetching',
    'Use when implementing server-side rendering, static generation, incremental static regeneration, or deciding the data fetching strategy for a Next.js or similar SSR framework.',
    'SSR & Data Fetching',
    [
      'Deciding between SSR, SSG, ISR, or client-side fetching for a page',
      'Fetching data in a Server Component',
      'Implementing revalidation or cache invalidation for static pages',
    ],
    `1. Default to static (SSG) and add dynamism only when required
2. Fetch data at the page (Server Component) level, pass down as props
3. Use Suspense boundaries to stream partial UI while data loads
4. Implement revalidatePath() or revalidateTag() for on-demand ISR
5. Cache aggressively at the CDN edge; bust caches explicitly on mutation`,
    `- Use fetch() with cache: 'force-cache' for static data, next: { revalidate: N } for ISR
- Use cache: 'no-store' only for genuinely real-time data
- Parallel-fetch independent data with Promise.all() — don't await sequentially
- Place sensitive data fetching in Server Components — never expose API keys to the browser
- Use React's cache() for request-level deduplication across the component tree`,
    [
      'Fetching the same data in multiple components without deduplication',
      'Using getServerSideProps patterns in the App Router',
      'Over-using no-store when ISR with a short revalidate window would suffice',
      'Waterfall fetching: awaiting one fetch before starting the next independent one',
    ]
  ),

  'managing-vue-state': skill(
    'managing-vue-state',
    'Use when managing state in a Vue 3 application using the Composition API. Triggers when adding shared state, reactive stores, or complex component state that outgrows a single component.',
    'Managing Vue State',
    [
      'Adding state shared between multiple components',
      'Composable logic needs to be extracted from a component',
      'Application state persists across route changes',
    ],
    `1. Use ref() for primitives, reactive() for objects
2. Extract shared state into composables (useXxx functions)
3. Use Pinia for global application state; avoid Vuex in new Vue 3 projects
4. Use computed() for derived values — never store computed data as separate state
5. Use watchEffect() to react to state changes; clean up with onUnmounted()`,
    `- Define Pinia stores with the Composition API style (defineStore with setup function)
- Keep composables in a composables/ folder; name them with use prefix
- Never mutate props — use emit or provide/inject for bidirectional communication
- Use shallowRef() for large data structures that don't need deep reactivity`,
    [
      'Using reactive() for primitive values — use ref() instead',
      'Mutating store state directly outside of actions',
      'Sharing state via a mutable module-level variable instead of a composable',
    ]
  ),

  'structuring-vue-components': skill(
    'structuring-vue-components',
    'Use when creating or refactoring Vue 3 Single File Components. Applies when a component exceeds 150 lines, mixes concerns, or when establishing component conventions.',
    'Structuring Vue Components',
    [
      'Creating a new Vue SFC',
      'A component mixes UI logic, business logic, and template rendering',
    ],
    `1. Use <script setup> syntax for all new components
2. Define props and emits with TypeScript or defineProps/defineEmits
3. Extract logic into composables; keep <script setup> under 50 lines
4. Use scoped styles; apply design tokens as CSS variables`,
    `- One component per .vue file; filename matches the component name in PascalCase
- Use v-bind="$attrs" to pass through attributes to the root element for wrapper components
- Prefer defineModel() for two-way bindings over manual v-model prop + emit patterns`,
    [
      'Using Options API in new components — Composition API is the Vue 3 standard',
      'Inline event handlers with complex logic in the template',
      'Non-scoped styles that leak into child components',
    ]
  ),

  'svelte-component-patterns': skill(
    'svelte-component-patterns',
    'Use when building Svelte components or SvelteKit routes. Triggers when creating stores, handling reactivity, implementing load functions, or structuring a Svelte project.',
    'Svelte Component Patterns',
    [
      'Creating a new Svelte component or SvelteKit route',
      'Managing shared state with Svelte stores',
      'Implementing SvelteKit load functions',
    ],
    `1. Use $state rune for reactive local state (Svelte 5) or let declarations (Svelte 4)
2. Use writable/readable stores for shared state; name store files with .store.js suffix
3. Implement load() in +page.server.js for server-side data fetching
4. Use +layout.svelte for shared UI; +error.svelte for error pages`,
    `- Prefer derived stores over manual subscription-based derivation
- Use the $ prefix to auto-subscribe to stores in templates
- Actions (use: directive) for DOM-level integrations instead of lifecycle hooks`,
    [
      'Putting business logic directly in .svelte files — extract into .js modules',
      'Using onMount for data fetching that belongs in load()',
    ]
  ),

  'nodejs-async-patterns': skill(
    'nodejs-async-patterns',
    'Use when writing async Node.js code, implementing event loop-aware patterns, managing concurrency, or handling callbacks, promises, and async/await in a Node.js service.',
    'Node.js Async Patterns',
    [
      'Writing async functions in a Node.js service',
      'Managing concurrent async operations',
      'Converting callback-based APIs to promises',
      'Implementing a queue or worker pool',
    ],
    `1. Use async/await throughout — never mix callback and promise styles
2. Use Promise.all() for parallel independent operations; Promise.allSettled() when partial failure is acceptable
3. Wrap callback-based APIs with util.promisify() or a manual Promise wrapper
4. Use a queue (Bull, BullMQ, p-queue) for CPU-bound or rate-limited work
5. Set timeouts on all external calls using Promise.race() or AbortController`,
    `- Never block the event loop — offload CPU-intensive work to worker_threads
- Use async iterators (for await...of) for streaming data consumption
- Handle unhandledRejection at the process level as a safety net
- Use AbortController to cancel in-flight requests on timeout or user cancellation`,
    [
      'Mixing await inside a forEach — use for...of or Promise.all(arr.map()) instead',
      'Fire-and-forget async calls without any error handling',
      'Creating thousands of parallel Promises without a concurrency limit',
      'Using setTimeout(fn, 0) to "fix" ordering issues — it masks real bugs',
    ]
  ),

  'express-middleware': skill(
    'express-middleware',
    'Use when building or extending an Express.js application. Triggers when adding middleware, route handlers, error handling, or structuring an Express router.',
    'Express Middleware',
    [
      'Adding a new middleware to an Express application',
      'Structuring routes and controllers for a new feature',
      'Implementing authentication or validation middleware',
    ],
    `1. Order middleware deliberately: security → logging → auth → validation → routes → error handler
2. Extract route logic into controller functions; keep route files as thin routers
3. Use express.Router() to namespace route groups
4. Register a global error-handling middleware (four-argument: err, req, res, next) as the last middleware
5. Wrap async route handlers to propagate promise rejections to the error handler`,
    `- Security middleware (helmet, cors, rate-limiter) must be registered before routes
- Never call next() after sending a response — it causes "headers already sent" errors
- Use req.app.locals for application-wide shared state, not module-level globals
- Validate and sanitise req.body, req.params, and req.query in middleware, not in controllers`,
    [
      'Putting business logic inside route handlers',
      'Calling next(err) with a non-Error value',
      'Registering the error handler before routes',
      'Blocking the event loop with synchronous operations inside middleware',
    ]
  ),

  'python-project-structure': skill(
    'python-project-structure',
    'Use when scaffolding or structuring a Python project. Triggers when creating a new Python package, setting up a project layout, or organising modules for a CLI tool, API, or data project.',
    'Python Project Structure',
    [
      'Starting a new Python project',
      'Reorganising a growing Python codebase',
      'Setting up packaging, entry points, or module boundaries',
    ],
    `1. Use src/ layout: src/package_name/ with an __init__.py
2. Define pyproject.toml as the single project configuration file
3. Use a virtual environment (venv or poetry) and commit requirements.txt or poetry.lock
4. Separate concerns: api/, services/, models/, utils/ sub-packages
5. Place all configuration in a settings module backed by environment variables`,
    `- Use __all__ in __init__.py to define the public API of each package
- Group imports: stdlib → third-party → local, separated by blank lines (PEP 8)
- Use dataclasses or Pydantic models for structured data — never plain dicts for domain objects
- Entry points should call a main() function; guard with if __name__ == '__main__':`,
    [
      'Putting all code in a single module or at the project root level',
      'Importing from sibling files using relative paths that break when called from different cwd',
      'Committing .pyc files or the virtual environment directory',
    ]
  ),

  'dependency-management': skill(
    'dependency-management',
    'Use when managing Python, Node.js, or other language dependencies. Triggers when adding packages, pinning versions, setting up lockfiles, or auditing for security vulnerabilities.',
    'Dependency Management',
    [
      'Adding or updating a package dependency',
      'Setting up a new project lockfile',
      'Auditing dependencies for security vulnerabilities',
    ],
    `1. Pin exact versions in production lockfiles; use range specifiers in library manifests
2. Separate runtime and development dependencies explicitly
3. Run a security audit (npm audit, pip-audit) before every release
4. Review the license of every new direct dependency
5. Prefer well-maintained packages with a high download count and recent release history`,
    `- Commit the lockfile (package-lock.json, poetry.lock, Pipfile.lock) to source control
- Never run npm install --save-dev for packages needed at runtime
- Use npm ci in CI/CD pipelines — it installs from the lockfile exactly
- Regularly update dependencies; don't let them drift years behind`,
    [
      'Using * or latest as a version constraint in production',
      'Installing packages globally on the host machine as a project dependency',
      'Committing node_modules or .venv directories to source control',
    ]
  ),

  'go-project-structure': skill(
    'go-project-structure',
    'Use when structuring a Go project, defining package boundaries, or setting up a new Go module. Triggers at the start of a Go project or when a codebase needs reorganisation.',
    'Go Project Structure',
    [
      'Starting a new Go module or service',
      'Deciding on package boundaries and naming',
    ],
    `1. Use go mod init to create the module; name it with the import path (e.g. github.com/org/repo)
2. Use cmd/ for main packages (binaries), internal/ for unexported packages, pkg/ for exported libraries
3. Keep packages small and focused on one concern
4. Avoid package-level global variables — pass dependencies explicitly`,
    `- Package names should be lowercase, single words: user, store, handler — never userService
- Use internal/ to prevent external packages from importing internal implementation details
- Keep main() minimal — it wires dependencies and calls a Start() or Run() function`,
    [
      'Circular imports between packages',
      'Putting all code in a single package (main or package foo)',
      'Naming packages with _test suffix except for test files',
    ]
  ),

  'go-concurrency-patterns': skill(
    'go-concurrency-patterns',
    'Use when implementing goroutines, channels, mutexes, or concurrent data structures in Go. Triggers when adding any goroutine or when a race condition or deadlock is suspected.',
    'Go Concurrency Patterns',
    [
      'Launching goroutines for concurrent work',
      'Sharing data between goroutines',
      'Implementing a worker pool or pipeline',
    ],
    `1. Use a sync.WaitGroup to track goroutine completion
2. Pass context.Context to every goroutine for cancellation
3. Use channels for communication; use mutexes only for protecting state
4. Always check whether a goroutine leaks — profile with pprof
5. Run tests with -race flag to detect data races`,
    `- Goroutines that can panic must recover() and log the panic before exiting
- Use buffered channels to decouple producer and consumer speeds
- Prefer the done channel pattern (select { case <-ctx.Done(): }) over sleep loops
- Close channels from the sender, never the receiver`,
    [
      'Launching goroutines in a loop without a WaitGroup',
      'Sharing maps or slices across goroutines without synchronisation',
      'Using global variables as communication channels between goroutines',
    ]
  ),

  'java-project-structure': skill(
    'java-project-structure',
    'Use when structuring a Java project with Maven or Gradle. Triggers when setting up a new service, defining package hierarchies, or adding modules to an existing project.',
    'Java Project Structure',
    [
      'Starting a new Java service or module',
      'Organising packages for a growing codebase',
    ],
    `1. Follow standard Maven/Gradle directory layout: src/main/java, src/test/java
2. Use reverse-domain package naming: com.company.project.module
3. Separate layers: controller, service, repository, model
4. Use a parent POM or Gradle convention plugin for shared build configuration`,
    `- One top-level package per bounded context; avoid cross-context imports
- Place configuration classes in a config/ sub-package
- Use dependency injection (Spring @Component, @Service) — avoid new for services`,
    [
      'Static utility classes with business logic — prefer instance methods with injected dependencies',
      'Mixing domain model classes with JPA entity annotations and API DTOs in the same class',
    ]
  ),

  'spring-patterns': skill(
    'spring-patterns',
    'Use when building Spring Boot applications. Triggers when adding endpoints, services, repositories, or configuration to a Spring Boot project.',
    'Spring Boot Patterns',
    [
      'Adding a new REST controller or service layer',
      'Configuring beans, security, or data sources',
    ],
    `1. Use @RestController for API endpoints; @Service for business logic; @Repository for data access
2. Use constructor injection — never field injection (@Autowired on fields)
3. Externalise all configuration to application.yml; use @ConfigurationProperties for typed config
4. Use Spring Data repositories and Specifications; avoid native SQL unless absolutely necessary`,
    `- Keep controllers thin — delegate to @Service methods immediately
- Use @Transactional at the service layer, not the controller
- Profile with spring.profiles.active for environment-specific beans`,
    [
      'Circular bean dependencies',
      'Returning JPA entity objects directly from controller endpoints — use DTOs',
      'Using @Autowired field injection — it makes unit testing without a Spring context impossible',
    ]
  ),

  'database-query-patterns': skill(
    'database-query-patterns',
    'Use when writing SQL queries, building query builders, implementing repositories, or optimising database access patterns. Applies to PostgreSQL, MySQL, and any relational database.',
    'Database Query Patterns',
    [
      'Writing a new query or repository method',
      'Optimising a slow query',
      'Adding indexes or query hints',
    ],
    `1. Write the query in plain SQL first; add an ORM layer only if it fits cleanly
2. EXPLAIN ANALYZE every query that touches more than 1000 rows
3. Use parameterised queries or ORM query builders — never string concatenation
4. Add an index for every column used in WHERE, JOIN, and ORDER BY clauses
5. Use RETURNING or OUTPUT clauses instead of a follow-up SELECT after INSERT/UPDATE`,
    `- Select only the columns you need — never SELECT * in application code
- Use pagination (LIMIT/OFFSET or cursor-based) for all list queries
- Use transactions for any operation that requires multiple consistent writes
- Batch inserts/updates rather than looping with single-row operations`,
    [
      'N+1 query patterns — always eager-load associations that will be accessed',
      'Full-table scans in production queries — add indexes proactively',
      'Storing business logic in stored procedures that are not version-controlled',
      'Using SELECT FOR UPDATE without a timeout — it can cause deadlocks',
    ]
  ),

  'migration-management': skill(
    'migration-management',
    'Use when creating, reviewing, or running database schema migrations. Triggers when adding tables, columns, indexes, or constraints, or when changing existing schema.',
    'Migration Management',
    [
      'Adding or modifying a database table, column, or index',
      'Setting up a migration tool for a new project',
      'Planning a zero-downtime schema change',
    ],
    `1. Use a migration tool (Flyway, Liquibase, Alembic, node-pg-migrate) — never apply DDL manually
2. Write migrations as forward-only; write a separate rollback migration if needed
3. Test the migration against a copy of production data before deploying
4. For large table changes, use multi-step zero-downtime migrations (add column → backfill → add constraint)
5. Never modify an already-applied migration — create a new one`,
    `- Migration filenames must include a timestamp or sequential number to enforce order
- Migrations that add NOT NULL columns need a DEFAULT or a multi-step approach
- Include both the DDL change and any required data backfill in the same migration
- Lock production deployments during migration runs; use --lock-timeout in Postgres`,
    [
      'Running raw DDL commands directly against a production database',
      'Modifying a committed migration file',
      'Adding a NOT NULL column without a default to a table with existing rows',
      'Running migrations inside the application boot sequence without a health check',
    ]
  ),

  'mongodb-schema-patterns': skill(
    'mongodb-schema-patterns',
    'Use when designing MongoDB collections, embedding vs referencing data, or writing Mongoose schemas. Triggers when modelling domain entities for a MongoDB-backed application.',
    'MongoDB Schema Patterns',
    [
      'Designing a new collection or document schema',
      'Deciding between embedding and referencing related data',
    ],
    `1. Model for your query patterns — embed data that is always fetched together
2. Reference data that is queried independently or that changes frequently
3. Add indexes on every field used in find(), sort(), or $lookup
4. Use schema validation (JSON Schema) to enforce data integrity at the database level`,
    `- Use ObjectId references, not string IDs, for cross-collection references
- Limit embedded array sizes — large arrays trigger the 16MB document limit
- Use updateOne with $set/$push instead of replacing entire documents`,
    [
      'Designing a fully normalised relational schema in MongoDB',
      'Unbounded arrays that grow indefinitely inside a document',
      'Missing indexes on query fields — MongoDB will do collection scans',
    ]
  ),

  'aggregation-pipeline': skill(
    'aggregation-pipeline',
    'Use when writing MongoDB aggregation pipelines. Triggers when computing aggregations, joining collections with $lookup, or transforming data in MongoDB queries.',
    'Aggregation Pipeline',
    [
      'Computing aggregated metrics from a MongoDB collection',
      'Joining data across collections with $lookup',
      'Transforming or reshaping documents in a query',
    ],
    `1. Start with $match as early as possible to reduce the working set
2. Place $project to reduce document size before expensive stages
3. Use $lookup sparingly — it is costly; consider denormalisation for hot paths
4. Explain the pipeline with .explain('executionStats') before running in production`,
    `- $match at the start of the pipeline can use indexes; after $unwind it cannot
- Use $addFields rather than $project when you want to add fields without removing others
- Break complex pipelines into stages with named intermediate results for readability`,
    [
      'Running aggregations without a $match stage — they will scan the entire collection',
      '$lookup on unindexed fields',
      'Using $where or $function for transformations — they execute JavaScript, bypassing indexes',
    ]
  ),

  'redis-caching-patterns': skill(
    'redis-caching-patterns',
    'Use when implementing Redis caching, session storage, rate limiting, or pub/sub. Triggers whenever Redis is added as a dependency or when performance requires a caching layer.',
    'Redis Caching Patterns',
    [
      'Adding a caching layer to an API endpoint',
      'Implementing session storage or distributed locking',
      'Building a rate limiter or leaderboard',
    ],
    `1. Define the cache key structure upfront: resource:id:field
2. Set an explicit TTL on every key — never store without expiry unless intentional
3. Implement cache-aside pattern: read cache → on miss, read DB → write cache → return
4. Use MULTI/EXEC transactions for atomic multi-key operations
5. Monitor hit/miss ratio — a low hit rate means keys expire too fast or are too granular`,
    `- Namespace all keys with a prefix to avoid collisions in shared Redis instances
- Use SET NX (SET with NX flag) for distributed locks with an expiry
- Never store sensitive data (tokens, passwords) in Redis without encryption
- Use pipelines to batch multiple commands and reduce round-trip latency`,
    [
      'Missing TTLs — Redis will run out of memory and start evicting unpredictably',
      'Storing large objects (>100KB) in Redis — it strains memory and serialisation',
      'Using KEYS * in production — it blocks Redis for the entire scan duration',
      'Storing session data without a maximum session TTL',
    ]
  ),

  'prisma-schema-patterns': skill(
    'prisma-schema-patterns',
    'Use when working with Prisma ORM — defining schemas, writing queries, managing migrations, or optimising Prisma Client usage.',
    'Prisma Schema Patterns',
    [
      'Defining or modifying a Prisma schema model',
      'Writing Prisma Client queries',
      'Running or creating Prisma migrations',
    ],
    `1. Define all models in schema.prisma with explicit @id, @unique, and @index
2. Use prisma migrate dev in development; prisma migrate deploy in production
3. Use Prisma Client in a singleton module — avoid instantiating in every file
4. Use select or include explicitly — never rely on Prisma's default field inclusion`,
    `- Add @index for all fields used in where clauses with high cardinality
- Use $transaction for operations that must succeed or fail together
- Seed data with prisma/seed.ts run via prisma db seed`,
    [
      'Calling new PrismaClient() in every module — use a shared singleton',
      'Using findMany without a take limit — unbounded queries can return millions of rows',
      'Ignoring Prisma migration history — never run raw DDL alongside Prisma migrations',
    ]
  ),

  'supabase-patterns': skill(
    'supabase-patterns',
    'Use when building with Supabase — including auth, realtime, storage, Edge Functions, and the Supabase client. Triggers when initialising Supabase or adding any Supabase-backed feature.',
    'Supabase Patterns',
    [
      'Setting up Supabase auth in a frontend application',
      'Querying Supabase from a client or server component',
      'Implementing Row Level Security policies',
    ],
    `1. Enable Row Level Security on every table — disable it only with explicit justification
2. Write RLS policies for SELECT, INSERT, UPDATE, and DELETE separately
3. Use the server-side Supabase client for data fetching in Server Components
4. Store SUPABASE_URL and SUPABASE_ANON_KEY in environment variables`,
    `- Use service role key only in trusted server environments, never in the browser
- Test RLS policies with test users who have limited permissions before shipping
- Use supabase.auth.getSession() server-side to validate JWT tokens`,
    [
      'Disabling RLS and relying solely on client-side filtering for access control',
      'Using the service role key in a browser or mobile client',
      'Bypassing RLS with security definer functions without careful review',
    ]
  ),

  'containerisation-patterns': skill(
    'containerisation-patterns',
    'Use when writing Dockerfiles, composing multi-container applications, or setting up container-based deployment. Triggers on any Docker-related task.',
    'Containerisation Patterns',
    [
      'Writing or updating a Dockerfile',
      'Setting up docker-compose for local development',
      'Preparing a container image for production deployment',
    ],
    `1. Use a multi-stage Dockerfile: builder stage → minimal runtime stage
2. Run the application as a non-root user in the final stage
3. Use .dockerignore to exclude node_modules, .git, and local env files
4. Pin base image versions: node:22.4-alpine not node:latest
5. Set HEALTHCHECK in the Dockerfile for orchestrated deployments`,
    `- COPY package*.json and install dependencies before COPY . to maximise layer cache hits
- Use ARG for build-time variables; ENV only for runtime variables
- Scan images for vulnerabilities with docker scout or trivy before production deployment`,
    [
      'Running as root in the container',
      'COPY . before npm install — it busts the cache on every code change',
      'Storing secrets in environment variables baked into the image — use runtime injection',
    ]
  ),

  'stripe-integration-patterns': skill(
    'stripe-integration-patterns',
    'Use when integrating Stripe for payments, subscriptions, or payouts. Triggers on any Stripe SDK usage, webhook handler, or payment flow implementation.',
    'Stripe Integration Patterns',
    [
      'Implementing a payment flow or checkout session',
      'Setting up Stripe webhooks',
      'Managing subscriptions or customer billing',
    ],
    `1. Create a Payment Intent server-side; confirm it client-side with Stripe.js
2. Verify webhook signatures using stripe.webhooks.constructEvent() before processing
3. Make webhook handlers idempotent — Stripe retries on failure
4. Use Stripe Checkout for hosted payment pages when custom UI is not required
5. Test with Stripe test mode cards before going live`,
    `- Never log or store raw card data — Stripe handles PCI compliance, not your application
- Use Stripe Customer IDs to associate payments with your user records
- Handle webhook events asynchronously — respond with 200 immediately, process in a queue
- Use Stripe's metadata field to attach your internal IDs to Stripe objects`,
    [
      'Trusting client-supplied amount values — always compute prices server-side',
      'Processing webhooks without signature verification',
      'Using the secret key in frontend code',
      'Manually polling for payment status instead of using webhooks',
    ]
  ),

}

// ─── Guardrail Skills ─────────────────────────────────────────────────────────

const GUARDRAIL = {

  'validating-user-input': skill(
    'validating-user-input',
    'Use when implementing validation for any user-supplied data — form fields, API parameters, file uploads, URL parameters, or query strings. Must run before any data is processed or persisted.',
    'Validating User Input',
    [
      'Before processing any data submitted by a user',
      'Adding a new form field or API parameter',
      'Implementing a public endpoint that accepts input',
    ],
    `1. Define the schema using a validation library (Zod, Joi, Yup, or Pydantic)
2. Validate at the boundary — the first point where external data enters the system
3. Return field-level error messages: which field, what the constraint is, what was received
4. Sanitise after validation: trim strings, normalise case, strip HTML where appropriate
5. Log validation failures with the field names but never the field values`,
    `- Treat all user input as untrusted regardless of source (form, API, webhooks, query params)
- Validate type, format, length, range, and business-rule constraints separately
- Use allowlist validation (permit known-good values) over denylist (block known-bad values)
- Never pass unsanitised user input to a database query, shell command, or HTML output`,
    [
      'Checking only the presence of required fields and skipping format validation',
      'Trusting client-side validation as the only safeguard — always validate server-side',
      'Returning raw library validation errors to the client',
      'Validating after the data has already been used in a query or stored',
    ]
  ),

  'implementing-auth-patterns': skill(
    'implementing-auth-patterns',
    'Use when implementing authentication, authorisation, session management, or token handling. Triggers when adding login flows, protecting routes, implementing OAuth, or managing user sessions.',
    'Implementing Auth Patterns',
    [
      'Adding a login, registration, or session management flow',
      'Protecting routes or API endpoints with authentication',
      'Implementing OAuth, SSO, or third-party authentication',
      'Managing JWTs, refresh tokens, or session tokens',
    ],
    `1. Choose the auth strategy: JWT (stateless) or session tokens (stateful, server-managed)
2. Store session tokens in httpOnly, Secure, SameSite=Strict cookies — never in localStorage
3. Implement token rotation: short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
4. Invalidate all sessions on password change and on suspicious activity
5. Rate-limit authentication endpoints: max 5 attempts per IP per minute`,
    `- Hash passwords with bcrypt (work factor ≥ 12) or Argon2id — never MD5 or SHA1
- Never log passwords, tokens, or session IDs
- Validate that the user owns a resource before returning it — check ownership on every request
- Use a battle-tested auth library (Auth.js, Passport, Lucia) rather than rolling your own`,
    [
      'Storing JWT tokens in localStorage — they are accessible to JavaScript and vulnerable to XSS',
      'Using weak token signing secrets — use ≥ 256 bits of entropy',
      'Trusting user-supplied user IDs without verifying them against the session',
      'Implementing "security through obscurity" — hiding endpoints is not access control',
    ]
  ),

  'managing-cors-policy': skill(
    'managing-cors-policy',
    'Use when configuring CORS for an API or web server. Triggers when an API is accessed from a browser, when adding cross-origin endpoints, or when setting up a new web service.',
    'Managing CORS Policy',
    [
      'Configuring CORS for a web API',
      'Debugging a CORS error in development',
      'Setting up a new Express, Fastify, or similar web server',
    ],
    `1. Define an explicit ALLOWED_ORIGINS list from environment variables
2. Apply different CORS policies for development and production environments
3. Specify allowedHeaders, exposedHeaders, and methods explicitly
4. Set maxAge for preflight cache to reduce OPTIONS request volume
5. Test CORS in a real browser — node tests do not simulate browser restrictions`,
    `- Never use origin: '*' in production if the API handles authentication or user data
- Allow credentials (allowCredentials: true) only when explicitly required — it restricts the origin to non-wildcard
- Restrict allowed methods to only those the API actually uses
- Use a CORS middleware library — do not set Access-Control headers manually`,
    [
      "Wildcard origin (*) with allowCredentials: true — browsers reject this combination",
      'Configuring CORS only on some routes and forgetting others',
      'Relying on CORS as a security boundary — it only controls browser behaviour, not server-to-server calls',
    ]
  ),

  'managing-secrets-and-env': skill(
    'managing-secrets-and-env',
    'Use when handling environment variables, secrets, API keys, or sensitive configuration. Triggers when adding a new secret, setting up a deployment environment, or reviewing code for leaked credentials.',
    'Managing Secrets & Environment Variables',
    [
      'Adding a new API key, token, or secret to a project',
      'Setting up environment configuration for a new environment',
      'Reviewing code for potential credential leaks before committing',
    ],
    `1. Document all required secrets in .env.example with descriptions but no real values
2. Use a secrets manager (AWS Secrets Manager, Vault, Doppler) for production — not .env files
3. Add .env, .env.local, .env.*.local to .gitignore immediately on project creation
4. Rotate all secrets immediately if they are committed to source control — treat as compromised
5. Audit environment variable usage with a linter rule (eslint-plugin-no-secrets)`,
    `- Separate secrets by environment — dev, staging, and production must have different values
- Use the principle of least privilege: each service gets only the secrets it needs
- Never log environment variable values at startup or in error messages
- Validate that all required environment variables are present at application startup, not at first use`,
    [
      'Hardcoding secrets or API keys anywhere in source code',
      'Using the production secret key in local development',
      'Sharing .env files over Slack, email, or other insecure channels',
      'Not rotating secrets after a team member departs',
    ]
  ),

  'handling-payment-security': skill(
    'handling-payment-security',
    'Use whenever implementing payment flows, handling financial data, or integrating with payment processors. Activates for any feature that touches money, card data, bank details, or billing information.',
    'Handling Payment Security',
    [
      'Implementing any payment, billing, or checkout feature',
      'Storing or displaying billing information',
      'Handling refunds, disputes, or subscription changes',
    ],
    `1. Never handle raw card data — use a PCI-compliant processor (Stripe, Braintree) and their hosted fields
2. Compute all prices and amounts server-side — never trust client-supplied amounts
3. Verify webhook signatures before processing any payment event
4. Make all payment-related operations idempotent (idempotency keys)
5. Log all payment operations with amounts, IDs, and outcomes — but never log card numbers or CVVs`,
    `- Use Stripe's Payment Intents API — it handles 3DS, SCA, and currency conversion
- Store only the payment processor's customer and payment method IDs, not card details
- Implement audit logging for all payment state changes with timestamps and user IDs
- Test every failure mode: declined cards, network failures, webhook replay, and refund flows`,
    [
      'Logging payment amounts with cardholder names or card numbers',
      'Storing CVV codes — this is a PCI DSS violation regardless of encryption',
      'Trusting client-side price calculations for the payment amount',
      'Processing a webhook event without first verifying its signature',
    ]
  ),

  'data-encryption-patterns': skill(
    'data-encryption-patterns',
    'Use when encrypting sensitive data at rest, implementing field-level encryption, managing encryption keys, or handling data that requires privacy protection by regulation or policy.',
    'Data Encryption Patterns',
    [
      'Storing health records, financial data, private messages, or PII',
      'Implementing field-level encryption for sensitive database columns',
      'Setting up encryption key management for a production system',
    ],
    `1. Classify data sensitivity first: what needs encryption vs. what needs hashing vs. what can be plain text
2. Use AES-256-GCM for symmetric encryption of sensitive fields
3. Never store encryption keys alongside the encrypted data — use a KMS or environment variable
4. Use a unique IV (initialisation vector) for every encryption operation — never reuse IVs
5. Implement key rotation without downtime using key versioning`,
    `- Hash passwords with Argon2id or bcrypt — encryption is wrong for passwords
- Use authenticated encryption (AES-GCM, ChaCha20-Poly1305) — unauthenticated modes can be tampered
- Store the key version alongside the ciphertext to support key rotation
- Audit all access to encrypted data — log who decrypted what and when`,
    [
      'Rolling your own encryption algorithm or cipher — use battle-tested libraries',
      'Using ECB mode for AES — it leaks patterns in the data',
      'Encrypting data with a static IV — this breaks semantic security',
      'Storing encryption keys in the same database as the encrypted data',
    ]
  ),

}

// ─── Deployment Skills ────────────────────────────────────────────────────────

const DEPLOYMENT = {

  'deploying-to-vercel': skill(
    'deploying-to-vercel',
    'Use when deploying a frontend, full-stack, or serverless application to Vercel. Triggers when setting up a new Vercel project, configuring builds, environment variables, or custom domains.',
    'Deploying to Vercel',
    [
      'Setting up a new project on Vercel',
      'Configuring build settings, redirects, or rewrites',
      'Troubleshooting a failed Vercel deployment',
    ],
    `1. Connect the Git repository to Vercel and let Vercel auto-detect the framework
2. Set all environment variables in the Vercel dashboard — never in code or committed files
3. Use vercel.json for rewrites, redirects, headers, and function configuration
4. Set the correct Node.js version in vercel.json or engines field in package.json
5. Enable Vercel Analytics and Speed Insights for production monitoring`,
    `- Use Preview Deployments for every pull request — test before merging
- Set maxDuration on Serverless Functions that may run long (default is 10s on hobby plan)
- Configure custom domains with automatic HTTPS via Vercel's certificate management
- Use Vercel Edge Config for feature flags and A/B testing — it reads at the edge with zero latency`,
    [
      'Committing .vercel/ directory to source control',
      'Hardcoding environment-specific values in vercel.json — use environment variables',
      'Deploying directly from the CLI in CI instead of using GitHub integration',
      'Ignoring build logs when a deployment succeeds but the app behaves differently',
    ]
  ),

  'deploying-to-aws': skill(
    'deploying-to-aws',
    'Use when deploying applications to AWS. Triggers when setting up EC2, ECS, Lambda, S3, CloudFront, RDS, or any AWS service. Applies to both new deployments and infrastructure changes.',
    'Deploying to AWS',
    [
      'Setting up a new AWS deployment for an application',
      'Adding or modifying AWS infrastructure (EC2, ECS, Lambda, RDS)',
      'Configuring IAM roles, security groups, or VPC settings',
    ],
    `1. Define infrastructure as code using CDK, Terraform, or CloudFormation — never click-ops in production
2. Use IAM roles with least-privilege policies — never use root credentials or long-lived access keys
3. Deploy to a VPC; put databases and internal services in private subnets
4. Use Parameter Store or Secrets Manager for all secrets — never environment variables in the console
5. Enable CloudTrail, VPC Flow Logs, and GuardDuty before going live`,
    `- Use ECS Fargate or Lambda for stateless services — avoid managing EC2 instances directly
- Enable RDS automated backups with at least 7-day retention
- Use CloudFront in front of S3 for static assets and API caching
- Tag all resources with project, environment, and owner for cost attribution`,
    [
      'Using AdministratorAccess IAM policies for application service accounts',
      'Opening security group ingress to 0.0.0.0/0 for anything other than ports 80/443',
      'Storing secrets in EC2 user data or environment variables in ECS task definitions as plain text',
      'Deploying without a rollback strategy — use ECS blue/green or Lambda aliases',
    ]
  ),

  'deploying-to-gcp': skill(
    'deploying-to-gcp',
    'Use when deploying applications to Google Cloud Platform. Triggers when setting up Cloud Run, GKE, Cloud Functions, Cloud SQL, or any GCP service.',
    'Deploying to GCP',
    [
      'Setting up a new GCP project or service',
      'Deploying a containerised application to Cloud Run',
      'Configuring IAM, VPC, or Cloud SQL on GCP',
    ],
    `1. Use Workload Identity Federation for CI/CD — never create service account keys
2. Deploy stateless services to Cloud Run with --allow-unauthenticated only when public access is intended
3. Use Secret Manager for all secrets; mount them as environment variables in Cloud Run
4. Enable Cloud Audit Logs for all services before going to production
5. Use Artifact Registry for container images — not Docker Hub`,
    `- Assign the minimum IAM roles needed; prefer predefined roles over primitive roles (Owner/Editor/Viewer)
- Use VPC Service Controls to restrict data exfiltration for sensitive projects
- Set min-instances > 0 on Cloud Run services where cold start latency is unacceptable
- Use Cloud Armor for DDoS protection and WAF rules on public-facing services`,
    [
      'Using service account keys stored in source code or CI secrets — use Workload Identity',
      'Deploying to the default compute service account with broad project-level permissions',
      'Skipping VPC connector configuration for Cloud Run services that need private resource access',
      'Using --allow-unauthenticated on internal services',
    ]
  ),

}

// ─── Master Export ─────────────────────────────────────────────────────────────

export const SKILL_TEMPLATES = {
  ...CORE,
  ...STACK,
  ...GUARDRAIL,
  ...DEPLOYMENT,
}

/**
 * Returns the SKILL.md content string for a given skill name.
 * Returns a placeholder template if the skill name is not found.
 */
export function getSkillTemplate(skillName) {
  if (SKILL_TEMPLATES[skillName]) return SKILL_TEMPLATES[skillName]

  // Fallback for any skill name not in the library
  return skill(
    skillName,
    `Use this skill when working on ${skillName.replace(/-/g, ' ')} related tasks.`,
    skillName.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
    [`Working on a task related to ${skillName.replace(/-/g, ' ')}`],
    `1. Review the existing code in this area before making changes\n2. Follow established patterns in the codebase\n3. Test your changes thoroughly`,
    `- Follow project conventions\n- Write clean, readable code\n- Handle errors appropriately`,
    [
      'Introducing patterns inconsistent with the rest of the codebase',
      'Skipping error handling',
    ]
  )
}

/**
 * Returns the total number of skill templates in the library.
 */
export function getTemplateCount() {
  return Object.keys(SKILL_TEMPLATES).length
}
