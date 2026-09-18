import { Component } from '@angular/core';
@Component({
  template: `<section class="guide-header">
      <span class="eyebrow">A HELPING HAND, EVERY STEP OF THE WAY</span>
      <h1>A little guidance.<br /><em>Infinite possibilities.</em></h1>
      <p>Your complete guide to creating, sharing, and understanding forms.</p>
    </section>
    <section class="guide-layout">
      <aside class="guide-nav">
        <a href="/guide#start">1. Your first form in five steps</a
        ><a href="/guide#account">2. Account, login and password</a
        ><a href="/guide#build">3. Build a form your way</a
        ><a href="/guide#logic">4. Conditional visibility</a
        ><a href="/guide#publish">5. Publish, share and close</a
        ><a href="/guide#respond">6. Submit a response</a
        ><a href="/guide#collaborate">7. Invite your team</a
        ><a href="/guide#results">8. Responses, analytics and exports</a
        ><a href="/guide#templates">9. Templates and community library</a
        ><a href="/guide#privacy">10. Privacy and responsible collection</a
        ><a href="/guide#troubleshoot">11. Troubleshooting</a
        ><a href="/guide#admin">12. Administration and hosting</a>
      </aside>
      <div class="guide-content">
        <article id="start">
          <span class="eyebrow">01 / USER GUIDE</span>
          <h2>Your first form in five steps</h2>
          <ol>
            <li>
              Create an account with your name, email and a password of at least
              10 characters.
            </li>
            <li>
              Open My workspace and choose Create a form, or start from
              Templates.
            </li>
            <li>Name the form, add and configure questions, then Save form.</li>
            <li>Check Preview, then Publish form and Copy public link.</li>
            <li>Share the link. Open Responses to view incoming answers.</li>
          </ol>
          <div class="notice">
            Saving alone keeps a new form private. Only published forms accept
            responses.
          </div>
        </article>
        <article id="account">
          <span class="eyebrow">02 / USER GUIDE</span>
          <h2>Account, login and password</h2>
          <p>
            Choose Get started to register, or Log in to return. Email addresses
            are case-insensitive. Use a unique password of at least 10
            characters. Click your initial in the navigation to change your name
            or password. A password change requires your current password and
            signs out other sessions.
          </p>
          <p>
            Sign out on shared devices. Sessions last seven days.
            Forgotten-password email recovery is not configured in this release.
            If you cannot sign in, check your email and password or contact the
            deployment operator, who must verify your identity before helping
            with recovery.
          </p>
        </article>
        <article id="build">
          <span class="eyebrow">03 / USER GUIDE</span>
          <h2>Build a form your way</h2>
          <p>
            The palette on the left adds fields; the middle is your form;
            settings are on the right. Click a field type to add it. Drag its
            dotted handle or use up/down buttons to reorder. The × button
            removes a question.
          </p>
          <p>
            Enter a label and optional help text. Enable Required question if an
            answer is needed. For selection questions, enter one unique,
            nonempty choice per line.
          </p>
          <table>
            <tr>
              <th>Field</th>
              <th>Purpose</th>
            </tr>
            <tr>
              <td>Short text / Long text</td>
              <td>
                Short answers or detailed comments, with optional length limits.
              </td>
            </tr>
            <tr>
              <td>Email / Number / Date</td>
              <td>
                Validated email, numeric value with optional range, or a
                calendar date.
              </td>
            </tr>
            <tr>
              <td>Single choice / Dropdown</td>
              <td>One selection from your choices.</td>
            </tr>
            <tr>
              <td>Checkboxes</td>
              <td>
                Multiple selections. Required means at least one selection.
              </td>
            </tr>
            <tr>
              <td>File upload</td>
              <td>
                PDF, PNG, JPEG or text, up to 1 MB per file. Total submission
                request limit: 12 MB.
              </td>
            </tr>
            <tr>
              <td>Masked text</td>
              <td>
                Visually masks an answer. Never use this to collect account
                passwords. Authorized exports include the value.
              </td>
            </tr>
            <tr>
              <td>Information / Link</td>
              <td>
                Instructions without answers, or an HTTP/HTTPS link entered in
                the help-text field.
              </td>
            </tr>
          </table>
          <p>
            Choose the accent color and confirmation message in settings. Save
            explicitly after changes: there is no autosave. Preview does not
            store answers. Wait for “All changes saved” before navigating away.
          </p>
        </article>
        <article id="logic">
          <span class="eyebrow">04 / USER GUIDE</span>
          <h2>Conditional visibility</h2>
          <p>
            Expand Conditional visibility on any question after the first.
            Select an earlier source question, an operator, and a matching
            value. Equals and Does not equal compare case-sensitive answers.
            Contains checks text or a selected choice. Has an answer checks that
            the source is not empty. For checkboxes, Equals means the selected
            choices include that value.
          </p>
          <p>
            Example: ask “How will you attend?” with Online and In person. Show
            “Dietary requirements” only when the attendance answer equals “In
            person”.
          </p>
          <p>
            Hidden questions are not required and are excluded from saved
            answers. A condition whose source is hidden also hides its question.
            Conditions must refer to earlier fields. Reordering or deleting a
            source can clear the condition; preview again afterwards.
          </p>
        </article>
        <article id="publish">
          <span class="eyebrow">05 / USER GUIDE</span>
          <h2>Publish, share and close</h2>
          <p>
            Save and choose Publish form. Only owners can publish, and at least
            one field is required. Copy public link to share using your
            preferred email or messaging service. Open public form to check it
            in a new tab. Respondents do not need accounts.
          </p>
          <p>
            Close responses ends collection but preserves answers. Publish again
            to reopen. Saved edits to published forms take effect immediately.
            Respondents viewing an older version must refresh and review answers
            before submitting.
          </p>
          <p>
            The public /f/ link shares questions. The /forms/ link is an editor
            link requiring permission. Responses remain available only to the
            owner and accepted collaborators.
          </p>
        </article>
        <article id="respond">
          <span class="eyebrow">06 / USER GUIDE</span>
          <h2>Submit a response</h2>
          <p>
            Open the shared link, read instructions, and complete visible
            required fields marked *. Submit response once and wait for
            confirmation. Correct highlighted errors and retry. Conditional
            questions change as you answer.
          </p>
          <p>
            Use supported files below 1 MB. If a form is not accepting
            responses, contact its owner. Respondents cannot edit a submitted
            response; ask the owner to delete an incorrect answer and submit
            again.
          </p>
          <p>
            If the connection fails after a save, retrying may create a
            duplicate. Ask the owner if you are unsure whether your response
            arrived.
          </p>
        </article>
        <article id="collaborate">
          <span class="eyebrow">07 / USER GUIDE</span>
          <h2>Invite your team</h2>
          <p>
            Owners enter an email under Collaborators, choose Viewer or Editor,
            and Invite collaborator. Invitations appear in the invited email
            account’s workspace after login or registration. No invitation email
            is sent by this release: tell the teammate to sign in and accept the
            invitation.
          </p>
          <table>
            <tr>
              <th>Role</th>
              <th>Permissions</th>
            </tr>
            <tr>
              <td>Owner</td>
              <td>
                Edit, publish, manage collaborators/templates, read/export and
                delete responses, delete the form.
              </td>
            </tr>
            <tr>
              <td>Editor</td>
              <td>
                Edit and save questions/settings, preview, read/export
                responses.
              </td>
            </tr>
            <tr>
              <td>Viewer</td>
              <td>Read form configuration, preview, read/export responses.</td>
            </tr>
          </table>
          <p>
            Invite the same email again to update its role. Remove access
            revokes permissions. The server enforces access on every request.
          </p>
          <p>
            Editors check for saved changes every 10 seconds. Conflicting saves
            are rejected to prevent silent overwriting. Copy unsaved text you
            need, Reload latest version, then reapply your changes.
            Collaboration uses shared access and version checks, not live
            keystroke merging.
          </p>
        </article>
        <article id="results">
          <span class="eyebrow">08 / USER GUIDE</span>
          <h2>Responses, analytics and exports</h2>
          <p>
            Choose View results in the workspace or Responses in the builder.
            Results refresh every 10 seconds, showing total responses, daily
            counts, choice distributions and number averages.
          </p>
          <p>
            Expand individual responses to read answers and download files. Each
            response keeps its original question definitions even when the form
            changes. Pages show 50 responses each.
          </p>
          <p>
            Download CSV exports all responses for spreadsheets or third-party
            analysis. File names appear in CSV; download file contents from
            individual responses. Masked-text answers are masked onscreen but
            included in exports. Owners can permanently delete a response.
            Deleting a form deletes every response; export first if you need a
            copy.
          </p>
        </article>
        <article id="templates">
          <span class="eyebrow">09 / USER GUIDE</span>
          <h2>Templates and community library</h2>
          <p>
            Templates includes event registration, customer feedback and
            research starters. Use template creates a separate draft with your
            ownership.
          </p>
          <p>
            Owners can Save as template in the builder. Leave “Share in
            community library” unchecked for a private template, or check it to
            share questions with all signed-in users. Templates include no
            responses or collaborator access. Deleting a template does not
            affect forms already created from it.
          </p>
        </article>
        <article id="privacy">
          <span class="eyebrow">10 / USER GUIDE</span>
          <h2>Privacy and responsible collection</h2>
          <p>
            Collect only necessary information and explain your purpose in the
            description. Obtain consent where required. Never ask for account
            passwords, payment credentials or unnecessary sensitive information.
          </p>
          <p>
            Passwords are hashed and sessions use HTTP-only cookies. Production
            hosting must use HTTPS. Submission answers and file contents are
            encrypted in MongoDB using a server-managed key; account details and
            form definitions are not encrypted by this application. Authorized
            owners and collaborators can read and export responses.
          </p>
          <p>
            Remove access when no longer needed and delete responses according
            to your retention policy. The deployment operator manages backups;
            application deletion may not immediately remove backup copies.
            Contact the operator for account deletion requests.
          </p>
        </article>
        <article id="troubleshoot">
          <span class="eyebrow">11 / USER GUIDE</span>
          <h2>Troubleshooting</h2>
          <h3>I cannot save</h3>
          <p>
            Check title, labels, unique choices and valid minimum/maximum
            limits. Resolve collaborator conflicts by loading the latest
            version.
          </p>
          <h3>I cannot see an invitation</h3>
          <p>
            Sign in with the exact invited email and refresh the workspace. Ask
            the owner to verify the address. No automatic invitation email is
            sent.
          </p>
          <h3>A question disappeared</h3>
          <p>
            Check conditional visibility and its source answer. Hidden answers
            are intentionally not saved.
          </p>
          <h3>The app asks me to sign in again</h3>
          <p>
            Your session may have expired, your password changed, or your
            account been disabled. Sign in again or contact the deployment
            operator.
          </p>
          <h3>The form is unavailable</h3>
          <p>
            Verify the public link and ask the owner whether responses are
            closed.
          </p>
        </article>
        <article id="admin">
          <span class="eyebrow">12 / USER GUIDE</span>
          <h2>Administration and hosting</h2>
          <p>
            An account matching ADMIN_EMAIL when it registers receives
            administrator access. Register that account before opening public
            access. The Account page allows admins to enable or disable other
            users. Disabling removes sessions but does not delete forms.
          </p>
          <p>
            The repository includes deployment instructions, Docker
            configuration and automated checks. Configure persistent MongoDB,
            the exact public APP_ORIGIN, HTTPS and a stable DATA_ENCRYPTION_KEY.
            Back up the key securely; losing it makes existing responses
            unreadable.
          </p>
          <p>
            GitHub hosts the source. Express requires a Node/container host;
            MongoDB Atlas or another MongoDB server stores data. The demo
            command uses a temporary database that is deleted on shutdown; it is
            not production hosting.
          </p>
        </article>
      </div>
    </section>`,
})
export class Guide {}
