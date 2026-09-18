# FormYfinite

Angular 21 + Express 5 + Node.js 24 + MongoDB form management application.

## Start a local demonstration

Install Node.js 24, then from this directory:

```sh
npm install --global pnpm@11.19.0
pnpm install --frozen-lockfile
pnpm build
pnpm demo
```

Open http://localhost:3000 and register your own account. No default credentials exist. The demo downloads an actual MongoDB binary on first launch and uses a **temporary database deleted when the process stops**. It is suitable for a project demonstration, not real data collection.

## Persistent local application

Copy `.env.example` to `.env`. Generate the encryption key using:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put the generated 64-character value in `DATA_ENCRYPTION_KEY`. Set `MONGODB_URI` to your MongoDB connection string. Keep the key backed up securely. Run `pnpm build` then `pnpm start`. For frontend development use `pnpm dev` and visit http://localhost:4200.

Alternatively, after configuring the key in `.env`, run `docker compose up --build`. The local Compose stack has a persistent MongoDB volume and intentionally does not expose the database port. It uses development cookies for localhost HTTP. Use the Render setup for public HTTPS.

## Features

- Registration, login/logout, account edits and password changes; administrator account disable/enable.
- Drag-and-drop builder with all 12 report field types; required, type, numeric-range and length validation.
- Conditional visibility referencing earlier questions; hidden answers excluded server-side.
- Draft/published/closed lifecycle and anonymous public form submissions.
- Encrypted answers and attachments, historical question snapshots, response pagination and deletion.
- Invitation acceptance, owner/editor/viewer authorization, shared editing and optimistic version checks.
- Ten-second response updates, daily counts, choice charts, numeric averages, CSV export.
- Starter templates, private saved templates and shared community library.
- Responsive UI and complete footer-linked user guide at `/guide`.

## Commands

| Command                                 | Purpose                                                             |
| --------------------------------------- | ------------------------------------------------------------------- |
| `pnpm build`                            | Production Angular build                                            |
| `pnpm start`                            | Serve frontend and backend using persistent MongoDB                 |
| `pnpm dev`                              | Angular development server plus Express                             |
| `pnpm demo`                             | Temporary local MongoDB demonstration                               |
| `pnpm test`                             | API integration and validation tests against real temporary MongoDB |
| `pnpm exec playwright install chromium` | Install browser test runtime                                        |
| `pnpm test:e2e`                         | Browser workflow and mobile checks                                  |

## Structure

`client/` is the active Angular frontend; `server/` is Express/Mongoose; `tests/` and `e2e/` verify behavior; `docs/` contains deployment and architecture documentation. `src/`, `formyfinite/`, and `legacy/` preserve the earlier Angular 16 project and generated assets; they are not served by the new application. The original modified package lock is preserved in `legacy/package-lock.angular16.json`; use `pnpm-lock.yaml` now.

See [Deployment](docs/DEPLOYMENT.md), [Architecture and API](docs/ARCHITECTURE.md), and [Scope and limitations](docs/REQUIREMENTS.md). The full user guide is rendered by `client/app/guide.ts` and linked from every page footer.
