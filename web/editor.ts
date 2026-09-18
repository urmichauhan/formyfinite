import {
  Component,
  inject,
  signal,
  HostListener,
  OnDestroy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink, Router, ActivatedRoute } from "@angular/router";
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { Api, blank, Survey, Question } from "./core";
import { Fields } from "./respond";
@Component({
  imports: [FormsModule, RouterLink, DragDropModule, Fields],
  template: `<section class="editor-shell">
    <div class="editor-top">
      <div>
        <a routerLink="/workspace">← Workspace</a>
        <h2>
          {{ survey.title }}
          <span class="badge" [class.live]="survey.state === 'published'">{{
            survey.state
          }}</span>
        </h2>
      </div>
      <div class="actions">
        <button class="button light small" (click)="preview = !preview">
          {{ preview ? "Back to editing" : "Preview" }}
        </button>
        @if (survey._id) {
          <a class="button light small" [routerLink]="['/results', survey._id]"
            >Responses ↗</a
          >
        }
        @if (editable()) {
          <button class="button small" [disabled]="busy()" (click)="save()">
            {{ busy() ? "Saving…" : "Save form" }}
          </button>
        }
      </div>
    </div>
    @if (message()) {
      <div class="notice" role="status">{{ message() }}</div>
    }
    @if (error()) {
      <div class="alert" role="alert">
        {{ error() }}
        @if (conflict) {
          <button class="plain" (click)="reload()">
            Reload latest version
          </button>
        }
      </div>
    }
    @if (preview) {
      <div class="public-card preview">
        <span class="badge">PREVIEW · ANSWERS ARE NOT SAVED</span>
        <h1>{{ survey.title }}</h1>
        <p>{{ survey.description }}</p>
        <survey-fields
          [survey]="survey"
          [preview]="true"
          (complete)="message.set('Preview complete. Nothing was submitted.')"
        />
      </div>
    } @else {
      <div class="editor-grid">
        <aside class="palette">
          <span class="eyebrow">YOUR BUILDING BLOCKS</span>
          <h3>Add a question</h3>
          <p>Click to add. Drag to reorder.</p>
          <div class="palette-buttons">
            @for (t of types; track t.kind) {
              <button [disabled]="!editable()" (click)="add(t.kind)">
                <span>{{ t.icon }}</span
                >{{ t.name }}
              </button>
            }
          </div>
          <div class="tip">
            <strong>✦ Keep it conversational.</strong>
            <p>A little context helps people give better answers.</p>
          </div>
        </aside>
        <div class="canvas">
          <div class="card form-intro">
            <label
              >Form title<input
                [(ngModel)]="survey.title"
                [disabled]="!editable()"
                maxlength="160" /></label
            ><label
              >Description<textarea
                [(ngModel)]="survey.description"
                [disabled]="!editable()"
                maxlength="2000"
                placeholder="Tell people what this form is about."
              ></textarea>
            </label>
          </div>
          <div cdkDropList (cdkDropListDropped)="drop($event)">
            @for (q of survey.fields; track q.id; let index = $index) {
              <article
                class="question-card"
                cdkDrag
                [cdkDragDisabled]="!editable()"
              >
                <div class="question-top">
                  <span cdkDragHandle class="handle">⠿</span
                  ><span class="badge">{{ index + 1 }} · {{ q.kind }}</span>
                  @if (editable()) {
                    <div class="actions">
                      <button
                        class="icon-button"
                        aria-label="Move question up"
                        [disabled]="index === 0"
                        (click)="move(index, -1)"
                      >
                        ↑</button
                      ><button
                        class="icon-button"
                        aria-label="Move question down"
                        [disabled]="index === survey.fields.length - 1"
                        (click)="move(index, 1)"
                      >
                        ↓</button
                      ><button
                        class="icon-button danger"
                        aria-label="Delete question"
                        (click)="remove(index)"
                      >
                        ×
                      </button>
                    </div>
                  }
                </div>
                <fieldset [disabled]="!editable()">
                  <label
                    >Question label<input
                      [(ngModel)]="q.label"
                      maxlength="200" /></label
                  ><label
                    >{{
                      q.kind === "link"
                        ? "Link address (https://…)"
                        : "Help text"
                    }}<input [(ngModel)]="q.hint" maxlength="1000"
                  /></label>
                  @if (["radio", "checkbox", "select"].includes(q.kind)) {
                    <label
                      >Choices, one per line<textarea
                        [ngModel]="
                          q.choices.join(
                            '
'
                          )
                        "
                        (ngModelChange)="
                          q.choices =
                            $event.split(
                              '
'
                            )
                        "
                        rows="3"
                      ></textarea>
                    </label>
                  }
                  @if (!["info", "link"].includes(q.kind)) {
                    <label class="inline-check"
                      ><input
                        type="checkbox"
                        [(ngModel)]="q.required"
                      />Required answer</label
                    >
                  }
                  @if (
                    ["text", "textarea", "number", "password"].includes(q.kind)
                  ) {
                    <div class="columns two">
                      <label
                        >{{
                          q.kind === "number"
                            ? "Minimum value"
                            : "Minimum length"
                        }}<input type="number" [(ngModel)]="q.min" /></label
                      ><label
                        >{{
                          q.kind === "number"
                            ? "Maximum value"
                            : "Maximum length"
                        }}<input type="number" [(ngModel)]="q.max"
                      /></label>
                    </div>
                  }
                  @if (index > 0) {
                    <details>
                      <summary>Conditional visibility</summary>
                      <label
                        >Show this question when<select
                          [ngModel]="q.when?.field || ''"
                          (ngModelChange)="condition(q, $event)"
                        >
                          <option value="">Always visible</option>
                          @for (
                            previous of survey.fields.slice(0, index);
                            track previous.id
                          ) {
                            <option [value]="previous.id">
                              {{ previous.label }}
                            </option>
                          }
                        </select></label
                      >
                      @if (q.when) {
                        <div class="columns two">
                          <select
                            aria-label="Condition operator"
                            [(ngModel)]="q.when.operator"
                          >
                            <option value="equals">Equals</option>
                            <option value="differs">Does not equal</option>
                            <option value="contains">Contains</option>
                            <option value="answered">Has an answer</option>
                          </select>
                          @if (q.when.operator !== "answered") {
                            <input
                              aria-label="Matching answer"
                              [(ngModel)]="q.when.value"
                              placeholder="Answer to match"
                            />
                          }
                        </div>
                      }
                    </details>
                  }
                </fieldset>
              </article>
            } @empty {
              <div class="empty">
                <span>＋</span>
                <h3>Let’s ask your first question.</h3>
                <p>Choose a question type from the palette.</p>
              </div>
            }
          </div>
        </div>
        <aside class="settings">
          <h3>Make it yours</h3>
          <label
            >Accent color<input
              type="color"
              [(ngModel)]="survey.accent"
              [disabled]="!editable()" /></label
          ><label
            >Confirmation message<textarea
              [(ngModel)]="survey.confirmation"
              [disabled]="!editable()"
            ></textarea>
          </label>
          @if (survey._id && survey.access === "owner") {
            <hr />
            <h3>Share your form</h3>
            <p>Save and publish to start accepting answers.</p>
            <button class="button full" (click)="publish()" [disabled]="busy()">
              {{
                survey.state === "published"
                  ? "Close responses"
                  : "Publish form"
              }}
            </button>
            @if (survey.state === "published") {
              <a [routerLink]="['/f', survey._id]" target="_blank"
                >Open public form ↗</a
              ><button class="button light small full" (click)="copy()">
                Copy public link
              </button>
            }
            <hr />
            <h3>Invite your team</h3>
            <p>
              Invitations appear in your teammate’s workspace after they sign
              in.
            </p>
            <label
              >Collaborator email<input
                type="email"
                [(ngModel)]="inviteEmail" /></label
            ><label
              >Permission<select [(ngModel)]="inviteRole">
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select></label
            ><button class="button light small full" (click)="invite()">
              Invite collaborator
            </button>
            @for (m of survey.members; track m.email) {
              <div class="member">
                <strong>{{ m.email }}</strong
                ><small
                  >{{ m.role }} ·
                  {{ m.accepted ? "Accepted" : "Pending" }}</small
                ><button class="plain danger" (click)="revoke(m.email)">
                  Remove access
                </button>
              </div>
            }
            <hr />
            <h3>Use it again</h3>
            <label class="inline-check"
              ><input type="checkbox" [(ngModel)]="shareTemplate" />Share in
              community library</label
            ><button class="button light small full" (click)="template()">
              Save as template
            </button>
            <hr />
            <button class="plain danger" (click)="deleteForm()">
              Delete form and responses
            </button>
          } @else {
            <p class="tip">
              {{
                survey._id
                  ? "Your permission: " + survey.access
                  : "Save your form to unlock publishing and collaboration."
              }}
            </p>
          }
        </aside>
      </div>
    }
  </section>`,
})
export class Editor implements OnDestroy {
  api = inject(Api);
  route = inject(ActivatedRoute);
  router = inject(Router);
  survey = blank();
  snapshot = JSON.stringify(this.survey);
  busy = signal(false);
  message = signal("");
  error = signal("");
  preview = false;
  conflict = false;
  inviteEmail = "";
  inviteRole = "editor";
  shareTemplate = false;
  timer: any;
  types = [
    { kind: "text", name: "Short text", icon: "T" },
    { kind: "textarea", name: "Long text", icon: "☰" },
    { kind: "email", name: "Email", icon: "@" },
    { kind: "number", name: "Number", icon: "#" },
    { kind: "date", name: "Date", icon: "▦" },
    { kind: "radio", name: "Single choice", icon: "◉" },
    { kind: "checkbox", name: "Checkboxes", icon: "☑" },
    { kind: "select", name: "Dropdown", icon: "⌄" },
    { kind: "file", name: "File upload", icon: "↥" },
    { kind: "password", name: "Masked text", icon: "●" },
    { kind: "info", name: "Information", icon: "i" },
    { kind: "link", name: "Link", icon: "↗" },
  ];
  constructor() {
    const id = this.route.snapshot.params["id"];
    if (id) this.load(id);
    this.timer = setInterval(() => this.check(), 10000);
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }
  editable() {
    return ["owner", "editor"].includes(this.survey.access);
  }
  dirty() {
    return JSON.stringify(this.survey) !== this.snapshot;
  }
  leave() {
    return !this.dirty() || confirm("Leave without saving your changes?");
  }
  @HostListener("window:beforeunload", ["$event"]) unload(
    event: BeforeUnloadEvent,
  ) {
    if (this.dirty()) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
  adopt(s: Survey) {
    this.survey = s;
    this.snapshot = JSON.stringify(s);
  }
  async load(id: string) {
    try {
      this.adopt(await this.api.call("/forms/" + id));
      this.error.set("");
      this.conflict = false;
      this.message.set("All changes saved.");
    } catch (e: any) {
      this.survey.access = "unavailable";
      this.snapshot = JSON.stringify(this.survey);
      this.error.set(e.message);
    }
  }
  async check() {
    if (!this.survey._id || this.busy() || this.conflict) return;
    try {
      const s = await this.api.call("/forms/" + this.survey._id);
      if (s.revision !== this.survey.revision) {
        this.conflict = true;
        this.error.set(
          "Another session changed this form. Copy any unsaved notes before reloading.",
        );
      }
    } catch (e: any) {
      if (e.status === 403) {
        this.survey.access = "revoked";
        this.error.set("Your access has been removed.");
      }
    }
  }
  reload() {
    if (confirm("Replace unsaved changes with the latest saved form?"))
      this.load(this.survey._id!);
  }
  add(kind: string) {
    this.survey.fields.push({
      id: "q" + crypto.randomUUID().replaceAll("-", ""),
      kind,
      label: this.types.find((t) => t.kind === kind)!.name,
      hint: "",
      required: false,
      choices: ["radio", "checkbox", "select"].includes(kind)
        ? ["Option 1", "Option 2"]
        : [],
    });
  }
  remove(i: number) {
    this.survey.fields.splice(i, 1);
    this.fixConditions();
  }
  move(i: number, d: number) {
    moveItemInArray(this.survey.fields, i, i + d);
    this.fixConditions();
  }
  drop(event: CdkDragDrop<any>) {
    moveItemInArray(
      this.survey.fields,
      event.previousIndex,
      event.currentIndex,
    );
    this.fixConditions();
  }
  fixConditions() {
    const seen = new Set();
    for (const q of this.survey.fields) {
      if (q.when && !seen.has(q.when.field)) {
        q.when = null;
        this.message.set(
          "A condition was cleared because its source is no longer an earlier question.",
        );
      }
      seen.add(q.id);
    }
  }
  condition(q: Question, field: string) {
    q.when = field ? { field, operator: "equals", value: "" } : null;
  }
  async save() {
    this.busy.set(true);
    this.error.set("");
    try {
      const fresh = !this.survey._id;
      this.adopt(
        await this.api.call(
          fresh ? "/forms" : "/forms/" + this.survey._id,
          fresh ? "POST" : "PUT",
          this.survey,
        ),
      );
      this.message.set("All changes saved.");
      if (fresh)
        this.router.navigate(["/edit", this.survey._id], { replaceUrl: true });
      return true;
    } catch (e: any) {
      this.error.set(e.message);
      if (e.status === 409) this.conflict = true;
      return false;
    } finally {
      this.busy.set(false);
    }
  }
  async publish() {
    if (!(await this.save())) return;
    try {
      this.adopt(
        await this.api.call("/forms/" + this.survey._id + "/state", "PATCH", {
          state: this.survey.state === "published" ? "closed" : "published",
        }),
      );
      this.message.set(
        this.survey.state === "published"
          ? "Your form is published. Share the public link."
          : "Responses are now closed.",
      );
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async copy() {
    const url = location.origin + "/f/" + this.survey._id;
    try {
      await navigator.clipboard.writeText(url);
      this.message.set("Public link copied.");
    } catch {
      this.message.set(url);
    }
  }
  async invite() {
    if (!(await this.save())) return;
    try {
      this.adopt(
        await this.api.call("/forms/" + this.survey._id + "/members", "POST", {
          email: this.inviteEmail,
          role: this.inviteRole,
        }),
      );
      this.inviteEmail = "";
      this.message.set(
        "Invitation created. Your teammate can accept it in their workspace.",
      );
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async revoke(email: string) {
    if (!(await this.save())) return;
    try {
      this.adopt(
        await this.api.call(
          "/forms/" + this.survey._id + "/members/" + encodeURIComponent(email),
          "DELETE",
        ),
      );
      this.message.set("Access removed.");
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async template() {
    if (!(await this.save())) return;
    try {
      await this.api.call("/forms/" + this.survey._id + "/template", "POST", {
        shared: this.shareTemplate,
      });
      this.message.set("Template saved to the library.");
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async deleteForm() {
    if (!confirm("Permanently delete this form and all its responses?")) return;
    try {
      await this.api.call("/forms/" + this.survey._id, "DELETE");
      this.snapshot = JSON.stringify(this.survey);
      this.router.navigateByUrl("/workspace");
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
}
