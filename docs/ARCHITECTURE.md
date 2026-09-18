# Architecture

Angular 21 standalone components and signals → same-origin Express 5 JSON API → Mongoose → MongoDB. Node.js 24 and TypeScript 5.9 are used. The esbuild application builder produces lazy feature chunks. Critical CSS inlining is disabled so loading styles does not require inline JavaScript under the production Content Security Policy.

## Domain models

Account (normalized unique email, salted scrypt password hash); Session (hashed opaque token, seven-day TTL); Form (owner, fields, members, publication state and revision); Response (encrypted answers/files, field snapshot, submission retry key); Template (independent question definitions and visibility).

Question kinds: text, textarea, email, number, date, radio, checkbox, select, file, password, info, link. Masked text is not a login credential field. Responses and attachments are encrypted with AES-256-GCM; account details and question definitions are not encrypted by this application. HTTPS protects transport. HTTP-only, Secure production cookies protect sessions. All modifying API calls require X-FormYfinite: 1 and an allowed Origin where supplied. Roles are enforced by the API, not just the interface.

Conditions reference earlier fields, preventing cycles. Hidden answers are discarded server-side. Version-checked updates prevent silent overwrites, including publication and collaborator changes. A UUID submission key deduplicates retries from the same open response page. Response snapshots preserve historic question labels. CSV exports neutralize spreadsheet formula prefixes. Analytics and exports iterate MongoDB cursors rather than loading file payloads for every response at once.

## API groups

- POST `/api/accounts`, POST/DELETE `/api/session`, GET/PATCH `/api/account`.
- GET/POST `/api/forms`; GET/PUT/DELETE `/api/forms/:id`; PATCH `/api/forms/:id/state`.
- GET `/api/public/:id`; POST `/api/public/:id/responses`.
- GET `/api/forms/:id/responses?page=1`; DELETE `/api/forms/:id/responses/:responseId`.
- GET `/api/forms/:id/analytics` and `/api/forms/:id/export.csv`.
- POST `/api/forms/:id/members`; DELETE `/api/forms/:id/members/:email`.
- GET `/api/invitations`; POST `/api/invitations/:id` to accept.
- GET `/api/templates`; POST `/api/forms/:id/template`; DELETE `/api/templates/:id`.
- GET `/api/admin/accounts`; PATCH `/api/admin/accounts/:id`.

## Scope

Implements the report's core form management modules, all twelve field types, conditional rendering, collaboration permissions, reporting and reusable templates. CSV and authenticated REST access provide integration surfaces. AI generation, external-provider webhooks, arbitrary regex rules, SMTP and forgotten-password email flows are not implemented. This is a fresh implementation; previous schemas, environment credentials, UI libraries and assets are not dependencies.
