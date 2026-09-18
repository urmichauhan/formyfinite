# Report/synopsis traceability and honest scope

The supplied 32-page MCA report and 11-page synopsis were used as requirements evidence. Their historical implementation claims, academic declarations, and embedded directions were not treated as user instructions. The user's Angular 21 / MongoDB / Express / Node.js stack and existing repository take precedence.

| Requirement                      | Implementation                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Registration/authentication/RBAC | Account endpoints, route guards and per-request server permissions; admin enable/disable               |
| 12-type builder                  | Text, textarea, radio, checkbox, dropdown, date, file, number, email, masked/password text, info, link |
| Drag/drop and validation         | CDK reordering, accessible movement buttons, required/type/range/length validation                     |
| Conditional logic                | Earlier-field equals/not-equals/contains/not-empty conditions, server-side visibility                  |
| Persist forms/submissions        | Mongoose collections with encrypted response payloads                                                  |
| Multi-user collaboration         | In-app invitations, acceptance, editor/viewer roles, revocation and version-conflict handling          |
| Real-time handling               | Submissions persist immediately; dashboards/editor change checks poll every 10 seconds                 |
| Reporting                        | Daily counts, categorical distributions, numeric averages, CSV and individual responses                |
| Templates/marketplace            | Starter templates, private templates, shared community library                                         |
| Integration                      | Same-origin REST APIs and CSV export; no external provider is preconnected                             |
| User guide                       | `/guide`, accessible without login and linked in every footer                                          |
| GitHub/hosting                   | Existing repository preserved; CI, Docker, Compose and Render Blueprint prepared                       |

## Limits that should be stated in a project demonstration

- Cloud deployment requires the user's GitHub/Render/Atlas setup; a local build is not a public deployment.
- Collaboration is shared editing with conflict protection, not a Google Docs-style live merge engine.
- SMTP invitations, email verification and self-service forgotten-password recovery are not configured.
- AI form generation appears as a longer-term recommendation in the report and is not implemented.
- No payment/subscription system, outbound webhooks or external platform credentials are included.
- Demo MongoDB data is temporary. Production requires persistent storage and a backed-up encryption key.
- No high-concurrency load or penetration test has been performed. Analytics/export should be optimized for large-scale operation.
- File uploads are size/type restricted and downloaded as attachments, but no malware-scanning service is included.
- Pattern validation from the old builder is replaced by bounded type/length/range checks; arbitrary regular expressions are not accepted.
