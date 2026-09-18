# Architecture and API

Browser → Angular 21 standalone, zoneless components → same-origin Express 5 REST API → Mongoose → MongoDB.

The Angular application uses the esbuild-based `@angular/build:application` builder, lazy feature imports and signals for asynchronous view state. Node.js 24 and TypeScript 5.9 are compatible with Angular 21. We consulted the two supplied articles, but use official Angular documentation for compatibility and implementation decisions. No claim of a measured 5x speed increase is made.

## Data model

- User: normalized unique email, bcrypt password hash, name, role, disabled flag.
- Session: SHA-256 hash of a random 256-bit bearer cookie, user reference, seven-day expiry with TTL index. Raw cookies are never stored.
- Form: owner, ordered embedded fields, status, version, theme, confirmation message, invitations/access roles.
- Submission: form reference/version, field snapshot and AES-256-GCM encrypted answers (including attachments).
- Template: independent field definitions, owner and shared flag.

Conditions can reference only earlier fields, preventing cycles. The server recomputes visibility and discards hidden/unknown answer values. Versioned updates reject stale editor saves with HTTP 409. Public submissions must use the current published form version. Changes are checked every ten seconds in editors and response dashboards.

HTTPS replaces the legacy frontend's static-key payload encryption. TLS protects transmission; randomized authenticated encryption protects stored submissions; bcrypt protects passwords. This is a deliberate correction to the report's legacy client encryption design, not a claim that those old helpers secure the new app. Owner, editor and viewer authorization is checked server-side, beyond the Angular route guard.

## REST endpoints

All modifying requests require `X-FormYfinite: 1` and JSON. Browser origins must match APP_ORIGIN (localhost:4200 is permitted only in development). Authentication uses an HTTP-only SameSite=Lax cookie; production cookies are Secure. There is no permissive CORS configuration.

| Route                                      | Methods / purpose                               |
| ------------------------------------------ | ----------------------------------------------- |
| `/api/health`                              | GET database readiness                          |
| `/api/auth/register`, `/login`, `/logout`  | POST account/session actions                    |
| `/api/auth/me`                             | GET current user                                |
| `/api/auth/profile`                        | PATCH name/password                             |
| `/api/forms`                               | GET accessible forms; POST create               |
| `/api/forms/:id`                           | GET, PUT versioned edit, DELETE owner-only      |
| `/api/forms/:id/status`                    | PATCH draft/published/closed, owner-only        |
| `/api/public/forms/:id`                    | GET published questions                         |
| `/api/public/forms/:id/submissions`        | POST anonymous validated response               |
| `/api/forms/:id/submissions`               | GET 50-row paginated responses                  |
| `/api/forms/:id/submissions/:submissionId` | DELETE owner-only                               |
| `/api/forms/:id/report`                    | GET live aggregate report                       |
| `/api/forms/:id/export`                    | GET CSV with spreadsheet formula neutralization |
| `/api/forms/:id/collaborators`             | POST invitation/role update, owner-only         |
| `/api/forms/:id/collaborators/:email`      | DELETE access, owner-only                       |
| `/api/invitations`                         | GET pending invitations for current email       |
| `/api/invitations/:id/accept`              | POST accept                                     |
| `/api/templates`                           | GET accessible library                          |
| `/api/forms/:id/template`                  | POST save template, owner-only                  |
| `/api/templates/:id`                       | DELETE own template                             |
| `/api/admin/users`                         | GET users, administrator-only                   |
| `/api/admin/users/:id`                     | PATCH disabled flag, administrator-only         |

Response data can be integrated with external systems using authenticated REST endpoints and CSV. No outgoing webhook or email provider is configured.

## References

- https://angular.dev/reference/versions
- https://angular.dev/tools/cli/build-system-migration
- https://angular.dev/guide/http/setup
- User-supplied Medium article: https://medium.com/@Angular_With_Awais/stop-wasting-time-angular-21-cuts-build-time-by-5x-heres-how-0510c322f992 (public preview consulted)
- User-supplied DEV article: https://dev.to/mmourouh/angular-21-is-here-real-features-that-actually-improve-your-daily-workflow-ogk
