import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { randomBytes, randomUUID } from "node:crypto";
import { createApp } from "../api/app.js";
import { Account, Response } from "../api/models.js";
let db, app, owner, editor, viewer, outsider, form;
const secure = (r) => r.set("X-FormYfinite", "1");
const question = (id, kind, extra = {}) => ({
  id,
  kind,
  label: id,
  required: false,
  ...extra,
});
before(async () => {
  db = await MongoMemoryServer.create();
  await mongoose.connect(db.getUri());
  app = createApp({ key: randomBytes(32).toString("hex") });
  owner = request.agent(app);
  editor = request.agent(app);
  viewer = request.agent(app);
  outsider = request.agent(app);
  for (const [a, name] of [
    [owner, "Owner"],
    [editor, "Editor"],
    [viewer, "Viewer"],
    [outsider, "Outsider"],
  ])
    await secure(a.post("/api/accounts"))
      .send({
        name,
        email: name.toLowerCase() + "@example.com",
        password: "testing-password-123",
      })
      .expect(200);
  await Response.init();
});
after(async () => {
  await mongoose.disconnect();
  if (db) await db.stop();
});
test("Authentication, CSRF and normalized email uniqueness", async () => {
  await request(app).get("/api/forms").expect(401);
  await request(app).post("/api/session").send({}).expect(403);
  await secure(request(app).post("/api/session"))
    .set("Origin", "https://untrusted.example")
    .send({})
    .expect(403);
  await secure(request(app).post("/api/accounts"))
    .send({
      name: "Duplicate",
      email: "OWNER@example.com",
      password: "testing-password-123",
    })
    .expect(409);
  await secure(request(app).post("/api/session"))
    .send({ email: "owner@example.com", password: "wrong-password" })
    .expect(401);
  const a = await Account.findOne({ email: "owner@example.com" });
  assert.notEqual(a.password, "testing-password-123");
});
test("All 12 question kinds persist, draft remains private", async () => {
  form = (
    await secure(owner.post("/api/forms"))
      .send({
        title: "Fresh form",
        fields: [
          question("name", "text", { required: true }),
          question("attendance", "radio", {
            required: true,
            choices: ["Online", "In person"],
          }),
          question("details", "textarea", {
            required: true,
            when: {
              field: "attendance",
              operator: "equals",
              value: "In person",
            },
          }),
          question("topics", "checkbox", { choices: ["A", "B"] }),
          question("category", "select", { choices: ["Student", "Staff"] }),
          question("date", "date"),
          question("rating", "number", { min: 1, max: 5 }),
          question("email", "email"),
          question("file", "file"),
          question("masked", "password"),
          question("info", "info"),
          question("link", "link", { hint: "https://example.com" }),
        ],
      })
      .expect(201)
  ).body;
  assert.equal(form.fields.length, 12);
  await request(app)
    .get("/api/public/" + form._id)
    .expect(404);
  await outsider.get("/api/forms/" + form._id).expect(403);
});
test("Invalid choices and forward conditions rejected", async () => {
  for (const fields of [
    [question("x", "radio", { choices: [] })],
    [question("__proto__", "text")],
    [
      question("x", "text", {
        when: { field: "y", operator: "equals", value: "a" },
      }),
    ],
  ])
    await secure(owner.post("/api/forms"))
      .send({ title: "Invalid", fields })
      .expect(400);
});
test("Invitations, role enforcement and optimistic editing", async () => {
  for (const [email, role] of [
    ["editor@example.com", "editor"],
    ["viewer@example.com", "viewer"],
  ])
    await secure(owner.post(`/api/forms/${form._id}/members`))
      .send({ email, role })
      .expect(200);
  await editor.get("/api/forms/" + form._id).expect(403);
  assert.equal((await editor.get("/api/invitations")).body.length, 1);
  for (const a of [editor, viewer])
    await secure(a.post("/api/invitations/" + form._id))
      .send({})
      .expect(200);
  form = (await owner.get("/api/forms/" + form._id)).body;
  await secure(viewer.put("/api/forms/" + form._id))
    .send(form)
    .expect(403);
  await secure(editor.patch(`/api/forms/${form._id}/state`))
    .send({ state: "published" })
    .expect(403);
  const saved = await secure(editor.put("/api/forms/" + form._id))
    .send({ ...form, title: "Edited together" })
    .expect(200);
  await secure(owner.put("/api/forms/" + form._id))
    .send(form)
    .expect(409);
  form = saved.body;
});
test("Conditional validation, current versions, encryption and duplicate retry protection", async () => {
  form = (
    await secure(owner.patch(`/api/forms/${form._id}/state`))
      .send({ state: "published" })
      .expect(200)
  ).body;
  await secure(request(app).post(`/api/public/${form._id}/responses`))
    .send({
      revision: form.revision,
      submissionKey: randomUUID(),
      answers: { name: "Alex", attendance: "In person" },
    })
    .expect(400);
  await secure(request(app).post(`/api/public/${form._id}/responses`))
    .send({ revision: 1, submissionKey: randomUUID(), answers: {} })
    .expect(409);
  const payload = {
    revision: form.revision,
    submissionKey: randomUUID(),
    answers: {
      name: "Alex",
      attendance: "Online",
      details: "Should be discarded",
      rating: 4.5,
      email: "alex@example.com",
      file: { name: "note.txt", data: "data:text/plain;base64,aGVsbG8=" },
    },
  };
  await secure(request(app).post(`/api/public/${form._id}/responses`))
    .send(payload)
    .expect(201);
  await secure(request(app).post(`/api/public/${form._id}/responses`))
    .send(payload)
    .expect(200);
  assert.equal(await Response.countDocuments(), 1);
  const record = await Response.findOne();
  assert.ok(!JSON.stringify(record.payload).includes("Alex"));
  const r = await viewer.get(`/api/forms/${form._id}/responses`).expect(200);
  assert.equal(r.body.rows[0].answers.rating, 4.5);
  assert.equal(r.body.rows[0].answers.details, undefined);
});
test("Bad emails, ranges, dates, choices and executable files rejected", async () => {
  for (const v of [
    { rating: 7 },
    { email: "bad" },
    { date: "2026-02-31" },
    { topics: ["Unknown"] },
    { file: { name: "x.html", data: "data:text/html;base64,WA==" } },
  ])
    await secure(request(app).post(`/api/public/${form._id}/responses`))
      .send({
        revision: form.revision,
        submissionKey: randomUUID(),
        answers: { name: "Alex", attendance: "Online", ...v },
      })
      .expect(400);
});
test("Reports and formula-safe CSV use actual responses", async () => {
  await secure(request(app).post(`/api/public/${form._id}/responses`))
    .send({
      revision: form.revision,
      submissionKey: randomUUID(),
      answers: { name: "=1+1", attendance: "Online", rating: 3.5 },
    })
    .expect(201);
  const r = await owner.get(`/api/forms/${form._id}/analytics`).expect(200);
  assert.equal(r.body.total, 2);
  assert.equal(r.body.questions.rating.sum / 2, 4);
  const csv = await owner.get(`/api/forms/${form._id}/export.csv`).expect(200);
  assert.match(csv.text, /'=1\+1/);
  await outsider.get(`/api/forms/${form._id}/analytics`).expect(403);
});
test("Template privacy and access revocation", async () => {
  const t = await secure(owner.post(`/api/forms/${form._id}/template`))
    .send({ shared: false })
    .expect(201);
  assert.equal((await outsider.get("/api/templates")).body.length, 0);
  assert.equal((await owner.get("/api/templates")).body.length, 1);
  await secure(outsider.delete("/api/templates/" + t.body._id)).expect(404);
  await secure(owner.post(`/api/forms/${form._id}/template`))
    .send({ shared: true })
    .expect(201);
  assert.equal((await outsider.get("/api/templates")).body.length, 1);
  await secure(
    owner.delete(`/api/forms/${form._id}/members/viewer%40example.com`),
  ).expect(200);
  await viewer.get(`/api/forms/${form._id}/responses`).expect(403);
});
test("Closing and owner deletion protect form lifecycle", async () => {
  await secure(owner.patch(`/api/forms/${form._id}/state`))
    .send({ state: "closed" })
    .expect(200);
  await request(app)
    .get("/api/public/" + form._id)
    .expect(404);
  await secure(editor.delete("/api/forms/" + form._id)).expect(403);
  await secure(owner.delete("/api/forms/" + form._id)).expect(200);
  assert.equal(await Response.countDocuments(), 0);
});
test("Password changes revoke old sessions and administrators disable users", async () => {
  const second = request.agent(app);
  await secure(second.post("/api/session"))
    .send({ email: "outsider@example.com", password: "testing-password-123" })
    .expect(200);
  await secure(outsider.patch("/api/account"))
    .send({
      name: "Updated",
      currentPassword: "testing-password-123",
      newPassword: "a-new-password-123",
    })
    .expect(200);
  await second.get("/api/account").expect(401);
  process.env.ADMIN_EMAIL = "admin@example.com";
  const admin = request.agent(app);
  await secure(admin.post("/api/accounts"))
    .send({
      name: "Admin",
      email: "admin@example.com",
      password: "admin-password-123",
    })
    .expect(200);
  delete process.env.ADMIN_EMAIL;
  const users = await admin.get("/api/admin/accounts").expect(200);
  await owner.get("/api/admin/accounts").expect(403);
  const target = users.body.find((p) => p.email === "outsider@example.com");
  await secure(admin.patch("/api/admin/accounts/" + target.id))
    .send({ disabled: true })
    .expect(200);
  await outsider.get("/api/account").expect(401);
  await secure(owner.delete("/api/session")).expect(200);
  await owner.get("/api/account").expect(401);
});
