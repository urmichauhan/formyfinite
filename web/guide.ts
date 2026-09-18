import { Component } from "@angular/core";
@Component({
  template: `<section class="guide-hero">
      <span class="eyebrow">A HELPING HAND, EVERY STEP</span>
      <h1>A little guidance.<br /><em>A world of possibilities.</em></h1>
      <p>Your complete guide to FormYfinite.</p>
    </section>
    <section class="shell guide-grid">
      <aside class="guide-nav">
        <a href="/guide#start">1. Your first form</a
        ><a href="/guide#accounts">2. Accounts and signing in</a
        ><a href="/guide#builder">3. Build and customize</a
        ><a href="/guide#conditions">4. Conditional questions</a
        ><a href="/guide#sharing">5. Publish and collect responses</a
        ><a href="/guide#team">6. Collaborate with your team</a
        ><a href="/guide#reports">7. Responses, charts and exports</a
        ><a href="/guide#templates">8. Templates and the library</a
        ><a href="/guide#privacy">9. Privacy and data</a
        ><a href="/guide#help">10. Troubleshooting and administration</a>
      </aside>
      <div class="guide-body">
        <article id="start">
          <span class="eyebrow">01 / YOUR GUIDE</span>
          <h2>Your first form</h2>
          <ol>
            <li>
              Choose Start creating and register with your name, email, and a
              password of at least 10 characters.
            </li>
            <li>In Workspace, select Create a form or choose a template.</li>
            <li>Add questions, configure them, and select Save form.</li>
            <li>Preview your form, then Publish form.</li>
            <li>
              Copy the public link and share it. Open Responses to see answers.
            </li>
          </ol>
          <p>
            Saving a new form creates a private draft. Publish it before sending
            it to respondents.
          </p>
        </article>
        <article id="accounts">
          <span class="eyebrow">02 / YOUR GUIDE</span>
          <h2>Accounts and signing in</h2>
          <p>
            Log in with your registered email and password. Email addresses are
            case-insensitive. Click your initial in the navigation to edit your
            display name or change your password. A password change requires
            your current password and signs out other sessions.
          </p>
          <p>
            Sessions expire after seven days. Use Sign out on shared computers.
            Email verification and self-service forgotten-password recovery are
            not configured. If you cannot sign in, contact the deployment
            operator, who must verify your identity before recovery.
          </p>
        </article>
        <article id="builder">
          <span class="eyebrow">03 / YOUR GUIDE</span>
          <h2>Build and customize</h2>
          <p>
            Click a question type in the left palette. Edit its label and help
            text in the center. Drag its dotted handle, or use the arrow
            buttons, to reorder it. Use × to remove it. Save changes explicitly;
            there is no autosave. Leaving with unsaved changes shows a warning.
          </p>
          <table>
            <tr>
              <th>Question type</th>
              <th>How to use it</th>
            </tr>
            <tr>
              <td>Short text / Long text</td>
              <td>
                Names, comments, and longer answers. Optional minimum and
                maximum lengths.
              </td>
            </tr>
            <tr>
              <td>Email / Number / Date</td>
              <td>
                Email validation, numeric range limits including decimals, and
                calendar dates.
              </td>
            </tr>
            <tr>
              <td>Single choice / Dropdown</td>
              <td>
                One choice from your list. Enter unique, nonempty choices, one
                per line.
              </td>
            </tr>
            <tr>
              <td>Checkboxes</td>
              <td>
                Multiple choices; a required question needs at least one
                selection.
              </td>
            </tr>
            <tr>
              <td>File upload</td>
              <td>
                PDF, PNG, JPEG or plain text up to 1 MB per file. Combined
                request limit is 12 MB.
              </td>
            </tr>
            <tr>
              <td>Masked text</td>
              <td>
                Visually hidden text. Never collect account passwords.
                Authorized CSV exports contain the answer.
              </td>
            </tr>
            <tr>
              <td>Information / Link</td>
              <td>
                Instructions without an answer, or an HTTP/HTTPS link entered in
                the link-address field.
              </td>
            </tr>
          </table>
          <p>
            Set the accent color and confirmation message on the right. Preview
            is a test and never stores answers.
          </p>
        </article>
        <article id="conditions">
          <span class="eyebrow">04 / YOUR GUIDE</span>
          <h2>Conditional questions</h2>
          <p>
            On a question after the first, expand Conditional visibility. Choose
            an earlier source question, an operator, and a matching answer.
            Operators: Equals, Does not equal, Contains, and Has an answer. Text
            matching is case-sensitive. For checkboxes, Equals means the
            selection includes that choice.
          </p>
          <p>
            Example: ask “How will you attend?” with Online and In person
            choices. Show “Dietary requirements” only when the answer equals “In
            person”.
          </p>
          <p>
            Hidden questions are not required and their answers are discarded on
            the server. If the source is hidden, its dependent question is
            hidden too. Moving or deleting a source can clear a condition; check
            Preview afterwards.
          </p>
        </article>
        <article id="sharing">
          <span class="eyebrow">05 / YOUR GUIDE</span>
          <h2>Publish and collect responses</h2>
          <p>
            Only owners can publish. Save, then select Publish form. Use Copy
            public link or Open public form. Respondents need no account. Use
            Close responses to stop collection while keeping existing answers;
            publish again to reopen.
          </p>
          <p>
            Saved changes to a published form apply immediately. Respondents on
            an older version must refresh and check their answers before
            submitting. Share the /f/ public link, not the /edit/ editor link.
          </p>
          <p>
            Respondents complete required visible questions, upload supported
            files if requested, and press Submit response. Wait for the
            confirmation page. Retrying from the same open form after a network
            interruption is deduplicated. Reloading creates a new submission
            attempt. Respondents cannot edit submitted answers; ask the owner to
            delete an incorrect response if needed.
          </p>
        </article>
        <article id="team">
          <span class="eyebrow">06 / YOUR GUIDE</span>
          <h2>Collaborate with your team</h2>
          <p>
            Owners enter a collaborator email in the editor, choose Editor or
            Viewer, and select Invite collaborator. The teammate registers or
            signs in with that email and accepts the invitation in Workspace.
            Invitations are in-app; no email is sent automatically.
          </p>
          <table>
            <tr>
              <th>Role</th>
              <th>Permissions</th>
            </tr>
            <tr>
              <td>Owner</td>
              <td>
                Edit, publish, invite/revoke access, save templates, read/export
                responses, delete forms and responses.
              </td>
            </tr>
            <tr>
              <td>Editor</td>
              <td>
                Edit questions/settings, preview, and read/export responses.
              </td>
            </tr>
            <tr>
              <td>Viewer</td>
              <td>
                View configuration, preview, and read/export responses; cannot
                edit.
              </td>
            </tr>
          </table>
          <p>
            Invite an existing member again to change their role. Remove access
            revokes permission. Editors check for saved changes every 10
            seconds. A stale save is rejected: copy any unsaved notes, Reload
            latest version, then reapply changes. This is shared editing with
            conflict protection, not live keystroke merging.
          </p>
        </article>
        <article id="reports">
          <span class="eyebrow">07 / YOUR GUIDE</span>
          <h2>Responses, charts and exports</h2>
          <p>
            Open View responses in Workspace or Responses in the editor. Results
            refresh every 10 seconds. Charts show counts by day, choice
            distributions, and averages for numeric questions.
          </p>
          <p>
            Expand an individual response to see its answers and download
            attachments. Responses preserve the questions as they were at
            submission time. Pages show 50 responses each. Export CSV downloads
            all responses for spreadsheet analysis. File names appear in CSV;
            download contents individually. Masked answers are included in
            authorized exports.
          </p>
          <p>
            Only owners can permanently delete responses. Deleting a form
            deletes all its responses. Export anything you need first.
          </p>
        </article>
        <article id="templates">
          <span class="eyebrow">08 / YOUR GUIDE</span>
          <h2>Templates and the library</h2>
          <p>
            Choose a starter for events, feedback or research. Use template
            creates an independent draft you own. Owners can Save as template
            from the editor. Leave Share in community library unchecked for a
            private template, or enable it to share questions with registered
            users.
          </p>
          <p>
            Templates contain no responses or collaborator permissions. Deleting
            your template does not delete forms already created from it.
          </p>
        </article>
        <article id="privacy">
          <span class="eyebrow">09 / YOUR GUIDE</span>
          <h2>Privacy and data</h2>
          <p>
            Collect only what you need, explain the purpose, and obtain
            appropriate consent. Never request account passwords or payment
            credentials. Only owners and accepted collaborators can read
            responses.
          </p>
          <p>
            Account passwords use salted scrypt hashes. Sessions use HTTP-only
            cookies. HTTPS is required in production. Response answers and files
            are encrypted in MongoDB using AES-256-GCM; account names/emails and
            form definitions are not encrypted by this application.
          </p>
          <p>
            Remove collaborator access when no longer needed. Delete responses
            according to your retention policy. The deployment operator controls
            backups, retention and account deletion requests. Keep the server
            encryption key backed up securely; losing it makes existing
            responses unreadable.
          </p>
        </article>
        <article id="help">
          <span class="eyebrow">10 / YOUR GUIDE</span>
          <h2>Troubleshooting and administration</h2>
          <p>
            <strong>Cannot save?</strong> Check nonempty title/labels, unique
            choices, valid limits, and any conflict warning.
          </p>
          <p>
            <strong>Invitation missing?</strong> Confirm the exact invited
            email, sign in and refresh Workspace.
          </p>
          <p>
            <strong>Form unavailable?</strong> Ask the owner to publish/reopen
            it and verify the public link.
          </p>
          <p>
            <strong>Session expired?</strong> Log in again. Disabled accounts
            need help from the administrator.
          </p>
          <p>
            The email configured in ADMIN_EMAIL becomes an administrator when it
            registers. Register it before opening the site publicly.
            Administrators can enable/disable users from Account; disabling
            revokes sessions but does not delete forms.
          </p>
          <p>
            The demo database is temporary and disappears when stopped.
            Production needs persistent MongoDB, HTTPS, the exact APP_ORIGIN,
            and a stable encryption key. See the repository deployment guide.
          </p>
        </article>
      </div>
    </section>`,
})
export class Guide {}
