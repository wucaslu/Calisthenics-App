import { expect, test, type Page } from "@playwright/test";

const storageKey = "calisthenics-skill-tree:v1";

async function waitForProfile(page: Page) {
  await expect(page.locator(".page-footer")).toContainText(
    "Progress saved on this device",
  );
}

async function navigate(page: Page, name: string) {
  if (
    (await page.locator(".menu-button").getAttribute("aria-expanded")) !==
    "true"
  )
    await page.locator(".menu-button").click();
  await page
    .locator("#main-navigation")
    .getByRole("button", { name, exact: true })
    .click();
}

async function expectTreeWithinLevel(page: Page, maximum: number) {
  const nodes = page.locator(".react-flow__node-skill");
  await expect(nodes.first()).toBeAttached();
  const levels = await nodes
    .locator(".difficulty")
    .evaluateAll((elements) =>
      elements.map((element) =>
        Number(
          element.getAttribute("aria-label")?.match(/Difficulty (\d+)/)?.[1],
        ),
      ),
    );
  expect(levels.length).toBeGreaterThan(0);
  expect(levels.every((level) => level >= 1 && level <= maximum)).toBe(true);
  await expect(page.locator(".tree-heading .count-pill")).toHaveText(
    `${levels.length} skills`,
  );
  // Every visible edge must join two visible nodes, including alternative routes.
  const ids = new Set(
    await nodes.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-id")),
    ),
  );
  const edges = await page
    .locator(".react-flow__edge")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("aria-label")),
    );
  for (const label of edges) {
    const endpoints = label?.match(/^Edge from (.+) to (.+)$/);
    expect(endpoints).not.toBeNull();
    expect(ids.has(endpoints![1])).toBe(true);
    expect(ids.has(endpoints![2])).toBe(true);
  }
}

test("maximum level hides harder skills, their alternative ancestors, and the selected details", async ({
  page,
}) => {
  await page.goto("/");
  await waitForProfile(page);
  const maximum = page.getByRole("combobox", {
    name: "Maximum skill level",
    exact: true,
  });
  await expect(maximum).toHaveValue("10");
  await expect(
    page
      .locator(".detail-panel")
      .getByRole("heading", { name: "Tuck Planche", exact: true, level: 2 }),
  ).toBeVisible();
  await maximum.selectOption("3");
  await expect(page.locator(".detail-panel")).toHaveCount(0);
  await expect(page.locator('[data-id="tuck-planche"]')).toHaveCount(0);
  await expect(page.locator('[data-id="full-planche"]')).toHaveCount(0);
  await expectTreeWithinLevel(page, 3);
  const goalPaths = page.getByRole("button", {
    name: "Goal paths",
    exact: true,
  });
  await goalPaths.click();
  await goalPaths.click();
  await expectTreeWithinLevel(page, 3);

  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("Pistol Squat Negative");
  await expect(
    page.locator('[data-id="pistol-squat-negative"]'),
  ).toBeAttached();
  await expect(page.locator('[data-id="deep-step-up"]')).toBeAttached();
  // This valid level-3 skill has a harder level-4 alternative prerequisite.
  await expect(page.locator('[data-id="shrimp-squat"]')).toHaveCount(0);
  await expectTreeWithinLevel(page, 3);
  await maximum.selectOption("10");
  await expect(page.locator('[data-id="shrimp-squat"]')).toBeAttached();
});

test("level filtering composes with branches and searches without changing saved training data", async ({
  page,
}) => {
  const initial = {
    version: 2,
    progress: {
      "push-up": "mastered",
      "scapular-push-up": "mastered",
      "hollow-body-hold": "mastered",
      "planche-lean": "training",
    },
    personalRecords: { "tuck-planche": "4 seconds" },
    goals: ["full-planche"],
    equipment: ["floor", "parallettes"],
    archivedSkills: {},
    practiceLog: [
      {
        id: "existing-hold",
        skillId: "hollow-body-hold",
        date: "2026-10-06",
        sets: 3,
        holdSeconds: 20,
        notes: "Keep my practice history",
      },
    ],
  };
  await page.addInitScript(
    ({ key, profile }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(profile));
    },
    { key: storageKey, profile: initial },
  );
  await page.goto("/");
  await waitForProfile(page);
  const before = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
  const maximum = page.getByRole("combobox", {
    name: "Maximum skill level",
    exact: true,
  });
  await maximum.selectOption("3");
  await page.getByRole("button", { name: "Show Legs skills" }).click();
  await page
    .getByRole("combobox", { name: "Skill branch" })
    .selectOption("pistol-squat");
  await expect(maximum).toHaveValue("3");
  await expect(
    page.locator('[data-id="pistol-squat-negative"]'),
  ).toBeAttached();
  await expect(page.locator('[data-id="pistol-squat"]')).toHaveCount(0);
  await expectTreeWithinLevel(page, 3);
  await navigate(page, "Overview");
  await navigate(page, "Skill tree");
  await expect(maximum).toHaveValue("3");
  await expect(
    page.getByRole("combobox", { name: "Skill branch" }),
  ).toHaveValue("pistol-squat");

  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("Full Planche");
  await expect(
    page.getByRole("heading", { name: "No skills found", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".react-flow__node-skill")).toHaveCount(0);
  await maximum.selectOption("10");
  await expect(page.locator('[data-id="full-planche"]')).toBeAttached();
  await page.reload();
  await waitForProfile(page);
  await expect(maximum).toHaveValue("10");
  await expect(
    page
      .locator(".detail-panel")
      .getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toHaveValue("4 seconds");
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      storageKey,
    ),
  ).toEqual(before);
});

test("mobile level filtering limits cards and restores skills without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await waitForProfile(page);
  const maximum = page.getByRole("combobox", {
    name: "Maximum skill level",
    exact: true,
  });
  await maximum.selectOption("3");
  await navigate(page, "Skill tree");
  await page
    .getByRole("combobox", { name: "Skill group" })
    .selectOption("legs");
  await page
    .getByRole("combobox", { name: "Skill branch" })
    .selectOption("pistol-squat");
  const negative = page.locator(".mobile-skill").filter({
    has: page.getByText("Pistol Squat Negative", { exact: true }),
  });
  await expect(negative).toBeVisible();
  await expect(
    page.locator(".mobile-skill").filter({
      has: page.getByText("Shrimp Squat", { exact: true }),
    }),
  ).toHaveCount(0);
  const levels = await page
    .locator(".mobile-skill .difficulty")
    .evaluateAll((elements) =>
      elements.map((element) =>
        Number(
          element.getAttribute("aria-label")?.match(/Difficulty (\d+)/)?.[1],
        ),
      ),
    );
  expect(levels.length).toBeGreaterThan(0);
  expect(levels.every((level) => level >= 1 && level <= 3)).toBe(true);
  await negative.click();
  await expect(
    page.getByRole("dialog").getByRole("heading", {
      name: "Pistol Squat Negative",
      exact: true,
      level: 2,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await maximum.selectOption("1");
  await expect(negative).toHaveCount(0);
  await maximum.selectOption("3");
  await expect(negative).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Skill branch" }),
  ).toHaveValue("pistol-squat");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("Full Planche");
  await expect(
    page.getByRole("heading", { name: "No skills found", exact: true }),
  ).toBeVisible();
  await maximum.selectOption("10");
  await expect(
    page.locator(".mobile-skill").filter({
      has: page.getByText("Full Planche", { exact: true }),
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
