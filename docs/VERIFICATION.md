# Fresh FormYfinite — delivery record

Created in C:/URMI/Codes/BCA/PROJ/project1 on 18 September 2026.

## What was rebuilt

New Angular 21 frontend (`web/`), Express/Node backend (`api/`), MongoDB models, scrypt-based authentication, session permissions, encrypted responses, 12-type editor, conditional rendering, public submissions with duplicate retry protection, collaboration invitations and conflict checks, response charts, CSV exports, templates, account administration and a footer-linked user guide.

No previous application files were restored or copied from the master branch. The new source has no dependency on prior business endpoints, assets or configuration. Package-manager caches supply third-party dependencies only.

## Verification

- Production Angular build: passed, approximately 267 kB initial bundle.
- API, validation and cryptography tests: 15 passed.
- Browser workflows: 4 passed, including all field kinds, anonymous submission, invitations and mobile layouts.
- Production dependency audit: no known vulnerabilities reported.
- New source and generated build scanned for the reported organization references, legacy service names, old IP endpoints and former key identifiers: no matches.
- Desktop and phone-size visual inspection: completed.
- Docker/cloud deployment not executed as part of this rebuild.

## Run

The local demonstration is at http://localhost:3100 while its process is running. Register a new account. All demonstration data is temporary.

For a normal startup from the project directory:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm demo
```

The default demo port is 3000. See README.md for persistent MongoDB and docs/DEPLOYMENT.md for public hosting.

## Repository boundary

Existing `.git` metadata was not changed. Deleting/replacing working files does not purge previous commits or GitHub history. The accompanying ZIP intentionally contains no `.git` folder, so it can be used to create a separate clean repository. No commit, push, force-push or public deployment was performed.

## Stated scope limits

Collaboration uses version checks and ten-second refreshes. SMTP/email verification/self-service password recovery, AI generation, outbound webhooks and arbitrary regex validation are not implemented. Upload malware scanning, independent security review and high-load benchmarking remain deployment considerations. These are documented in the application guide and deployment notes.
