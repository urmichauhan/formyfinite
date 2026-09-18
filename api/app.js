import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import mongoose from "mongoose";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { z } from "zod";
import { Account, Session, Form, Response, Template } from "./models.js";
import { definition, answersFor, email, password, fail, csv } from "./rules.js";
import { hashPassword, matches, digest, vault } from "./security.js";
export function createApp({
  key = process.env.DATA_ENCRYPTION_KEY,
  origin = process.env.APP_ORIGIN || "http://localhost:3000",
  production = process.env.NODE_ENV === "production",
} = {}) {
  const store = vault(key),
    app = express();
  if (production) app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:"],
        },
      },
    }),
  );
  app.use(express.json({ limit: "12mb" }));
  app.use(cookieParser());
  app.use(
    "/api",
    rateLimit({
      windowMs: 60000,
      limit: 300,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  app.use("/api", (req, res, next) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      if (req.get("x-formyfinite") !== "1")
        return next(fail(403, "Missing request protection header"));
      const source = req.get("origin");
      if (
        source &&
        source !== origin &&
        !(source === "http://localhost:4200" && !production)
      )
        return next(fail(403, "Origin is not allowed"));
    }
    next();
  });
  const profile = (a) => ({
    id: String(a._id),
    name: a.name,
    email: a.email,
    admin: a.admin,
    disabled: a.disabled,
  });
  const authenticated = async (req, res, next) => {
    try {
      const session = await Session.findOne({
        digest: digest(req.cookies.formyfinite_session || ""),
        expires: { $gt: new Date() },
      });
      const account = session && (await Account.findById(session.account));
      if (!account || account.disabled) throw fail(401, "Please sign in");
      req.account = account;
      next();
    } catch (e) {
      next(e);
    }
  };
  async function signIn(res, account) {
    const token = randomBytes(32).toString("hex");
    await Session.create({
      digest: digest(token),
      account: account._id,
      expires: new Date(Date.now() + 604800000),
    });
    res
      .cookie("formyfinite_session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: production,
        maxAge: 604800000,
        path: "/",
      })
      .json(profile(account));
  }
  function access(f, a) {
    return String(f.owner) === String(a._id)
      ? "owner"
      : f.members.find((m) => m.email === a.email && m.accepted)?.role;
  }
  function present(f, a) {
    return { ...f.toObject(), access: access(f, a) };
  }
  async function permitted(req, level = "viewer") {
    if (!mongoose.isValidObjectId(req.params.id))
      throw fail(404, "Form not found");
    const f = await Form.findById(req.params.id);
    if (!f) throw fail(404, "Form not found");
    const role = access(f, req.account);
    if (
      !role ||
      (level === "owner" && role !== "owner") ||
      (level === "editor" && !["owner", "editor"].includes(role))
    )
      throw fail(403, "You do not have access to this action");
    return f;
  }
  async function update(f, values) {
    const result = await Form.findOneAndUpdate(
      { _id: f._id, revision: f.revision },
      { $set: values, $inc: { revision: 1 } },
      { new: true },
    );
    if (!result)
      throw fail(
        409,
        "The form changed in another session. Reload before saving.",
      );
    return result;
  }
  const credentials = z.object({ email, password });
  const loginLimit = rateLimit({
    windowMs: 900000,
    limit: 40,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  app.get("/api/health", (req, res) =>
    res
      .status(mongoose.connection.readyState === 1 ? 200 : 503)
      .json({
        status: mongoose.connection.readyState === 1 ? "ok" : "unavailable",
      }),
  );
  app.post("/api/accounts", loginLimit, async (req, res) => {
    const v = credentials
      .extend({ name: z.string().trim().min(2).max(80) })
      .parse(req.body);
    const a = await Account.create({
      ...v,
      password: await hashPassword(v.password),
      admin: v.email === process.env.ADMIN_EMAIL?.toLowerCase(),
    });
    await signIn(res, a);
  });
  app.post("/api/session", loginLimit, async (req, res) => {
    const v = credentials.parse(req.body);
    const a = await Account.findOne({ email: v.email });
    if (!a || a.disabled || !(await matches(v.password, a.password)))
      throw fail(401, "Email or password is incorrect");
    await signIn(res, a);
  });
  app.delete("/api/session", async (req, res) => {
    await Session.deleteOne({
      digest: digest(req.cookies.formyfinite_session || ""),
    });
    res.clearCookie("formyfinite_session", { path: "/" }).json({ ok: true });
  });
  app.get("/api/account", authenticated, (req, res) =>
    res.json(profile(req.account)),
  );
  app.patch("/api/account", authenticated, async (req, res) => {
    const v = z
      .object({
        name: z.string().trim().min(2).max(80),
        currentPassword: z.string().optional(),
        newPassword: password.optional(),
      })
      .parse(req.body);
    if (v.newPassword) {
      if (!(await matches(v.currentPassword || "", req.account.password)))
        throw fail(400, "Current password is incorrect");
      req.account.password = await hashPassword(v.newPassword);
      await Session.deleteMany({ account: req.account._id });
    }
    req.account.name = v.name;
    await req.account.save();
    if (v.newPassword) await signIn(res, req.account);
    else res.json(profile(req.account));
  });
  app.get("/api/forms", authenticated, async (req, res) => {
    const forms = await Form.find({
      $or: [
        { owner: req.account._id },
        {
          members: { $elemMatch: { email: req.account.email, accepted: true } },
        },
      ],
    }).sort({ updatedAt: -1 });
    res.json(
      await Promise.all(
        forms.map(async (f) => ({
          ...present(f, req.account),
          responses: await Response.countDocuments({ form: f._id }),
        })),
      ),
    );
  });
  app.post("/api/forms", authenticated, async (req, res) =>
    res
      .status(201)
      .json(
        present(
          await Form.create({
            ...definition.parse(req.body),
            owner: req.account._id,
          }),
          req.account,
        ),
      ),
  );
  app.get("/api/forms/:id", authenticated, async (req, res) =>
    res.json(present(await permitted(req), req.account)),
  );
  app.put("/api/forms/:id", authenticated, async (req, res) => {
    const f = await permitted(req, "editor");
    if (req.body.revision !== f.revision)
      throw fail(
        409,
        "The form changed in another session. Reload before saving.",
      );
    res.json(present(await update(f, definition.parse(req.body)), req.account));
  });
  app.patch("/api/forms/:id/state", authenticated, async (req, res) => {
    const f = await permitted(req, "owner");
    const state = z
      .enum(["draft", "published", "closed"])
      .parse(req.body.state);
    if (state === "published" && !f.fields.length)
      throw fail(400, "Add at least one question before publishing");
    res.json(present(await update(f, { state }), req.account));
  });
  app.delete("/api/forms/:id", authenticated, async (req, res) => {
    const f = await permitted(req, "owner");
    await Response.deleteMany({ form: f._id });
    await f.deleteOne();
    res.json({ ok: true });
  });
  const publicForm = async (id) => {
    if (!mongoose.isValidObjectId(id))
      throw fail(404, "This form is unavailable");
    const f = await Form.findOne({ _id: id, state: "published" });
    if (!f) throw fail(404, "This form is not accepting responses");
    return f;
  };
  app.get("/api/public/:id", async (req, res) => {
    const f = await publicForm(req.params.id);
    res.json({
      _id: f._id,
      title: f.title,
      description: f.description,
      accent: f.accent,
      confirmation: f.confirmation,
      fields: f.fields,
      revision: f.revision,
    });
  });
  app.post(
    "/api/public/:id/responses",
    rateLimit({ windowMs: 60000, limit: 20 }),
    async (req, res) => {
      const f = await publicForm(req.params.id);
      const submissionKey = z.uuid().parse(req.body.submissionKey);
      const old = await Response.findOne({ form: f._id, submissionKey });
      if (old) return res.json({ id: old._id, message: f.confirmation });
      if (req.body.revision !== f.revision)
        throw fail(
          409,
          "Questions changed. Refresh the form and review your answers.",
        );
      const answers = answersFor(f.fields, req.body.answers);
      let saved;
      try {
        saved = await Response.create({
          form: f._id,
          revision: f.revision,
          fields: f.fields,
          payload: store.seal(answers),
          submissionKey,
        });
      } catch (e) {
        if (e.code !== 11000) throw e;
        saved = await Response.findOne({ form: f._id, submissionKey });
      }
      res.status(201).json({ id: saved._id, message: f.confirmation });
    },
  );
  app.get("/api/forms/:id/responses", authenticated, async (req, res) => {
    const f = await permitted(req);
    const page = z.coerce
      .number()
      .int()
      .min(1)
      .max(100000)
      .parse(req.query.page || 1);
    const rows = await Response.find({ form: f._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * 50)
      .limit(50);
    res.json({
      page,
      total: await Response.countDocuments({ form: f._id }),
      rows: rows.map((r) => ({
        id: r._id,
        createdAt: r.createdAt,
        fields: r.fields,
        answers: store.open(r.payload),
      })),
    });
  });
  app.delete(
    "/api/forms/:id/responses/:responseId",
    authenticated,
    async (req, res) => {
      const f = await permitted(req, "owner");
      await Response.deleteOne({ _id: req.params.responseId, form: f._id });
      res.json({ ok: true });
    },
  );
  app.get("/api/forms/:id/analytics", authenticated, async (req, res) => {
    const f = await permitted(req);
    const daily = Object.create(null),
      questions = Object.create(null);
    let total = 0;
    for await (const row of Response.find({ form: f._id }).cursor()) {
      total++;
      const day = row.createdAt.toISOString().slice(0, 10);
      daily[day] = (daily[day] || 0) + 1;
      const values = store.open(row.payload);
      for (const q of row.fields) {
        const v = values[q.id];
        if (
          v === undefined ||
          !["number", "radio", "select", "checkbox", "date"].includes(q.kind)
        )
          continue;
        const stat = (questions[q.id] ??= {
          label: q.label,
          kind: q.kind,
          count: 0,
          sum: 0,
          choices: Object.create(null),
        });
        stat.count++;
        if (q.kind === "number") stat.sum += v;
        else
          for (const choice of Array.isArray(v) ? v : [v])
            stat.choices[choice] = (stat.choices[choice] || 0) + 1;
      }
    }
    res.json({ total, daily, questions });
  });
  app.get("/api/forms/:id/export.csv", authenticated, async (req, res) => {
    const f = await permitted(req);
    const columns = new Map();
    for await (const r of Response.find({ form: f._id })
      .select("fields")
      .cursor())
      for (const q of r.fields)
        if (!["info", "link"].includes(q.kind)) columns.set(q.id, q.label);
    res.type("text/csv").attachment("formyfinite-responses.csv");
    res.write(
      "\uFEFF" +
        ["Response ID", "Submitted at", ...columns.values()]
          .map(csv)
          .join(",") +
        "\r\n",
    );
    for await (const r of Response.find({ form: f._id }).cursor()) {
      const a = store.open(r.payload);
      res.write(
        [
          String(r._id),
          r.createdAt.toISOString(),
          ...[...columns.keys()].map((id) =>
            a[id]?.data ? `File: ${a[id].name}` : a[id],
          ),
        ]
          .map(csv)
          .join(",") + "\r\n",
      );
    }
    res.end();
  });
  app.post("/api/forms/:id/members", authenticated, async (req, res) => {
    const f = await permitted(req, "owner");
    const v = z
      .object({ email, role: z.enum(["viewer", "editor"]) })
      .parse(req.body);
    if (v.email === req.account.email)
      throw fail(400, "You already own this form");
    const members = f.members.map((m) => m.toObject());
    const m = members.find((m) => m.email === v.email);
    if (m) m.role = v.role;
    else members.push({ ...v, accepted: false });
    res.json(present(await update(f, { members }), req.account));
  });
  app.delete(
    "/api/forms/:id/members/:email",
    authenticated,
    async (req, res) => {
      const f = await permitted(req, "owner");
      res.json(
        present(
          await update(f, {
            members: f.members.filter((m) => m.email !== req.params.email),
          }),
          req.account,
        ),
      );
    },
  );
  app.get("/api/invitations", authenticated, async (req, res) =>
    res.json(
      (
        await Form.find({
          members: {
            $elemMatch: { email: req.account.email, accepted: false },
          },
        })
      ).map((f) => ({
        id: f._id,
        title: f.title,
        role: f.members.find((m) => m.email === req.account.email).role,
      })),
    ),
  );
  app.post("/api/invitations/:id", authenticated, async (req, res) => {
    const f = await Form.findOne({
      _id: req.params.id,
      members: { $elemMatch: { email: req.account.email, accepted: false } },
    });
    if (!f) throw fail(404, "Invitation not found");
    const members = f.members.map((m) => m.toObject());
    members.find((m) => m.email === req.account.email).accepted = true;
    await update(f, { members });
    res.json({ ok: true });
  });
  app.get("/api/templates", authenticated, async (req, res) =>
    res.json(
      await Template.find({
        $or: [{ owner: req.account._id }, { shared: true }],
      }).sort({ createdAt: -1 }),
    ),
  );
  app.post("/api/forms/:id/template", authenticated, async (req, res) => {
    const f = await permitted(req, "owner");
    res
      .status(201)
      .json(
        await Template.create({
          owner: req.account._id,
          title: f.title,
          description: f.description,
          fields: f.fields,
          shared: z.boolean().parse(req.body.shared),
        }),
      );
  });
  app.delete("/api/templates/:id", authenticated, async (req, res) => {
    const t = await Template.findOne({
      _id: req.params.id,
      owner: req.account._id,
    });
    if (!t) throw fail(404, "Template not found");
    await t.deleteOne();
    res.json({ ok: true });
  });
  app.get("/api/admin/accounts", authenticated, async (req, res) => {
    if (!req.account.admin) throw fail(403, "Administrator access required");
    res.json(
      (await Account.find().limit(200).sort({ createdAt: -1 })).map(profile),
    );
  });
  app.patch("/api/admin/accounts/:id", authenticated, async (req, res) => {
    if (!req.account.admin) throw fail(403, "Administrator access required");
    if (req.params.id === String(req.account._id))
      throw fail(400, "You cannot disable yourself");
    const disabled = z.boolean().parse(req.body.disabled);
    await Account.findByIdAndUpdate(req.params.id, { disabled });
    if (disabled) await Session.deleteMany({ account: req.params.id });
    res.json({ ok: true });
  });
  app.use("/api", (req, res) =>
    res.status(404).json({ message: "Endpoint not found" }),
  );
  app.use(express.static(resolve("dist/formyfinite/browser")));
  app.get("/{*path}", (req, res) =>
    res.sendFile(resolve("dist/formyfinite/browser/index.html")),
  );
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err instanceof z.ZodError)
      return res
        .status(400)
        .json({ message: err.issues.map((x) => x.message).join("; ") });
    if (err.code === 11000)
      return res
        .status(409)
        .json({ message: "This email is already registered" });
    if (err.name === "CastError")
      return res.status(400).json({ message: "Invalid identifier" });
    const status = err.status || 500;
    if (status === 500) console.error(err.message);
    res
      .status(status)
      .json({
        message:
          status === 500
            ? "Unable to complete the request. Please try again."
            : err.message,
        details: err.details,
      });
  });
  return app;
}
