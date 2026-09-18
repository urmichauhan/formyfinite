import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import {
  randomBytes,
  createHash,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import path from "node:path";
import mongoose from "mongoose";
import { z } from "zod";
import { User, Session, Form, Submission, Template } from "./models.js";
import { formSchema, validateAnswers, csvCell } from "./validation.js";
const hash = (t) => createHash("sha256").update(t).digest("hex");
const fail = (status, message) => Object.assign(new Error(message), { status });
const safeUser = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
  disabled: u.disabled,
});
export function createApp({
  origin = process.env.APP_ORIGIN || "http://localhost:3000",
  production = process.env.NODE_ENV === "production",
  encryptionKey = process.env.DATA_ENCRYPTION_KEY,
} = {}) {
  if (!/^[a-f0-9]{64}$/i.test(encryptionKey || ""))
    throw Error("DATA_ENCRYPTION_KEY must be 64 hex characters");
  const key = Buffer.from(encryptionKey, "hex");
  function encrypt(value) {
    const iv = randomBytes(12),
      c = createCipheriv("aes-256-gcm", key, iv);
    return {
      encrypted: true,
      iv: iv.toString("hex"),
      tag: null,
      data: Buffer.concat([
        c.update(JSON.stringify(value)),
        c.final(),
      ]).toString("base64"),
      ...{ tag: c.getAuthTag().toString("hex") },
    };
  }
  function decrypt(v) {
    const c = createDecipheriv("aes-256-gcm", key, Buffer.from(v.iv, "hex"));
    c.setAuthTag(Buffer.from(v.tag, "hex"));
    return JSON.parse(
      Buffer.concat([
        c.update(Buffer.from(v.data, "base64")),
        c.final(),
      ]).toString(),
    );
  }
  const app = express();
  if (production) app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:"],
          "frame-ancestors": ["'self'"],
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
      const o = req.get("origin");
      if (o && o !== origin && !(!production && o === "http://localhost:4200"))
        return next(fail(403, "Request origin is not allowed"));
      if (req.get("x-formyfinite") !== "1")
        return next(fail(403, "Missing request protection header"));
    }
    next();
  });
  const auth = async (req, res, next) => {
    try {
      const s = await Session.findOne({
        token: hash(req.cookies.fy_session || ""),
        expiresAt: { $gt: new Date() },
      });
      const u = s && (await User.findById(s.userId));
      if (!u || u.disabled) throw fail(401, "Please sign in");
      req.user = u;
      next();
    } catch (e) {
      next(e);
    }
  };
  const member = async (req, permission = "view") => {
    if (!mongoose.isValidObjectId(req.params.id))
      throw fail(404, "Form not found");
    const f = await Form.findById(req.params.id);
    if (!f) throw fail(404, "Form not found");
    const own = String(f.owner) === String(req.user._id);
    const c = f.collaborators.find(
      (c) => c.email === req.user.email && c.accepted,
    );
    if (
      !own &&
      (!c ||
        permission === "owner" ||
        (permission === "edit" && c.role !== "editor"))
    )
      throw fail(403, "You do not have permission for this action");
    return f;
  };
  const formView = (f, u) => ({
    ...f.toObject(),
    access:
      String(f.owner) === String(u._id)
        ? "owner"
        : f.collaborators.find((c) => c.email === u.email && c.accepted)?.role,
  });
  async function login(res, user) {
    const token = randomBytes(32).toString("hex");
    await Session.create({
      token: hash(token),
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    });
    res.cookie("fy_session", token, {
      httpOnly: true,
      secure: production,
      sameSite: "lax",
      maxAge: 7 * 86400000,
      path: "/",
    });
    res.json({ user: safeUser(user) });
  }
  const credentials = z.object({
    email: z
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    password: z
      .string()
      .min(10)
      .max(128)
      .refine(
        (s) => Buffer.byteLength(s, "utf8") <= 72,
        "Password must be at most 72 UTF-8 bytes",
      ),
  });
  const authLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: 30,
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
  app.post("/api/auth/register", authLimit, async (req, res) => {
    const v = credentials
      .extend({ name: z.string().trim().min(2).max(80) })
      .parse(req.body);
    const user = await User.create({
      ...v,
      password: await bcrypt.hash(v.password, 12),
      role:
        v.email === process.env.ADMIN_EMAIL?.toLowerCase() ? "admin" : "user",
    });
    await login(res, user);
  });
  app.post("/api/auth/login", authLimit, async (req, res) => {
    const v = credentials.parse(req.body);
    const u = await User.findOne({ email: v.email });
    if (!u || u.disabled || !(await bcrypt.compare(v.password, u.password)))
      throw fail(401, "Email or password is incorrect");
    await login(res, u);
  });
  app.get("/api/auth/me", auth, (req, res) =>
    res.json({ user: safeUser(req.user) }),
  );
  app.post("/api/auth/logout", async (req, res) => {
    await Session.deleteOne({ token: hash(req.cookies.fy_session || "") });
    res.clearCookie("fy_session", { path: "/" }).json({ ok: true });
  });
  app.patch("/api/auth/profile", auth, async (req, res) => {
    const v = z
      .object({
        name: z.string().trim().min(2).max(80),
        currentPassword: z.string().optional(),
        newPassword: z
          .string()
          .min(10)
          .max(128)
          .refine(
            (s) => Buffer.byteLength(s, "utf8") <= 72,
            "Password must be at most 72 UTF-8 bytes",
          )
          .optional(),
      })
      .parse(req.body);
    if (v.newPassword) {
      if (!(await bcrypt.compare(v.currentPassword || "", req.user.password)))
        throw fail(400, "Current password is incorrect");
      req.user.password = await bcrypt.hash(v.newPassword, 12);
      await Session.deleteMany({ userId: req.user._id });
    }
    req.user.name = v.name;
    await req.user.save();
    if (v.newPassword) await login(res, req.user);
    else res.json({ user: safeUser(req.user) });
  });
  app.get("/api/forms", auth, async (req, res) => {
    const fs = await Form.find({
      $or: [
        { owner: req.user._id },
        {
          collaborators: {
            $elemMatch: { email: req.user.email, accepted: true },
          },
        },
      ],
    }).sort({ updatedAt: -1 });
    res.json(
      await Promise.all(
        fs.map(async (f) => ({
          ...formView(f, req.user),
          responseCount: await Submission.countDocuments({ formId: f._id }),
        })),
      ),
    );
  });
  app.post("/api/forms", auth, async (req, res) => {
    const v = formSchema.parse(req.body);
    res
      .status(201)
      .json(
        formView(await Form.create({ ...v, owner: req.user._id }), req.user),
      );
  });
  app.get("/api/forms/:id", auth, async (req, res) =>
    res.json(formView(await member(req), req.user)),
  );
  app.put("/api/forms/:id", auth, async (req, res) => {
    await member(req, "edit");
    const v = formSchema.parse(req.body);
    const version = z.number().int().positive().parse(req.body.version);
    const f = await Form.findOneAndUpdate(
      { _id: req.params.id, version },
      { $set: v, $inc: { version: 1 } },
      { new: true },
    );
    if (!f)
      throw fail(
        409,
        "Another collaborator saved changes. Reload the latest version before saving.",
      );
    res.json(formView(f, req.user));
  });
  app.patch("/api/forms/:id/status", auth, async (req, res) => {
    const f = await member(req, "owner");
    const status = z
      .enum(["draft", "published", "closed"])
      .parse(req.body.status);
    if (status === "published" && !f.fields.length)
      throw fail(400, "Add at least one field before publishing");
    f.status = status;
    f.version++;
    await f.save();
    res.json(formView(f, req.user));
  });
  app.delete("/api/forms/:id", auth, async (req, res) => {
    const f = await member(req, "owner");
    await Submission.deleteMany({ formId: f._id });
    await f.deleteOne();
    res.json({ ok: true });
  });
  app.get("/api/public/forms/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      throw fail(404, "Form is unavailable");
    const f = await Form.findOne({ _id: req.params.id, status: "published" });
    if (!f) throw fail(404, "This form is not accepting responses");
    res.json({
      _id: f._id,
      title: f.title,
      description: f.description,
      fields: f.fields,
      theme: f.theme,
      thankYou: f.thankYou,
      version: f.version,
    });
  });
  app.post(
    "/api/public/forms/:id/submissions",
    rateLimit({ windowMs: 60000, limit: 15 }),
    async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id))
        throw fail(404, "Form is unavailable");
      const f = await Form.findOne({ _id: req.params.id, status: "published" });
      if (!f) throw fail(404, "This form is not accepting responses");
      if (req.body.version !== f.version)
        throw fail(
          409,
          "This form has changed. Refresh the page and check your answers.",
        );
      const answers = validateAnswers(f.fields, req.body.answers);
      const s = await Submission.create({
        formId: f._id,
        answers: encrypt(answers),
        fields: f.fields,
        formVersion: f.version,
      });
      res.status(201).json({ id: s._id, message: f.thankYou });
    },
  );
  app.get("/api/forms/:id/submissions", auth, async (req, res) => {
    const f = await member(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const rows = await Submission.find({ formId: f._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * 50)
      .limit(50);
    res.json({
      total: await Submission.countDocuments({ formId: f._id }),
      page,
      rows: rows.map((r) => ({ ...r.toObject(), answers: decrypt(r.answers) })),
    });
  });
  app.delete(
    "/api/forms/:id/submissions/:submissionId",
    auth,
    async (req, res) => {
      const f = await member(req, "owner");
      await Submission.deleteOne({
        _id: req.params.submissionId,
        formId: f._id,
      });
      res.json({ ok: true });
    },
  );
  app.get("/api/forms/:id/report", auth, async (req, res) => {
    const f = await member(req);
    const rows = await Submission.find({ formId: f._id }).sort({
      createdAt: 1,
    });
    const daily = Object.create(null),
      fields = Object.create(null);
    for (const r of rows) {
      const d = r.createdAt.toISOString().slice(0, 10);
      daily[d] = (daily[d] || 0) + 1;
      const a = decrypt(r.answers);
      for (const field of r.fields) {
        if (
          [
            "password",
            "file",
            "textarea",
            "text",
            "email",
            "info",
            "link",
          ].includes(field.type)
        )
          continue;
        const v = a[field.id];
        if (v == null) continue;
        const entry = (fields[field.id] ??= {
          label: field.label,
          type: field.type,
          counts: Object.create(null),
          sum: 0,
          count: 0,
        });
        if (field.type === "number") {
          entry.sum += v;
          entry.count++;
        } else
          for (const x of Array.isArray(v) ? v : [v])
            entry.counts[x] = (entry.counts[x] || 0) + 1;
      }
    }
    res.json({ total: rows.length, daily, fields, generatedAt: new Date() });
  });
  app.get("/api/forms/:id/export", auth, async (req, res) => {
    const f = await member(req);
    const rows = await Submission.find({ formId: f._id }).sort({
      createdAt: 1,
    });
    const columns = new Map();
    rows.forEach((r) =>
      r.fields.forEach((x) => {
        if (!["info", "link"].includes(x.type)) columns.set(x.id, x.label);
      }),
    );
    const cells = [["Submission ID", "Submitted at", ...columns.values()]];
    for (const r of rows) {
      const a = decrypt(r.answers);
      cells.push([
        String(r._id),
        r.createdAt.toISOString(),
        ...[...columns.keys()].map((id) =>
          a[id]?.data ? `[File: ${a[id].name}]` : a[id],
        ),
      ]);
    }
    res
      .type("text/csv")
      .attachment("responses.csv")
      .send(
        "\uFEFF" + cells.map((row) => row.map(csvCell).join(",")).join("\r\n"),
      );
  });
  app.post("/api/forms/:id/collaborators", auth, async (req, res) => {
    const f = await member(req, "owner");
    const v = z
      .object({
        email: z.email().transform((x) => x.toLowerCase()),
        role: z.enum(["viewer", "editor"]),
      })
      .parse(req.body);
    if (v.email === req.user.email)
      throw fail(400, "You already own this form");
    const existing = f.collaborators.find((c) => c.email === v.email);
    if (existing) existing.role = v.role;
    else f.collaborators.push({ ...v, accepted: false });
    f.version++;
    await f.save();
    res.json(formView(f, req.user));
  });
  app.delete("/api/forms/:id/collaborators/:email", auth, async (req, res) => {
    const f = await member(req, "owner");
    f.collaborators = f.collaborators.filter(
      (c) => c.email !== req.params.email,
    );
    f.version++;
    await f.save();
    res.json(formView(f, req.user));
  });
  app.get("/api/invitations", auth, async (req, res) =>
    res.json(
      (
        await Form.find({
          collaborators: {
            $elemMatch: { email: req.user.email, accepted: false },
          },
        })
      ).map((f) => ({
        id: f._id,
        title: f.title,
        role: f.collaborators.find((c) => c.email === req.user.email).role,
      })),
    ),
  );
  app.post("/api/invitations/:id/accept", auth, async (req, res) => {
    const f = await Form.findOne({
      _id: req.params.id,
      collaborators: { $elemMatch: { email: req.user.email, accepted: false } },
    });
    if (!f) throw fail(404, "Invitation not found");
    f.collaborators.find((c) => c.email === req.user.email).accepted = true;
    f.version++;
    await f.save();
    res.json({ ok: true });
  });
  app.get("/api/templates", auth, async (req, res) =>
    res.json(
      await Template.find({
        $or: [{ owner: req.user._id }, { shared: true }],
      }).sort({ createdAt: -1 }),
    ),
  );
  app.post("/api/forms/:id/template", auth, async (req, res) => {
    const f = await member(req, "owner");
    const shared = z.boolean().parse(req.body.shared);
    res
      .status(201)
      .json(
        await Template.create({
          title: f.title,
          description: f.description,
          fields: f.fields,
          owner: req.user._id,
          shared,
        }),
      );
  });
  app.delete("/api/templates/:id", auth, async (req, res) => {
    const t = await Template.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!t) throw fail(404, "Template not found");
    await t.deleteOne();
    res.json({ ok: true });
  });
  app.get("/api/admin/users", auth, async (req, res) => {
    if (req.user.role !== "admin")
      throw fail(403, "Administrator access required");
    res.json(
      (await User.find().sort({ createdAt: -1 }).limit(200)).map(safeUser),
    );
  });
  app.patch("/api/admin/users/:id", auth, async (req, res) => {
    if (req.user.role !== "admin")
      throw fail(403, "Administrator access required");
    if (req.params.id === String(req.user._id))
      throw fail(400, "You cannot disable yourself");
    const disabled = z.boolean().parse(req.body.disabled);
    await User.findByIdAndUpdate(req.params.id, { disabled });
    if (disabled) await Session.deleteMany({ userId: req.params.id });
    res.json({ ok: true });
  });
  app.use("/api", (req, res) =>
    res.status(404).json({ message: "API endpoint not found" }),
  );
  app.use(express.static(path.resolve("dist/formyfinite/browser")));
  app.get("/{*path}", (req, res) =>
    res.sendFile(path.resolve("dist/formyfinite/browser/index.html")),
  );
  app.use((err, req, res, next) => {
    if (err instanceof z.ZodError)
      return res
        .status(400)
        .json({ message: err.issues.map((i) => i.message).join("; ") });
    if (err.code === 11000)
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    if (err.name === "CastError")
      return res.status(400).json({ message: "Invalid identifier" });
    const status = err.status || 500;
    if (status === 500) console.error(err.message);
    res
      .status(status)
      .json({
        message:
          status === 500
            ? "Something went wrong. Please try again."
            : err.message,
        details: err.details,
      });
  });
  return app;
}
