# Copilot instructions for this repository

Purpose
- Help Copilot-powered sessions (CLI or assistants) quickly understand how to build, run, lint, and where to look for the important features in this repo.

Build / Run / Lint
- Start dev server: npm run dev  (uses Next.js: next dev)
- Build production: npm run build
- Start built app: npm run start
- Lint (project): npm run lint
- Lint a single file: npx eslint "src/**/*.{ts,tsx}" --fix or npx eslint "src/app/quan-ly-du-lieu/sinh-vien/components/ImportDialog.tsx"
- Tests: No test runner or npm test script is configured in package.json. If tests are added, expect the repo to use a common runner (Vitest/Jest) and add npm scripts; until then, run individual test runners directly.

High-level architecture
- Next.js (app router) TypeScript application. Key folders under src: app (route-level pages/components), components, hooks, lib.
- UI libraries: Radix UI, Tailwind CSS (v4), class-variance-authority, clsx. React 19 and Next 16 are used.
- CSV import feature: Implemented under src/app/quan-ly-du-lieu/sinh-vien. Important pieces:
  - types.ts — local TypeScript interfaces for import flow
  - student.api.ts — frontend API wrapper functions (analyzeImportCSV, executeImportCSV)
  - components/ImportDialog.tsx — main UI for upload, mapping, dry-run analysis and import
  - page.tsx — route that integrates the ImportDialog and triggers refresh
  - public/templates/student_import_template.csv — sample CSV template
- Backend contract: frontend expects POST /students/import with form-data: file (CSV), dry_run (true|false), column_mapping (JSON string). The analyze (dry-run) API returns counts and details of invalid rows; executeImportCSV triggers actual import and returns upload metadata.

Key conventions and patterns
- Naming:
  - API wrappers: *.api.ts (keeps HTTP logic separate from UI)
  - Local types: types.ts colocated with feature
  - Route entry: page.tsx in app directory
  - Feature components in a components folder next to the page
- Component APIs:
  - ImportDialog: props include open, onOpenChange, onComplete (onComplete expected to refresh data)
- Localization / paths:
  - Some route and folder names use Vietnamese (e.g., quan-ly-du-lieu/sinh-vien). Copilot should match spelling and diacritics used in filenames when searching.
- Styling:
  - Tailwind utility classes with class-variance-authority and clsx are common. Look for cva patterns when editing style variants.
- Error & state handling:
  - Import flow is split into upload -> mapping -> analyze -> import. The code stores analysisResult and separate flags for isAnalyzing / isImporting; mirror these states when adding features.

Files of immediate interest for Copilot prompts
- src/app/quan-ly-du-lieu/sinh-vien/types.ts
- src/app/quan-ly-du-lieu/sinh-vien/student.api.ts
- src/app/quan-ly-du-lieu/sinh-vien/components/ImportDialog.tsx
- src/app/quan-ly-du-lieu/sinh-vien/page.tsx
- public/templates/student_import_template.csv
- IMPORT_GUIDE.md, IMPLEMENTATION_SUMMARY.md, QUICK_START.md (contain UX and API details to reuse)

What Copilot should prefer when suggesting code
- Keep API calls in *.api.ts — avoid inlining fetch/axios code into components unless the change is explicitly local
- Preserve TypeScript types declared in types.ts; prefer type-safe updates over any/unknown
- For UI changes keep presentation logic in components and state-management local to the page or component; prefer props callbacks (onComplete) already used by ImportDialog

Notes for running checks or adding tests
- No test framework configured. If adding tests, also add npm scripts (npm test, npm run test:watch) and document how to run a single test file in this doc.
- ESLint is configured using eslint-config-next; prefer using npx eslint with explicit globs when running per-file checks.

Relevant docs to reference in repo
- IMPORT_GUIDE.md — user-facing import instructions
- IMPLEMENTATION_SUMMARY.md — detailed engineering notes for the import feature
- QUICK_START.md — short dev flow for import testing

Done: created copilot-instructions.md in repo root. Please move it into .github/ when environment allows.
