import { test, expect } from "@playwright/test";
test("Register, build, publish, submit anonymously, and read results", async ({
  page,
  browser,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".hero")).toHaveCSS("display", "grid");
  await expect(
    page.getByRole("heading", { name: /Good questions/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Get started ↗", exact: true }).click();
  await page.getByLabel("Full name").fill("Demo Owner");
  await page
    .getByLabel("Email address")
    .fill(`owner-${Date.now()}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("demonstration-password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page
    .getByRole("link", { name: "＋ Create a form", exact: true })
    .click();
  await page
    .getByLabel("Form title", { exact: true })
    .fill("Community feedback");
  await page.getByRole("button", { name: "Short text", exact: false }).click();
  await page.getByLabel("Question or label").fill("Your name");
  await page.getByLabel("Required question").check();
  await page.getByRole("button", { name: "Save form", exact: true }).click();
  await expect(page.getByText("All changes saved.")).toBeVisible();
  await expect(page).toHaveURL(/forms\/[a-f0-9]+$/);
  const id = page.url().split("/").pop();
  await page
    .getByRole("button", { name: "Publish form ↗", exact: true })
    .click();
  await expect(
    page.getByText("Your form is live. Share the public link."),
  ).toBeVisible();
  const context = await browser.newContext();
  const respondent = await context.newPage();
  await respondent.goto("/f/" + id);
  await respondent.getByLabel("Your name").fill("Alex Respondent");
  await respondent.getByRole("button", { name: "Submit response" }).click();
  await expect(
    respondent.getByRole("heading", { name: "Response received." }),
  ).toBeVisible();
  await context.close();
  await page.getByRole("link", { name: "Responses ↗", exact: true }).click();
  await expect(page.getByText("1 total · Page 1")).toBeVisible();
  await page.locator(".response-detail summary").click();
  await expect(
    page.getByText("Alex Respondent", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Complete user guide", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your first form in five steps" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("Mobile landing and guide do not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/guide", "/login"]) {
    await page.goto(path);
    await expect(page.getByRole("heading").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("All field types, conditional visibility, attachments, and decimal numbers work in the browser", async ({
  page,
}) => {
  const headers = { "X-FormYfinite": "1" };
  await page.request.post("/api/auth/register", {
    headers,
    data: {
      name: "Field Tester",
      email: `fields-${Date.now()}@example.com`,
      password: "field-test-password",
    },
  });
  const field = (id, type, label, extra = {}) => ({
    id,
    type,
    label,
    required: true,
    ...extra,
  });
  const fields = [
    field("name", "text", "Your full name"),
    field("attend", "radio", "Attendance", {
      options: ["Online", "In person"],
    }),
    field("notes", "textarea", "Dietary details", {
      condition: { fieldId: "attend", operator: "equals", value: "In person" },
    }),
    field("topics", "checkbox", "Topics", {
      options: ["Technology", "Education"],
    }),
    field("category", "dropdown", "Category", {
      options: ["Student", "Professional"],
    }),
    field("date", "date", "Preferred date"),
    field("file", "file", "Supporting document"),
    field("number", "number", "Your rating", { min: 1, max: 5 }),
    field("email", "email", "Contact email"),
    field("masked", "password", "Masked demonstration text"),
    field("info", "info", "Please complete all visible fields", {
      required: false,
    }),
    field("link", "link", "Example website", {
      help: "https://example.com",
      required: false,
    }),
  ];
  const created = await page.request.post("/api/forms", {
    headers,
    data: { title: "Field type verification", fields },
  });
  expect(created.ok()).toBe(true);
  const f = await created.json();
  await page.request.patch(`/api/forms/${f._id}/status`, {
    headers,
    data: { status: "published" },
  });
  await page.goto(`/f/${f._id}`);
  await page.getByLabel("Your full name").fill("Alex");
  await page.getByLabel("Online", { exact: true }).check();
  await expect(page.getByLabel("Dietary details")).toHaveCount(0);
  await page.getByLabel("In person", { exact: true }).check();
  await page.getByLabel("Dietary details").fill("Vegetarian");
  await page.getByLabel("Technology", { exact: true }).check();
  await page.getByLabel("Category").selectOption("Student");
  await page.getByLabel("Preferred date").fill("2026-10-01");
  await page
    .getByLabel("Supporting document")
    .setInputFiles({
      name: "note.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Sample attachment"),
    });
  await page.getByLabel("Your rating").fill("4.5");
  await page.getByLabel("Contact email").fill("alex@example.com");
  await page.getByLabel("Masked demonstration text").fill("A test note");
  await expect(
    page.getByRole("link", { name: "Example website" }),
  ).toHaveAttribute("href", "https://example.com");
  await page.getByRole("button", { name: "Submit response" }).click();
  await expect(
    page.getByRole("heading", { name: "Response received." }),
  ).toBeVisible();
  const rows = await page.request.get(`/api/forms/${f._id}/submissions`);
  const data = await rows.json();
  expect(data.rows[0].answers.number).toBe(4.5);
  expect(data.rows[0].answers.notes).toBe("Vegetarian");
  expect(data.rows[0].answers.file.name).toBe("note.txt");
});

test("Invitation acceptance and viewer restrictions work across browser accounts", async ({
  page,
  browser,
}) => {
  const stamp = Date.now(),
    headers = { "X-FormYfinite": "1" };
  await page.request.post("/api/auth/register", {
    headers,
    data: {
      name: "Team Owner",
      email: `team-owner-${stamp}@example.com`,
      password: "team-owner-password",
    },
  });
  const response = await page.request.post("/api/forms", {
    headers,
    data: {
      title: "Team survey",
      fields: [{ id: "name", type: "text", label: "Name" }],
    },
  });
  const f = await response.json();
  await page.goto("/forms/" + f._id);
  await page.getByLabel("Email address").fill(`viewer-${stamp}@example.com`);
  await page.getByLabel("Access").selectOption("viewer");
  await page
    .getByRole("button", { name: "Invite collaborator", exact: true })
    .click();
  await expect(
    page.getByText("Invitation created.", { exact: false }),
  ).toBeVisible();
  const ctx = await browser.newContext({ baseURL: "http://localhost:3000" });
  await ctx.request.post("/api/auth/register", {
    headers,
    data: {
      name: "Team Viewer",
      email: `viewer-${stamp}@example.com`,
      password: "team-viewer-password",
    },
  });
  const collaborator = await ctx.newPage();
  await collaborator.goto("/dashboard");
  await collaborator.getByRole("button", { name: "Accept invitation" }).click();
  await collaborator
    .getByRole("heading", { name: "Team survey", exact: true })
    .click();
  await expect(collaborator.getByLabel("Form title")).toBeDisabled();
  await expect(
    collaborator.getByRole("button", { name: "Save form", exact: true }),
  ).toHaveCount(0);
  await collaborator.getByRole("link", { name: "Responses ↗" }).click();
  await expect(
    collaborator.getByRole("heading", { name: "Individual responses" }),
  ).toBeVisible();
  await ctx.close();
});
