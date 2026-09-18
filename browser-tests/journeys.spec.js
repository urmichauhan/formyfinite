import { test, expect } from "@playwright/test";
test("Create account, build and publish, submit anonymously, read results and guide", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero")).toHaveCSS("display", "grid");
  await page.getByRole("link", { name: "Start creating" }).click();
  await page.getByLabel("Full name").fill("Fresh Owner");
  await page
    .getByLabel("Email address")
    .fill(`owner-${Date.now()}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("fresh-testing-password");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/workspace/);
  await page
    .getByRole("link", { name: "＋ Create a form", exact: true })
    .click();
  await page.getByLabel("Form title").fill("Fresh feedback");
  await page.getByRole("button", { name: "Short text" }).click();
  await page.getByLabel("Question label").fill("Your name");
  await page.getByLabel("Required answer").check();
  await page.getByRole("button", { name: "Save form", exact: true }).click();
  await expect(page).toHaveURL(/edit\/[a-f0-9]+$/);
  await page.getByRole("button", { name: "Publish form", exact: true }).click();
  await expect(
    page.getByText("Your form is published. Share the public link."),
  ).toBeVisible();
  const id = page.url().split("/").pop();
  const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
  const respondent = await ctx.newPage();
  await respondent.goto("/f/" + id);
  await respondent.getByLabel("Your name").fill("Alex");
  await respondent.getByRole("button", { name: "Submit response" }).click();
  await expect(
    respondent.getByRole("heading", { name: "Thank you for sharing." }),
  ).toBeVisible();
  await ctx.close();
  await page.getByRole("link", { name: "Responses ↗" }).click();
  await expect(page.getByText("1 responses · Page 1")).toBeVisible();
  await page.locator(".response-item summary").click();
  await expect(page.getByText("Alex", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Complete user guide" }).click();
  await expect(
    page.getByRole("heading", { name: "Your first form" }),
  ).toBeVisible();
});
test("All 12 question kinds and conditional answers work", async ({ page }) => {
  const headers = { "X-FormYfinite": "1" };
  await page.request.post("/api/accounts", {
    headers,
    data: {
      name: "Fields Tester",
      email: `fields-${Date.now()}@example.com`,
      password: "field-testing-password",
    },
  });
  const q = (id, kind, extra = {}) => ({
    id,
    kind,
    label: id,
    required: true,
    ...extra,
  });
  const r = await page.request.post("/api/forms", {
    headers,
    data: {
      title: "Question gallery",
      fields: [
        q("Name", "text"),
        q("Attendance", "radio", { choices: ["Online", "In person"] }),
        q("Details", "textarea", {
          when: { field: "Attendance", operator: "equals", value: "In person" },
        }),
        q("Topics", "checkbox", { choices: ["Research", "Learning"] }),
        q("Category", "select", { choices: ["Student", "Teacher"] }),
        q("Date", "date"),
        q("Rating", "number", { min: 1, max: 5 }),
        q("Email", "email"),
        q("Attachment", "file"),
        q("Note", "password"),
        q("Instructions", "info", { required: false }),
        q("Website", "link", { required: false, hint: "https://example.com" }),
      ],
    },
  });
  expect(r.ok()).toBeTruthy();
  const f = await r.json();
  await page.request.patch(`/api/forms/${f._id}/state`, {
    headers,
    data: { state: "published" },
  });
  await page.goto("/f/" + f._id);
  await page.getByLabel("Name").fill("Alex");
  await page.getByLabel("Online", { exact: true }).check();
  await expect(page.getByLabel("Details")).toHaveCount(0);
  await page.getByLabel("In person", { exact: true }).check();
  await page.getByLabel("Details").fill("Vegetarian");
  await page.getByLabel("Research", { exact: true }).check();
  await page.getByLabel("Category").selectOption("Student");
  await page.getByLabel("Date").fill("2026-10-10");
  await page.getByLabel("Rating").fill("4.5");
  await page.getByLabel("Email").fill("alex@example.com");
  await page
    .getByLabel("Attachment")
    .setInputFiles({
      name: "note.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("A sample file"),
    });
  await page.getByLabel("Note").fill("A sample note");
  await expect(page.getByRole("link", { name: "Website" })).toHaveAttribute(
    "href",
    "https://example.com",
  );
  await page.getByRole("button", { name: "Submit response" }).click();
  await expect(
    page.getByRole("heading", { name: "Thank you for sharing." }),
  ).toBeVisible();
  const rows = await (
    await page.request.get(`/api/forms/${f._id}/responses`)
  ).json();
  expect(rows.rows[0].answers.Rating).toBe(4.5);
  expect(rows.rows[0].answers.Attachment.name).toBe("note.txt");
});
test("Invitations and viewer restrictions work in separate accounts", async ({
  page,
  browser,
}) => {
  const headers = { "X-FormYfinite": "1" },
    stamp = Date.now();
  await page.request.post("/api/accounts", {
    headers,
    data: {
      name: "Team Owner",
      email: `team-${stamp}@example.com`,
      password: "team-testing-password",
    },
  });
  const f = await (
    await page.request.post("/api/forms", {
      headers,
      data: {
        title: "Team form",
        fields: [{ id: "name", kind: "text", label: "Name" }],
      },
    })
  ).json();
  await page.goto("/edit/" + f._id);
  await page
    .getByLabel("Collaborator email")
    .fill(`viewer-${stamp}@example.com`);
  await page.getByLabel("Permission").selectOption("viewer");
  await page
    .getByRole("button", { name: "Invite collaborator", exact: true })
    .click();
  await expect(
    page.getByText("Invitation created.", { exact: false }),
  ).toBeVisible();
  const ctx = await browser.newContext({ baseURL: "http://localhost:3100" });
  await ctx.request.post("/api/accounts", {
    headers,
    data: {
      name: "Team Viewer",
      email: `viewer-${stamp}@example.com`,
      password: "viewer-testing-password",
    },
  });
  const viewer = await ctx.newPage();
  await viewer.goto("/workspace");
  await viewer.getByRole("button", { name: "Accept invitation" }).click();
  await viewer.getByRole("heading", { name: "Team form" }).click();
  await expect(viewer.getByLabel("Form title")).toBeDisabled();
  await expect(
    viewer.getByRole("button", { name: "Save form", exact: true }),
  ).toHaveCount(0);
  await ctx.close();
});
test("Mobile pages remain within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of ["/", "/guide", "/login"]) {
    await page.goto(url);
    await expect(page.getByRole("heading").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
