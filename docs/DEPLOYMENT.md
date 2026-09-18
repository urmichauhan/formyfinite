# Deploy the fresh FormYfinite application

## Start with clean source

The provided fresh-source archive excludes Git history, dependencies, build caches and all previous application files. If earlier repository history contains unwanted data, extract this archive to a separate clean folder before initializing a new repository. Merely committing deletions to an existing branch does not remove old commits. Do not force-push or delete repository history without a deliberate cleanup plan. If real credentials were publicly exposed, revoke/rotate those credentials separately.

From the extracted clean folder, create a new repository on GitHub and follow its displayed instructions to push. Confirm the repository contains `web/`, `api/`, `Dockerfile`, `pnpm-lock.yaml` and `render.yaml`. Review all files before publishing; never commit `.env` or real responses.

## Configure MongoDB Atlas

Create a cluster and a dedicated database user with read/write access to the `formyfinite` database. In Connect → Drivers, copy the Node.js connection string. Use `/formyfinite` as the database name, replace username/password privately, and URL-encode special characters in the password.

Add the hosting service's outbound addresses to Atlas Network Access. Restrict the allowlist to those addresses and the local addresses you need for administration. Database credentials belong in hosting secrets, not frontend code or GitHub.

## Render

Create a Docker Web Service connected to the clean repository and the branch containing this implementation. Leave root directory blank; use `./Dockerfile`. The Dockerfile builds the frontend and starts `node api/start.js`. Set the health check to `/api/health`.

Alternatively create a Blueprint using `render.yaml`. The example selects the free plan; review current limits and pricing for your intended usage.

| Environment variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `APP_ORIGIN` | Exact public HTTPS origin without a trailing slash |
| `MONGODB_URI` | Atlas connection string pointing to `/formyfinite` |
| `DATA_ENCRYPTION_KEY` | Stable 64-character hex value from `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAIL` | Your intended administrator's email |

Register the administrator account before sharing the site widely. If the hostname is assigned after creation, update `APP_ORIGIN` and redeploy. Keep the encryption key stable across redeployments and back it up securely. Production cookies require HTTPS. Render provides PORT automatically.

## Verify before public use

1. `/api/health` returns `{"status":"ok"}`.
2. Register the admin account and confirm administration controls in Account.
3. Create, save and publish a form; submit in a private browser window.
4. Check responses, files, charts and CSV export.
5. Invite a separate viewer, accept the invitation, and verify editing is unavailable.
6. Test two editors saving the same version; the stale save must be rejected.
7. Restart the service and confirm persistent data survives.
8. Open the footer guide and check a phone-sized viewport.

## Operating limits

This version polls changes every ten seconds; it does not merge simultaneous keystrokes. Email delivery, email verification and self-service password recovery are not configured. Invitations are in-app. Each upload is at most 1 MB; total JSON requests at most 12 MB. Add malware scanning/object storage for production file-heavy workloads. Add a shared rate-limit store before running multiple application instances. The system has functional tests, not an independent penetration test or large-scale load benchmark.

Maintain database backups and securely back up the encryption key separately. The original database schema from other projects is not imported or reused.

Official references: https://render.com/docs/deploys · https://render.com/docs/outbound-ip-addresses · https://www.mongodb.com/docs/atlas/driver-connection/
