# Public hosting: existing GitHub repository + Render + MongoDB Atlas

This setup prepares `https://github.com/urmichauhan/project1` for deployment. No cloud service or database has been created by the local build. GitHub Pages cannot run Express or MongoDB; deploy the Docker service on Render and store persistent data in Atlas. The service serves Angular and `/api` from the same origin.

## 1. Verify and push the source

Review `git diff` and `git status` in the existing repository. The prior modified lockfile is retained under `legacy/`. Do not commit `.env`, connection strings, encryption keys, or real response data.

```sh
git switch -c formyfinite-angular21
# Review the changed files before staging.
git add client server scripts tests e2e docs public legacy .github .dockerignore .env.example .gitignore Dockerfile compose.yaml render.yaml README.md angular.json tsconfig.json tsconfig.app.json package.json pnpm-lock.yaml pnpm-workspace.yaml proxy.conf.json playwright.config.js
git add -u package-lock.json
git commit -m "Build Angular 21 FormYfinite full-stack application"
git push -u origin formyfinite-angular21
```

Open a pull request to your existing default branch. GitHub Actions runs the build, API tests and browser tests. Merge after checks pass. GitHub authentication is required to push; use your normal Git credential manager or GitHub Desktop.

## 2. Create MongoDB Atlas storage

1. Create an Atlas project and cluster using a suitable plan.
2. Create a dedicated database user with read/write access only to the `formyfinite` database, with a strong generated password.
3. Copy the driver connection string, set the database path to `/formyfinite`, and URL-encode special characters in the password. Store the string only in Render's secret environment settings.
4. Configure Atlas Network Access to allow the Render service's documented outbound addresses. Do not expose a local MongoDB instance to the internet.
5. Configure backups and a retention policy appropriate for the collected data.

## 3. Create the Render service

Connect the existing GitHub repository in Render. Create a Blueprint from `render.yaml`, or create a Docker Web Service using the repository root's Dockerfile. Choose the branch containing this implementation. The included `free` plan is a demonstration starting point; verify current capacity, sleep behavior and pricing before relying on it for public service.

Set these values:

| Variable              | Value                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| `NODE_ENV`            | `production`                                                                                    |
| `APP_ORIGIN`          | Exact public HTTPS origin, e.g. `https://your-assigned-service.onrender.com`, no trailing slash |
| `MONGODB_URI`         | Atlas connection string with `/formyfinite` database                                            |
| `DATA_ENCRYPTION_KEY` | Stable 64-character hex key generated with Node crypto                                          |
| `ADMIN_EMAIL`         | Your intended administrator email; register it before sharing the service publicly              |

The app uses Render's supplied `PORT`, listens on all interfaces, and reports database health at `/api/health`. Keep the encryption key stable through redeployments. Back it up outside the repository; changing or losing it prevents reading existing responses.

If Render assigns the hostname after initial setup, update `APP_ORIGIN` and redeploy before registration. HTTPS is necessary for production session cookies. If adding a custom domain, update `APP_ORIGIN` to that canonical origin and use it consistently.

## 4. Verify the public deployment

1. `/api/health` returns `{ "status": "ok" }`.
2. Register the administrator account; check Account shows user administration.
3. Create and publish a small form. Open its public link in an incognito window and submit a response.
4. Verify the response, analytics, attachment download and CSV from the owner workspace.
5. Register a second account, invite it as Viewer, accept, and verify it cannot edit.
6. Change it to Editor, save from two sessions, and verify conflicting saves are rejected.
7. Open the footer's Complete user guide and check mobile layouts.
8. Restart/redeploy the service and verify accounts and responses remain available.

## Operations

- Use one application instance initially: request limiting is process-local. Add a shared rate-limit store before scaling horizontally.
- Analytics and CSV currently scan form submissions in memory; add bounded aggregation/streaming for large datasets.
- File contents are encrypted inside submission documents. Each file is at most 1 MB and requests at most 12 MB. Use object storage and malware scanning before accepting high-volume or untrusted organizational uploads.
- Monitor service errors and database capacity. Never log answer contents, cookies, or environment secrets.
- Back up MongoDB and the encryption key separately and test restoration.
- There is no automatic SMTP email or forgotten-password workflow. Invitations are accepted in-app. Configure and verify an email provider before adding recovery/email invitations.

## Official references

- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/blueprint-spec
- https://www.mongodb.com/docs/atlas/security/ip-access-list/
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
