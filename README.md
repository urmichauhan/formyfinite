# FormYfinite — fresh implementation

A new Angular 21, Express 5, Node.js 24 and MongoDB application. Application source was authored afresh; no previous application source, assets, environment files, or master-branch files were restored or copied.

## Quick demonstration

Install Node.js 24 and pnpm, then run:

```sh
npm install --global pnpm@11.19.0
pnpm install --frozen-lockfile
pnpm build
pnpm demo
```

Open http://localhost:3000 and register an account. There are no default credentials. The demo downloads a MongoDB binary on first use and uses a temporary database. **Demo data disappears when the process stops.**

## Persistent local use

Copy `.env.example` to `.env`. Set `MONGODB_URI` to your local or Atlas database. Generate `DATA_ENCRYPTION_KEY` using:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Store that value in `.env`; keep a secure backup. Run `pnpm build` and `pnpm start`. For development run `pnpm dev`, then open http://localhost:4200. Alternatively configure `.env` and use `docker compose up --build`; Compose stores MongoDB data in a persistent volume and exposes only the application port.

## Features

- Account registration, secure login/logout, password changes, administrative enable/disable.
- Twelve question types, drag-and-drop and keyboard-friendly ordering, validation and conditional visibility.
- Draft/published/closed forms and anonymous submissions with retry deduplication.
- Encrypted response/file storage and historical question snapshots.
- In-app invitations, owner/editor/viewer roles, access revocation, optimistic editing conflicts.
- Response pagination, daily and categorical charts, numerical averages, CSV export and downloads.
- Starter templates, private reusable templates and a shared community library.
- Responsive screens and a complete footer-linked guide at `/guide`.

## New source layout

| Directory | Responsibility |
| --- | --- |
| `web/` | Angular pages, editor, renderer, guide and styles |
| `api/` | Express routes, Mongoose models, validation and cryptography |
| `test/` | API and rules tests |
| `browser-tests/` | Chromium end-to-end tests |
| `tools/` | Temporary demonstration launcher |
| `docs/` | User guide, architecture and deployment instructions |

`pnpm test` runs API tests using real temporary MongoDB. Install Chromium with `pnpm exec playwright install chromium`, then run `pnpm test:browser` (port 3100).

## Repository history

The pre-existing `.git` metadata was left untouched. New working files do not remove data from earlier commits or from GitHub. The clean source ZIP excludes `.git` and can initialize a separate repository without inheriting old history. Do not restore old source files into this project.

See `docs/DEPLOYMENT.md` for public hosting and `docs/ARCHITECTURE.md` for implementation details and limits.
