import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { randomBytes } from "node:crypto";
import { createApp } from "../server/app.js";
import { Submission, Session, User } from "../server/models.js";
let mongo, app, owner, editor, viewer, stranger, form;
const protect = (r) => r.set("X-FormYfinite", "1");
const field = (id, type, label, extra = {}) => ({
  id,
  type,
  label,
  required: false,
  options: [],
  help: "",
  ...extra,
});
before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp({ encryptionKey: randomBytes(32).toString("hex") });
  owner = request.agent(app);
  editor = request.agent(app);
  viewer = request.agent(app);
  stranger = request.agent(app);
  for (const [agent, name] of [
    [owner, "owner"],
    [editor, "editor"],
    [viewer, "viewer"],
    [stranger, "stranger"],
  ]) {
    await protect(agent.post("/api/auth/register"))
      .send({
        name,
        email: name + "@example.com",
        password: "secure-test-password",
      })
      .expect(200);
  }
});
after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
test("Authentication, origin protection, and unique accounts", async () => {
  await request(app).get("/api/forms").expect(401);
  await request(app).post("/api/auth/login").send({}).expect(403);
  await protect(request(app).post("/api/auth/login"))
    .set("Origin", "https://evil.example")
    .send({})
    .expect(403);
  await protect(request(app).post("/api/auth/login"))
    .send({ email: "owner@example.com", password: "incorrect-password" })
    .expect(401);
  await protect(request(app).post("/api/auth/register"))
    .send({
      name: "Duplicate",
      email: "OWNER@example.com",
      password: "secure-test-password",
    })
    .expect(409);
  const db = await User.findOne({ email: "owner@example.com" });
  assert.notEqual(db.password, "secure-test-password");
  assert.ok(db.password.startsWith("$2"));
  const s = await Session.findOne();
  assert.equal(s.token.length, 64);
});
test("Create and persist all twelve field types; drafts stay private", async () => {
  const fields = [
    field("name", "text", "Name", { required: true, min: 2 }),
    field("attendance", "radio", "Attendance", {
      options: ["Online", "In person"],
      required: true,
    }),
    field("diet", "textarea", "Diet", {
      required: true,
      condition: {
        fieldId: "attendance",
        operator: "equals",
        value: "In person",
      },
    }),
    field("topics", "checkbox", "Topics", { options: ["A", "B"] }),
    field("category", "dropdown", "Category", {
      options: ["Research", "Event"],
    }),
    field("date", "date", "Date"),
    field("file", "file", "Attachment"),
    field("rating", "number", "Rating", { min: 1, max: 5 }),
    field("email", "email", "Email"),
    field("secret", "password", "Masked note"),
    field("intro", "info", "Information"),
    field("link", "link", "Website", { help: "https://example.com" }),
  ];
  const r = await protect(owner.post("/api/forms"))
    .send({ title: "Integration survey", description: "Test", fields })
    .expect(201);
  form = r.body;
  assert.equal(form.fields.length, 12);
  await request(app)
    .get("/api/public/forms/" + form._id)
    .expect(404);
  await stranger.get("/api/forms/" + form._id).expect(403);
  const list = await owner.get("/api/forms").expect(200);
  assert.equal(list.body.length, 1);
});
test("Definition validation rejects bad choices and forward condition references", async () => {
  await protect(owner.post("/api/forms"))
    .send({
      title: "Invalid",
      fields: [field("x", "radio", "X", { options: [] })],
    })
    .expect(400);
  await protect(owner.post("/api/forms"))
    .send({
      title: "Invalid",
      fields: [
        field("x", "text", "X", {
          condition: { fieldId: "later", operator: "equals", value: "x" },
        }),
      ],
    })
    .expect(400);
});
test("Invitations require acceptance; viewer and editor roles are enforced", async () => {
  for (const [email, role] of [
    ["editor@example.com", "editor"],
    ["viewer@example.com", "viewer"],
  ]) {
    form = (
      await protect(owner.post(`/api/forms/${form._id}/collaborators`))
        .send({ email, role })
        .expect(200)
    ).body;
  }
  await editor.get("/api/forms/" + form._id).expect(403);
  const invites = await editor.get("/api/invitations").expect(200);
  assert.equal(invites.body.length, 1);
  for (const a of [editor, viewer])
    await protect(a.post("/api/invitations/" + form._id + "/accept"))
      .send({})
      .expect(200);
  form = (await owner.get("/api/forms/" + form._id)).body;
  await protect(viewer.put("/api/forms/" + form._id))
    .send(form)
    .expect(403);
  await protect(editor.patch(`/api/forms/${form._id}/status`))
    .send({ status: "published" })
    .expect(403);
  const saved = await protect(editor.put("/api/forms/" + form._id))
    .send({ ...form, title: "Edited by collaborator" })
    .expect(200);
  await protect(owner.put("/api/forms/" + form._id))
    .send(form)
    .expect(409);
  form = saved.body;
});
test("Publishing, conditional validation, hidden answer removal, encrypted storage", async () => {
  form = (
    await protect(owner.patch(`/api/forms/${form._id}/status`))
      .send({ status: "published" })
      .expect(200)
  ).body;
  const pub = await request(app)
    .get("/api/public/forms/" + form._id)
    .expect(200);
  assert.equal(pub.body.owner, undefined);
  await protect(request(app).post(`/api/public/forms/${form._id}/submissions`))
    .send({
      version: form.version,
      answers: { name: "Alex", attendance: "In person" },
    })
    .expect(400);
  await protect(request(app).post(`/api/public/forms/${form._id}/submissions`))
    .send({ version: form.version - 1, answers: {} })
    .expect(409);
  const answers = {
    name: "Alex",
    attendance: "Online",
    diet: "HIDDEN",
    rating: 4,
    topics: ["A"],
    email: "alex@example.com",
    date: "2026-09-18",
    file: { name: "note.txt", data: "data:text/plain;base64,aGVsbG8=" },
    secret: "masked note",
  };
  await protect(request(app).post(`/api/public/forms/${form._id}/submissions`))
    .send({ version: form.version, answers })
    .expect(201);
  const stored = await Submission.findOne();
  assert.equal(stored.answers.encrypted, true);
  assert.ok(!JSON.stringify(stored.answers).includes("Alex"));
  const rows = await owner
    .get(`/api/forms/${form._id}/submissions`)
    .expect(200);
  assert.equal(rows.body.rows[0].answers.name, "Alex");
  assert.equal(rows.body.rows[0].answers.diet, undefined);
  await stranger.get(`/api/forms/${form._id}/submissions`).expect(403);
});
test("Reject invalid submissions and dangerous file content", async () => {
  for (const extra of [
    { rating: 9 },
    { email: "invalid" },
    { date: "2026-02-31" },
    { topics: ["C"] },
    { file: { name: "bad.html", data: "data:text/html;base64,PHNjcmlwdD4=" } },
  ])
    await protect(
      request(app).post(`/api/public/forms/${form._id}/submissions`),
    )
      .send({
        version: form.version,
        answers: { name: "Alex", attendance: "Online", ...extra },
      })
      .expect(400);
});
test("Analytics and CSV reflect real submissions and neutralize formulas", async () => {
  await protect(request(app).post(`/api/public/forms/${form._id}/submissions`))
    .send({
      version: form.version,
      answers: { name: "=SUM(1,2)", attendance: "Online", rating: 2 },
    })
    .expect(201);
  const r = await viewer.get(`/api/forms/${form._id}/report`).expect(200);
  assert.equal(r.body.total, 2);
  assert.equal(r.body.fields.rating.sum / r.body.fields.rating.count, 3);
  const csv = await owner.get(`/api/forms/${form._id}/export`).expect(200);
  assert.match(csv.text, /'=SUM/);
  assert.match(csv.text, /masked note/);
});
test("Templates copy definitions without submissions; role revocation takes effect", async () => {
  const t = await protect(owner.post(`/api/forms/${form._id}/template`))
    .send({ shared: true })
    .expect(201);
  assert.equal(t.body.fields.length, 12);
  assert.equal(t.body.answers, undefined);
  const ts = await stranger.get("/api/templates").expect(200);
  assert.equal(ts.body.length, 1);
  await protect(stranger.delete("/api/templates/" + t.body._id)).expect(404);
  await protect(
    owner.delete(`/api/forms/${form._id}/collaborators/viewer%40example.com`),
  ).expect(200);
  await viewer.get(`/api/forms/${form._id}/report`).expect(403);
});
test("Closing prevents submissions; deletion cascades; logout invalidates session", async () => {
  await protect(owner.patch(`/api/forms/${form._id}/status`))
    .send({ status: "closed" })
    .expect(200);
  await protect(request(app).post(`/api/public/forms/${form._id}/submissions`))
    .send({ version: form.version, answers: {} })
    .expect(404);
  await protect(editor.delete("/api/forms/" + form._id)).expect(403);
  await protect(owner.delete("/api/forms/" + form._id)).expect(200);
  assert.equal(await Submission.countDocuments({ formId: form._id }), 0);
  await protect(owner.post("/api/auth/logout")).send({}).expect(200);
  await owner.get("/api/forms").expect(401);
});

test("Password changes revoke other sessions; admins can disable accounts", async () => {
  const other = request.agent(app);
  await protect(other.post("/api/auth/login"))
    .send({ email: "stranger@example.com", password: "secure-test-password" })
    .expect(200);
  await protect(stranger.patch("/api/auth/profile"))
    .send({
      name: "Updated Stranger",
      currentPassword: "incorrect",
      newPassword: "new-secure-password",
    })
    .expect(400);
  await protect(stranger.patch("/api/auth/profile"))
    .send({
      name: "Updated Stranger",
      currentPassword: "secure-test-password",
      newPassword: "new-secure-password",
    })
    .expect(200);
  await other.get("/api/auth/me").expect(401);
  await stranger.get("/api/auth/me").expect(200);
  process.env.ADMIN_EMAIL = "admin@example.com";
  const admin = request.agent(app);
  await protect(admin.post("/api/auth/register"))
    .send({
      name: "Admin",
      email: "admin@example.com",
      password: "admin-secure-password",
    })
    .expect(200);
  delete process.env.ADMIN_EMAIL;
  const users = await admin.get("/api/admin/users").expect(200);
  const u = users.body.find((u) => u.email === "stranger@example.com");
  await stranger.get("/api/admin/users").expect(403);
  await protect(admin.patch("/api/admin/users/" + u.id))
    .send({ disabled: true })
    .expect(200);
  await stranger.get("/api/auth/me").expect(401);
  await protect(request(app).post("/api/auth/login"))
    .send({ email: u.email, password: "new-secure-password" })
    .expect(401);
});
