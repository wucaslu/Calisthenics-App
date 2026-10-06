import { expect, test } from "@playwright/test";

test("blocked storage reports session-only progress and keeps training usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await expect(page.locator(".page-footer")).toContainText(
    "Storage unavailable — progress lasts for this session",
  );
  const panel = page.locator(".detail-panel");
  await panel
    .getByRole("button", { name: "Planche Lean", exact: true })
    .click();
  await panel.getByRole("button", { name: "Mark as Mastered" }).click();
  await expect(
    panel.getByRole("button", { name: "Skill mastered" }),
  ).toBeVisible();
});

test("demo profile loads, graph zooms, and mastery unlocks downstream skills and persists", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Build strength. Unlock skills." }),
  ).toBeVisible();
  await expect(page.locator(".stat-card").first()).toContainText("8");
  const panel = page.locator(".detail-panel");
  await expect(
    panel.getByRole("heading", { name: "Tuck Planche", exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeDisabled();
  // A readable initial goal path, rather than an off-center, tiny graph.
  const initialCanvas = await page.locator(".react-flow__pane").boundingBox();
  await expect
    .poll(
      async () =>
        (await page.locator('[data-id="group-push"]').boundingBox())?.y ?? -1,
    )
    .toBeGreaterThan(initialCanvas!.y);
  await expect
    .poll(
      async () =>
        (await page.locator('[data-id="tuck-planche"]').boundingBox())?.width ??
        0,
    )
    .toBeGreaterThan(135);
  const before = await page
    .locator(".react-flow__viewport")
    .getAttribute("style");
  await page.getByRole("button", { name: "Zoom In", exact: true }).click();
  await expect(page.locator(".react-flow__viewport")).not.toHaveAttribute(
    "style",
    before!,
  );
  const zoomed = await page
    .locator(".react-flow__viewport")
    .getAttribute("style");
  const canvas = await page.locator(".react-flow__pane").boundingBox();
  await page.mouse.move(
    canvas!.x + canvas!.width - 35,
    canvas!.y + canvas!.height - 65,
  );
  await page.mouse.down();
  await page.mouse.move(
    canvas!.x + canvas!.width - 75,
    canvas!.y + canvas!.height - 95,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(page.locator(".react-flow__viewport")).not.toHaveAttribute(
    "style",
    zoomed!,
  );
  await page.getByRole("button", { name: "Fit View", exact: true }).click();
  await expect
    .poll(async () => {
      const last = await page.locator('[data-id="full-planche"]').boundingBox();
      return last ? last.y + last.height : Number.POSITIVE_INFINITY;
    })
    .toBeLessThan(canvas!.y + canvas!.height);
  await panel
    .getByRole("button", { name: "Planche Lean", exact: true })
    .click();
  await expect(
    panel.getByRole("heading", { name: "Planche Lean", exact: true }),
  ).toBeVisible();
  await panel.getByRole("button", { name: "Mark as Mastered" }).click();
  await expect(page.getByRole("status")).toContainText("mastered");
  await panel
    .getByRole("button", { name: "Tuck Planche", exact: true })
    .click();
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeEnabled();
  await panel
    .getByRole("button", { name: "Start Training", exact: true })
    .click();
  await expect(
    panel.getByRole("button", { name: "Currently training" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    panel.getByRole("button", { name: "Currently training" }),
  ).toBeVisible();
  await panel
    .getByRole("button", { name: "Planche Lean", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Reset Progress", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Tuck Planche", exact: true })
    .click();
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});

test("goals can be selected and their minimal prerequisite paths update", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "My goals", exact: false })
    .first()
    .click();
  const planche = page.locator(".goal-path-card").filter({
    has: page.getByRole("heading", { name: "Tuck Planche", exact: true }),
  });
  await expect(planche).toContainText("2 remaining skills");
  await expect(planche.locator(".path-steps button")).toHaveCount(2);
  await page
    .getByRole("textbox", { name: "Search target skills" })
    .fill("pistol");
  await page
    .getByRole("button", { name: "Pistol Squat Legs", exact: true })
    .click();
  await expect(
    page.locator(".goal-path-card").filter({
      has: page.getByRole("heading", { name: "Pistol Squat", exact: true }),
    }),
  ).toContainText("5 remaining skills");
  await page
    .getByRole("button", { name: "Remove Pistol Squat from goals" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Pistol Squat", exact: true }),
  ).toHaveCount(0);
});

test("equipment filters recommendations without clearing mastered skills", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Equipment", exact: true }).click();
  const bar = page.locator(".equipment-card").filter({
    has: page.getByRole("heading", { name: "Pull-up bar", exact: true }),
  });
  await expect(bar).toHaveAttribute("aria-pressed", "true");
  await bar.click();
  await expect(bar).toHaveAttribute("aria-pressed", "false");
  await expect(
    page
      .locator(".recommendation-card")
      .filter({ hasText: "Tuck Front Lever" }),
  ).toHaveCount(0);
  await expect(page.locator(".stat-card").first()).toContainText("8");
  await page.reload();
  await page.getByRole("button", { name: "Equipment", exact: true }).click();
  await expect(bar).toHaveAttribute("aria-pressed", "false");
});

test("the four groups, global search, and dashboard are functional", async ({
  page,
}) => {
  await page.goto("/");
  for (const name of ["Pull", "Push", "Legs", "Core"])
    await expect(
      page.getByRole("button", { name: `Show ${name} skills` }),
    ).toBeVisible();
  await page.getByRole("button", { name: "Show Legs skills" }).click();
  await expect(page.locator(".react-flow__node-skill")).toHaveCount(6);
  await expect(page.getByRole("combobox", { name: "Skill group" })).toHaveValue(
    "legs",
  );
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("freestanding");
  await expect(page.getByRole("combobox", { name: "Skill group" })).toHaveValue(
    "all",
  );
  await expect(
    page.getByRole("button", { name: "Freestanding Handstand, Locked" }),
  ).toBeAttached();
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("not-a-skill");
  await expect(
    page.getByRole("heading", { name: "No skills found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Progress by group" }),
  ).toBeVisible();
  await expect(page.locator(".category-progress > div")).toHaveCount(4);
});

test("mobile lists, navigation, and skill dialog work without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".mobile-skill-list")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .locator(".mobile-skill")
    .filter({ hasText: "Planche Lean" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Planche Lean", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Close skill details" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("button", { name: "Show Legs skills" }).click();
  await expect(page.locator(".mobile-skill")).toHaveCount(6);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("corrupt local storage falls back to the demo without breaking the app", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("calisthenics-skill-tree:v1", "broken json"),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Build strength. Unlock skills." }),
  ).toBeVisible();
  await expect(page.locator(".stat-card").first()).toContainText("8");
  await expect(page.locator(".page-footer")).toContainText(
    "Progress saved on this device",
  );
});
