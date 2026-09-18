# FormYfinite delivery and verification

The active application is in `C:/URMI/Codes/BCA/PROJ/project1`.

## Delivered

Angular 21 frontend, Express/Node.js backend, MongoDB persistence, authentication and access roles, 12-type drag-and-drop form builder, conditional fields, publishing and anonymous submissions, invitation-based collaboration with conflict protection, response analytics, CSV export, file uploads, templates, account/admin controls, and a footer-linked user guide.

The old Angular 16 source is preserved under `src/`; the active frontend is `client/`. The pre-existing modified npm lockfile is preserved in `legacy/package-lock.angular16.json`. The active lockfile is `pnpm-lock.yaml`.

## Verified locally on 18 September 2026

- Angular 21 production build: passed; initial JavaScript/CSS total approximately 264.46 kB, estimated transfer 74.01 kB.
- API and validation tests: 14 passed, 0 failed, using an actual temporary MongoDB process.
- Chromium browser tests: 4 passed, 0 failed. Covered registration → form creation → publishing → anonymous response → results; mobile layout; all 12 field types including conditional visibility/files/decimal numbers; and invitation acceptance with viewer restrictions across separate browser accounts.
- Production dependency audit: no known vulnerabilities reported by `pnpm audit --prod --audit-level high`.
- Desktop/mobile screenshots visually inspected. Production stylesheet loading verified under the application's Content Security Policy.

## Run

Install Node.js 24 and pnpm 11.19.0, then run in the source directory:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm demo
```

Open http://localhost:3000 and register an account. No default login exists. **Demo data is temporary and disappears when the server stops.** Use the persistent MongoDB instructions in README.md for real data.

## Public release status

- Existing GitHub remote: https://github.com/urmichauhan/project1
- Files are updated locally; no commit or push was made. GitHub authentication is unavailable in this sandbox.
- GitHub Actions, Dockerfile, persistent local Compose setup, Render Blueprint and Atlas instructions are included.
- Public deployment is not performed. The user selected “Use existing repository; prepare hosting setup”. Follow DEPLOYMENT.md to configure GitHub, Render and MongoDB Atlas.
- Docker container execution is not verified: Docker Desktop's engine was stopped. Direct Node/Angular/MongoDB tests passed.

## Explicit limits

Collaboration uses saved versions and ten-second polling, not simultaneous keystroke merging. Invitations are in-app; SMTP, email verification and forgotten-password email recovery are not configured. AI generation and outgoing webhooks are not implemented. Arbitrary regex validation is not supported. No load test or independent security audit has been performed. See `docs/REQUIREMENTS.md` and `docs/DEPLOYMENT.md` for operational limits and requirements.

The source archive contains the active application and deployment/test files. Your historical source and original modified lockfile remain in the existing repository; they are intentionally excluded from the clean distribution archive.
