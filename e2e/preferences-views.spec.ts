import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import type { UserProfile } from "../src/types/skill";

const profileKey = "calisthenics-skill-tree:v1";
const accessibilityKey = "calisthenics-skill-tree:accessibility";
const themeKey = "calisthenics-skill-tree:theme";

function trainingProfile(): UserProfile {
  return {
    version: 2,
    progress: {
      "push-up": "mastered",
      "scapular-push-up": "mastered",
      "planche-lean": "training",
    },
    personalRecords: { "push-up": "13 clean reps" },
    goals: ["full-planche"],
    equipment: ["floor"],
    archivedSkills: {},
    practiceLog: [
      {
        id: "existing-session",
        skillId: "push-up",
        date: "2026-10-01",
        sets: 2,
        repetitions: 10,
        notes: "Completed practice is independent of display settings",
      },
    ],
    weeklySchedule: { monday: ["push-up", "planche-lean"] },
  };
}

function legacySavedView() {
  return {
    id: "planche-view",
    name: "Planche practice",
    group: "push",
    branch: "planche",
    query: "planche",
    maxDifficulty: 5,
    highlightPath: false,
    availableOnly: true,
    selectedSkillId: "planche-lean",
    viewport: { x: 47, y: -38, zoom: 0.45 },
  };
}

async function seed(page: Page, initial: unknown = trainingProfile()) {
  await page.clock.setFixedTime(new Date("2026-10-08T12:00:00+02:00"));
  await page.addInitScript(
    ({ key, profile }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(profile));
    },
    { key: profileKey, profile: initial },
  );
}

async function ready(page: Page) {
  await expect(page.locator(".page-footer")).toContainText(
    /Progress saved on this device|Storage unavailable/,
  );
}

async function navigate(page: Page, label: string) {
  await ready(page);
  const toggle = page.locator(".menu-button");
  if ((await toggle.getAttribute("aria-expanded")) !== "true")
    await toggle.click();
  await page
    .locator("#main-navigation")
    .getByRole("button", { name: label, exact: true })
    .click();
}

async function storedProfile(page: Page): Promise<UserProfile> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    profileKey,
  );
}

function preferences(page: Page) {
  return page.getByRole("region", {
    name: "Accessibility preferences",
    exact: true,
  });
}

async function expectNoOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.width + 1);
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.width + 1);
}

test.use({ timezoneId: "Europe/Berlin" });

test("accessibility follows system motion, persists independently, and synchronizes real browser tabs", async ({
  page,
  context,
}) => {
  await seed(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  const original = await storedProfile(page);
  await expect(page.locator("html")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await expect(page.locator(".react-flow__edge.animated")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-reduced-motion",
    "false",
  );
  await expect(
    page.locator(".react-flow__edge.animated").first(),
  ).toBeAttached();
  await navigate(page, "Preferences");
  const settings = preferences(page);
  await settings
    .getByRole("combobox", { name: "Motion", exact: true })
    .selectOption("reduce");
  await settings
    .getByRole("combobox", { name: "Contrast", exact: true })
    .selectOption("high");
  await settings
    .getByRole("combobox", { name: "Text size", exact: true })
    .selectOption("large");
  await settings
    .getByRole("checkbox", { name: "Use a skill list on desktop", exact: true })
    .check();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
  await expect(page.locator("html")).toHaveAttribute("data-text-size", "large");
  await expect(page.locator("html")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        accessibilityKey,
      ),
    )
    .toEqual({
      motion: "reduce",
      contrast: "high",
      textSize: "large",
      skillList: true,
    });
  expect(await storedProfile(page)).toEqual(original);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), themeKey),
  ).toBeNull();

  await navigate(page, "Skill tree");
  await expect(page.locator(".tree-canvas")).toHaveCount(0);
  const list = page.getByRole("region", {
    name: "Calisthenics skill list",
    exact: true,
  });
  const lean = list
    .getByRole("button")
    .filter({ has: page.getByText("Planche Lean", { exact: true }) });
  await lean.focus();
  await page.keyboard.press("Enter");
  await expect(
    page
      .locator(".detail-panel")
      .getByRole("heading", { name: "Planche Lean", exact: true }),
  ).toBeVisible();
  await expect(lean).toHaveAttribute("aria-pressed", "true");
  expect(await storedProfile(page)).toEqual(original);

  const other = await context.newPage();
  await other.goto("/");
  await navigate(other, "Preferences");
  await expect(
    preferences(other).getByRole("combobox", { name: "Contrast", exact: true }),
  ).toHaveValue("high");
  await preferences(other)
    .getByRole("button", {
      name: "Reset accessibility preferences",
      exact: true,
    })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-contrast",
    "standard",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-text-size",
    "standard",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-reduced-motion",
    "false",
  );
  await expect(page.locator(".tree-canvas")).toBeVisible();
  await navigate(page, "Preferences");
  await expect(
    settings.getByRole("checkbox", {
      name: "Use a skill list on desktop",
      exact: true,
    }),
  ).not.toBeChecked();
  await settings
    .getByRole("combobox", { name: "Contrast", exact: true })
    .selectOption("high");
  await page.reload();
  await navigate(page, "Preferences");
  await expect(
    settings.getByRole("combobox", { name: "Contrast", exact: true }),
  ).toHaveValue("high");
  expect(await storedProfile(page)).toEqual(original);
  await other.close();
});

test("large text and high contrast keep mobile controls and skill details usable in both themes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page);
  await page.goto("/");
  await navigate(page, "Preferences");
  const settings = preferences(page);
  const standardFont = await settings
    .getByRole("heading")
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  await settings
    .getByRole("combobox", { name: "Contrast", exact: true })
    .selectOption("high");
  await settings
    .getByRole("combobox", { name: "Text size", exact: true })
    .selectOption("large");
  const largerFont = await settings
    .getByRole("heading")
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(largerFont).toBeGreaterThanOrEqual(standardFont * 1.19);
  const original = await storedProfile(page);
  for (const theme of ["dark", "light"] as const) {
    if (theme === "light")
      await page
        .getByRole("button", { name: "Switch to light mode", exact: true })
        .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
    await navigate(page, "Preferences");
    await expectNoOverflow(page);
    await navigate(page, "Skill tree");
    await page
      .getByRole("textbox", { name: "Search all skills" })
      .fill("Push-up");
    const pushUp = page
      .locator(".mobile-skill")
      .filter({ has: page.getByText("Push-up", { exact: true }) });
    await pushUp.focus();
    await page.keyboard.press("Enter");
    const details = page.locator(".detail-panel");
    await expect(
      details.getByRole("heading", { name: "Push-up", level: 2, exact: true }),
    ).toBeVisible();
    await expect(
      details.getByRole("textbox", { name: "Personal Record", exact: true }),
    ).toHaveValue("13 clean reps");
    await expectNoOverflow(page);
    await details
      .getByRole("button", { name: "Close skill details", exact: true })
      .click();
  }
  expect(await storedProfile(page)).toEqual(original);
});

test("removed saved graph views are ignored on load and backup import without changing training data", async ({
  page,
}) => {
  const original = trainingProfile();
  await seed(page, { ...original, savedGraphViews: [legacySavedView()] });
  await page.goto("/");
  await ready(page);
  await expect(
    page.getByRole("region", { name: "Saved graph views", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Save current view", exact: true }),
  ).toHaveCount(0);
  expect(await storedProfile(page)).toEqual(original);

  await navigate(page, "Preferences");
  await preferences(page)
    .getByRole("combobox", { name: "Contrast", exact: true })
    .selectOption("high");
  await navigate(page, "Overview");
  const backup = page.getByRole("region", {
    name: "Profile backup",
    exact: true,
  });
  page.once("dialog", (dialog) => dialog.accept());
  await backup.locator('input[type="file"]').setInputFiles({
    name: "legacy-profile.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        ...original,
        savedGraphViews: [legacySavedView(), { id: "broken-view" }],
      }),
    ),
  });
  await expect(backup.getByRole("status")).toHaveText(
    "Profile imported and saved on this device.",
  );
  expect(await storedProfile(page)).toEqual(original);
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
  const downloadPromise = page.waitForEvent("download");
  await backup
    .getByRole("button", { name: "Export JSON", exact: true })
    .click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(exported).toEqual(original);
  expect(exported).not.toHaveProperty("savedGraphViews");
  expect(exported).not.toHaveProperty("accessibility");
  await navigate(page, "Skill tree");
  await expect(
    page.getByRole("region", { name: "Saved graph views", exact: true }),
  ).toHaveCount(0);
});

test("corrupt local accessibility preferences recover to defaults without altering training data", async ({
  page,
}) => {
  await seed(page);
  await page.addInitScript(
    (key) => localStorage.setItem(key, "{broken json"),
    accessibilityKey,
  );
  await page.goto("/");
  await navigate(page, "Preferences");
  await expect(
    preferences(page).getByRole("combobox", { name: "Motion", exact: true }),
  ).toHaveValue("system");
  await expect(
    preferences(page).getByRole("combobox", { name: "Contrast", exact: true }),
  ).toHaveValue("standard");
  await expect(
    preferences(page).getByRole("combobox", { name: "Text size", exact: true }),
  ).toHaveValue("standard");
  expect(await storedProfile(page)).toEqual(trainingProfile());
});

test("blocked storage still honors motion before hydration and permits session preferences and profile export", async ({
  page,
  context,
}) => {
  const prepaint = await context.newPage();
  await prepaint.emulateMedia({ reducedMotion: "reduce" });
  await prepaint.addInitScript(() => {
    for (const method of ["getItem", "setItem"])
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value() {
          throw new Error("Storage blocked");
        },
      });
  });
  await prepaint.route("**/_next/static/**/*.js", (route) => route.abort());
  await prepaint.goto("/", { waitUntil: "domcontentloaded" });
  await expect(prepaint.locator("html")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await expect(prepaint.locator("html")).toHaveAttribute(
    "data-contrast",
    "standard",
  );
  await prepaint.close();

  await page.addInitScript(() => {
    for (const method of ["getItem", "setItem"])
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value() {
          throw new Error("Storage blocked");
        },
      });
  });
  await page.goto("/");
  await navigate(page, "Preferences");
  await expect(preferences(page)).toContainText(
    "Preference changes will last for this session.",
  );
  await preferences(page)
    .getByRole("combobox", { name: "Contrast", exact: true })
    .selectOption("high");
  await preferences(page)
    .getByRole("combobox", { name: "Motion", exact: true })
    .selectOption("reduce");
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
  await expect(page.locator("html")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );
  await navigate(page, "Skill tree");
  await expect(page.locator(".react-flow__edge.animated")).toHaveCount(0);
  await navigate(page, "Overview");
  const backup = page.getByRole("region", {
    name: "Profile backup",
    exact: true,
  });
  const downloadPromise = page.waitForEvent("download");
  await backup
    .getByRole("button", { name: "Export JSON", exact: true })
    .click();
  const download = await downloadPromise;
  const exported: UserProfile = JSON.parse(
    await readFile((await download.path())!, "utf8"),
  );
  expect(exported).toHaveProperty("version", 2);
  expect(exported).not.toHaveProperty("savedGraphViews");
  expect(exported).not.toHaveProperty("accessibility");
});
