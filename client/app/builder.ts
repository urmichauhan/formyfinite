import {
  Component,
  inject,
  signal,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Api, Field, FormModel, newForm } from './api';
import { Renderer } from './renderer';
@Component({
  imports: [FormsModule, RouterLink, DragDropModule, Renderer],
  template: `<section class="builder-page">
    <div class="builder-toolbar">
      <div>
        <a routerLink="/dashboard" class="back">← Workspace</a>
        <h2>
          {{ form.title }}
          <span class="status" [class.live]="form.status === 'published'">{{
            form.status
          }}</span>
        </h2>
      </div>
      <div class="actions">
        <button class="button secondary small" (click)="preview = !preview">
          {{ preview ? 'Back to editor' : 'Preview' }}
        </button>
        @if (form._id) {
          <a
            class="button secondary small"
            [routerLink]="['/forms', form._id, 'responses']"
            >Responses ↗</a
          >
        }
        @if (canEdit()) {
          <button class="button small" [disabled]="busy()" (click)="save()">
            {{ busy() ? 'Saving…' : 'Save form' }}
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
          <button class="text-button" (click)="reload()">
            Reload latest version
          </button>
        }
      </div>
    }
    @if (preview) {
      <div class="public-card preview">
        <span class="pill">PREVIEW · NO RESPONSE WILL BE SAVED</span>
        <h1>{{ form.title }}</h1>
        <p>{{ form.description }}</p>
        <form-renderer
          [form]="form"
          [preview]="true"
          (submitted)="previewDone()"
        />
      </div>
    } @else {
      <div class="builder-layout">
        <aside class="builder-palette">
          <span class="eyebrow">MAKE IT YOURS</span>
          <h3>Add a field</h3>
          <p>Click to add. Drag fields to reorder.</p>
          <div class="palette-grid">
            @for (t of types; track t.type) {
              <button [disabled]="!canEdit()" (click)="add(t.type)">
                <span>{{ t.icon }}</span
                >{{ t.label }}
              </button>
            }
          </div>
          <div class="tip">
            <strong>✦ A little logic goes a long way.</strong>
            <p>
              Show a question only when an earlier answer matches your
              condition.
            </p>
          </div>
        </aside>
        <div class="builder-canvas">
          <div class="panel form-title">
            <label
              >Form title<input
                aria-label="Form title"
                [(ngModel)]="form.title"
                [disabled]="!canEdit()"
                maxlength="200" /></label
            ><label
              >Description<textarea
                [(ngModel)]="form.description"
                [disabled]="!canEdit()"
                maxlength="2000"
                placeholder="Let people know what this form is about."
              ></textarea>
            </label>
          </div>
          <div cdkDropList (cdkDropListDropped)="drop($event)">
            @for (f of form.fields; track f.id; let i = $index) {
              <article
                class="field-card"
                cdkDrag
                [cdkDragDisabled]="!canEdit()"
              >
                <div class="field-card-top">
                  <span cdkDragHandle class="drag-handle">⠿</span
                  ><span class="pill">{{ i + 1 }} · {{ f.type }}</span>
                  <div class="actions">
                    @if (canEdit()) {
                      <button
                        class="icon-button"
                        (click)="move(i, -1)"
                        [disabled]="i === 0"
                        aria-label="Move field up"
                      >
                        ↑</button
                      ><button
                        class="icon-button"
                        (click)="move(i, 1)"
                        [disabled]="i === form.fields.length - 1"
                        aria-label="Move field down"
                      >
                        ↓</button
                      ><button
                        class="icon-button danger"
                        (click)="remove(i)"
                        aria-label="Delete field"
                      >
                        ×
                      </button>
                    }
                  </div>
                </div>
                <fieldset [disabled]="!canEdit()">
                  <label
                    >Question or label<input
                      [(ngModel)]="f.label"
                      maxlength="200" /></label
                  ><label
                    >{{
                      f.type === 'link' ? 'Link URL (https://…)' : 'Help text'
                    }}<input [(ngModel)]="f.help" maxlength="1000"
                  /></label>
                  @if (['radio', 'checkbox', 'dropdown'].includes(f.type)) {
                    <label
                      >Choices (one per line)<textarea
                        [ngModel]="
                          f.options.join(
                            '
'
                          )
                        "
                        (ngModelChange)="options(f, $event)"
                        rows="3"
                      ></textarea>
                    </label>
                  }
                  @if (!['info', 'link'].includes(f.type)) {
                    <label class="check-inline"
                      ><input
                        type="checkbox"
                        [(ngModel)]="f.required"
                      />Required question</label
                    >
                  }
                  @if (
                    ['text', 'textarea', 'password', 'number'].includes(f.type)
                  ) {
                    <div class="two-cols">
                      <label
                        >{{
                          f.type === 'number'
                            ? 'Minimum value'
                            : 'Minimum length'
                        }}<input type="number" [(ngModel)]="f.min" /></label
                      ><label
                        >{{
                          f.type === 'number'
                            ? 'Maximum value'
                            : 'Maximum length'
                        }}<input type="number" [(ngModel)]="f.max"
                      /></label>
                    </div>
                  }
                  @if (i > 0) {
                    <details>
                      <summary>Conditional visibility</summary>
                      <label
                        >Show this field when<select
                          [ngModel]="f.condition?.fieldId || ''"
                          (ngModelChange)="condition(f, $event)"
                        >
                          <option value="">Always visible</option>
                          @for (
                            prev of form.fields.slice(0, i);
                            track prev.id
                          ) {
                            <option [value]="prev.id">{{ prev.label }}</option>
                          }
                        </select></label
                      >
                      @if (f.condition) {
                        <div class="two-cols">
                          <select
                            aria-label="Condition operator"
                            [(ngModel)]="f.condition.operator"
                          >
                            <option value="equals">Equals</option>
                            <option value="notEquals">Does not equal</option>
                            <option value="contains">Contains</option>
                            <option value="notEmpty">Has an answer</option>
                          </select>
                          @if (f.condition.operator !== 'notEmpty') {
                            <input
                              aria-label="Condition value"
                              [(ngModel)]="f.condition.value"
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
              <div class="empty canvas-empty">
                <span>＋</span>
                <h3>Your form starts here.</h3>
                <p>Choose a field from the left to ask your first question.</p>
              </div>
            }
          </div>
        </div>
        <aside class="builder-settings">
          <h3>Form settings</h3>
          <label
            >Accent color<input
              type="color"
              [(ngModel)]="form.theme"
              [disabled]="!canEdit()" /></label
          ><label
            >Confirmation message<textarea
              [(ngModel)]="form.thankYou"
              [disabled]="!canEdit()"
            ></textarea>
          </label>
          @if (form._id && form.access === 'owner') {
            <hr />
            <h3>Share your form</h3>
            <p>Save your changes, then publish to accept responses.</p>
            <button class="button full" (click)="publish()">
              {{
                form.status === 'published'
                  ? 'Close responses'
                  : 'Publish form ↗'
              }}
            </button>
            @if (form.status === 'published') {
              <a [routerLink]="['/f', form._id]" target="_blank"
                >Open public form ↗</a
              ><button class="button secondary full small" (click)="copyLink()">
                Copy public link
              </button>
            }
            <hr />
            <h3>Collaborators</h3>
            <p>
              Invitations appear in your collaborator’s workspace after they
              sign in with this email.
            </p>
            <label
              >Email address<input
                type="email"
                [(ngModel)]="inviteEmail"
                placeholder="teammate@example.com" /></label
            ><label
              >Access<select [(ngModel)]="inviteRole">
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select></label
            ><button class="button secondary full small" (click)="invite()">
              Invite collaborator
            </button>
            @for (c of form.collaborators; track c.email) {
              <div class="collaborator">
                <strong>{{ c.email }}</strong
                ><small
                  >{{ c.role }} ·
                  {{ c.accepted ? 'Accepted' : 'Pending' }}</small
                ><button class="text-button danger" (click)="revoke(c.email)">
                  Remove access
                </button>
              </div>
            }
            <hr />
            <h3>Reuse this form</h3>
            <label class="check-inline"
              ><input type="checkbox" [(ngModel)]="sharedTemplate" />Share in
              community library</label
            ><button class="button secondary full small" (click)="template()">
              Save as template
            </button>
            <hr />
            <button class="text-button danger" (click)="destroy()">
              Delete form & responses
            </button>
          } @else if (!form._id) {
            <p class="tip">
              Save your form to unlock publishing, collaboration, and templates.
            </p>
          } @else {
            <p class="tip">
              Your access: {{ form.access }}. Only the owner can publish and
              manage collaborators.
            </p>
          }
        </aside>
      </div>
    }
  </section>`,
})
export class Builder implements OnDestroy {
  api = inject(Api);
  route = inject(ActivatedRoute);
  router = inject(Router);
  form: FormModel = newForm();
  error = signal('');
  message = signal('');
  busy = signal(false);
  preview = false;
  conflict = false;
  inviteEmail = '';
  inviteRole = 'editor';
  sharedTemplate = false;
  types = [
    { type: 'text', label: 'Short text', icon: 'T' },
    { type: 'textarea', label: 'Long text', icon: '☰' },
    { type: 'email', label: 'Email', icon: '@' },
    { type: 'number', label: 'Number', icon: '#' },
    { type: 'radio', label: 'Single choice', icon: '◉' },
    { type: 'checkbox', label: 'Checkboxes', icon: '☑' },
    { type: 'dropdown', label: 'Dropdown', icon: '⌄' },
    { type: 'date', label: 'Date', icon: '▦' },
    { type: 'file', label: 'File upload', icon: '↥' },
    { type: 'password', label: 'Masked text', icon: '●' },
    { type: 'info', label: 'Information', icon: 'i' },
    { type: 'link', label: 'Link', icon: '↗' },
  ];
  snapshot = JSON.stringify(this.form);
  @HostListener('window:beforeunload', ['$event']) beforeUnload(
    e: BeforeUnloadEvent,
  ) {
    if (this.dirty()) {
      e.preventDefault();
      e.returnValue = '';
    }
  }
  dirty() {
    return JSON.stringify(this.form) !== this.snapshot;
  }
  canLeave() {
    return (
      !this.dirty() ||
      confirm('You have unsaved changes. Leave without saving?')
    );
  }
  timer: any;
  constructor() {
    const id = this.route.snapshot.params['id'];
    if (id) this.load(id);
    this.timer = setInterval(() => this.checkVersion(), 10000);
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }
  canEdit() {
    return this.form.access === 'owner' || this.form.access === 'editor';
  }
  async load(id: string) {
    try {
      this.form = await this.api.request('/forms/' + id);
      this.snapshot = JSON.stringify(this.form);
      this.message.set('All changes saved.');
      this.conflict = false;
      this.error.set('');
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async checkVersion() {
    if (!this.form._id || this.busy() || this.conflict) return;
    try {
      const latest = await this.api.request('/forms/' + this.form._id);
      if (latest.version !== this.form.version) {
        this.conflict = true;
        this.error.set(
          'This form has changed in another session. Save your local notes, then reload the latest version.',
        );
      }
    } catch (e: any) {
      if (e.status === 403) {
        this.form.access = 'revoked';
        this.error.set('Your access to this form was removed.');
      }
    }
  }
  reload() {
    if (confirm('Replace your unsaved edits with the latest saved form?'))
      this.load(this.form._id!);
  }
  add(type: string) {
    this.form.fields.push({
      id: 'q_' + crypto.randomUUID().replaceAll('-', ''),
      type,
      label: this.types.find((t) => t.type === type)!.label,
      help: '',
      required: false,
      options: ['radio', 'checkbox', 'dropdown'].includes(type)
        ? ['Option 1', 'Option 2']
        : [],
    });
  }
  remove(i: number) {
    const id = this.form.fields[i].id;
    this.form.fields.splice(i, 1);
    this.form.fields.forEach((f) => {
      if (f.condition?.fieldId === id) f.condition = null;
    });
  }
  move(i: number, d: number) {
    moveItemInArray(this.form.fields, i, i + d);
    this.checkConditions();
  }
  drop(e: CdkDragDrop<any>) {
    moveItemInArray(this.form.fields, e.previousIndex, e.currentIndex);
    this.checkConditions();
  }
  checkConditions() {
    const seen = new Set();
    for (const f of this.form.fields) {
      if (f.condition && !seen.has(f.condition.fieldId)) {
        f.condition = null;
        this.message.set(
          'A condition was cleared because its source question moved after it.',
        );
      }
      seen.add(f.id);
    }
  }
  options(f: Field, s: string) {
    f.options = s.split('\n');
  }
  condition(f: Field, id: string) {
    f.condition = id ? { fieldId: id, operator: 'equals', value: '' } : null;
  }
  async save() {
    this.busy.set(true);
    this.error.set('');
    try {
      const isNew = !this.form._id;
      this.form = await this.api.request(
        isNew ? '/forms' : '/forms/' + this.form._id,
        isNew ? 'POST' : 'PUT',
        this.form,
      );
      this.snapshot = JSON.stringify(this.form);
      this.message.set('All changes saved.');
      if (isNew)
        this.router.navigate(['/forms', this.form._id], { replaceUrl: true });
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
      this.form = await this.api.request(
        '/forms/' + this.form._id + '/status',
        'PATCH',
        { status: this.form.status === 'published' ? 'closed' : 'published' },
      );
      this.snapshot = JSON.stringify(this.form);
      this.message.set(
        this.form.status === 'published'
          ? 'Your form is live. Share the public link.'
          : 'Responses are now closed.',
      );
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async copyLink() {
    try {
      await navigator.clipboard.writeText(
        location.origin + '/f/' + this.form._id,
      );
      this.message.set('Public link copied.');
    } catch {
      this.message.set(
        'Public link: ' + location.origin + '/f/' + this.form._id,
      );
    }
  }
  async invite() {
    if (!(await this.save())) return;
    try {
      this.form = await this.api.request(
        '/forms/' + this.form._id + '/collaborators',
        'POST',
        { email: this.inviteEmail, role: this.inviteRole },
      );
      this.snapshot = JSON.stringify(this.form);
      this.inviteEmail = '';
      this.message.set(
        'Invitation created. Your collaborator can accept it in their workspace.',
      );
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async revoke(email: string) {
    if (!(await this.save())) return;
    try {
      this.form = await this.api.request(
        '/forms/' +
          this.form._id +
          '/collaborators/' +
          encodeURIComponent(email),
        'DELETE',
      );
      this.snapshot = JSON.stringify(this.form);
      this.message.set('Access removed.');
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async template() {
    if (!(await this.save())) return;
    try {
      await this.api.request('/forms/' + this.form._id + '/template', 'POST', {
        shared: this.sharedTemplate,
      });
      this.message.set('Template saved. Find it in Templates.');
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  async destroy() {
    if (
      !confirm(
        'Permanently delete this form and every response? This cannot be undone.',
      )
    )
      return;
    try {
      await this.api.request('/forms/' + this.form._id, 'DELETE');
      this.snapshot = JSON.stringify(this.form);
      this.router.navigateByUrl('/dashboard');
    } catch (e: any) {
      this.error.set(e.message);
    }
  }
  previewDone() {
    this.message.set('Preview complete. No response was saved.');
  }
}
