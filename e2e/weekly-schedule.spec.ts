import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import type { UserProfile, Weekday } from "../src/types/skill";

const storageKey = "calisthenics-skill-tree:v1";

function trainingProfile(): UserProfile {
  return {
    version: 2,
    progress: {
      "push-up": "mastered",
      "scapular-push-up": "mastered",
      "planche-lean": "training",
    },
    personalRecords: {
      "push-up": "13 clean reps",
      "hollow-body-hold": "19 seconds",
    },
    goals: ["full-planche"],
    equipment: ["floor"],
    archivedSkills: {},
    practiceLog: [
      {
        id: "existing-push-session",
        skillId: "push-up",
        date: "2026-09-20",
        sets: 2,
        repetitions: 10,
        notes: "Keep this completed session",
      },
    ],
  };
}

async function seed(page: Page, initial = trainingProfile()) {
  await page.clock.setFixedTime(new Date("2026-10-07T12:00:00+02:00"));
  await page.addInitScript(
    ({ key, profile }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(profile));
    },
    { key: storageKey, profile: initial },
  );
}

async function ready(page: Page) {
  await expect(page.locator(".page-footer")).toContainText(
    /Progress saved on this device|Storage unavailable/,
  );
}

async function storedProfile(page: Page): Promise<UserProfile> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
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

function picker(page: Page) {
  return page.getByRole("combobox", { name: "Schedule skill", exact: true });
}

function assignment(page: Page, skill: string, day: string) {
  return page.getByRole("article", {
    name: `${skill} scheduled for ${day}`,
    exact: true,
  });
}

async function add(page: Page, day: Weekday, id: string) {
  await page.getByLabel("Find a schedule skill", { exact: true }).fill("");
  await page
    .getByRole("combobox", { name: "Schedule day", exact: true })
    .selectOption(day);
  await picker(page).selectOption(id);
  await page
    .getByRole("button", { name: "Add to schedule", exact: true })
    .click();
}

async function remove(page: Page, skill: string, day: string) {
  const item = assignment(page, skill, day);
  await item
    .getByRole("button", { name: `Remove ${skill} from ${day}`, exact: true })
    .click();
  await expect(item).toHaveCount(0);
}

async function pushUpDetails(page: Page) {
  await navigate(page, "Skill tree");
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("Push-up");
  await expect(page.locator('[data-id="push-up"] button')).toBeVisible();
  await page.getByRole("button", { name: "Fit View", exact: true }).click();
  await page.locator('[data-id="push-up"] button').click();
  const panel = page.locator(".detail-panel");
  await expect(
    panel.getByRole("heading", { name: "Push-up", exact: true, level: 2 }),
  ).toBeVisible();
  return panel;
}

test.use({ timezoneId: "Europe/Berlin" });

test("weekly planning includes unlocked states, prevents day duplicates, and persists independently of practice through backups", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  await navigate(page, "Weekly schedule");
  const original = await storedProfile(page);
  const choices = picker(page);
  for (const skill of ["Push-up", "Planche Lean", "Hollow Body Hold"])
    await expect(
      choices.getByRole("option", { name: skill, exact: true }),
    ).toHaveCount(1);
  for (const skill of ["Full Planche", "Dead Hang"])
    await expect(
      choices.getByRole("option", { name: skill, exact: true }),
    ).toHaveCount(0);
  for (const day of [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ])
    await expect(
      page
        .getByRole("region", { name: day, exact: true })
        .getByRole("heading", { name: "Rest day", exact: true }),
    ).toBeVisible();

  await add(page, "monday", "push-up");
  await expect(assignment(page, "Push-up", "Monday")).toContainText("Mastered");
  await expect(
    choices.getByRole("option", { name: "Push-up", exact: true }),
  ).toHaveCount(0);
  await add(page, "monday", "hollow-body-hold");
  await expect(assignment(page, "Hollow Body Hold", "Monday")).toContainText(
    "Available",
  );
  await page
    .getByLabel("Find a schedule skill", { exact: true })
    .fill("Hollow Body Hold");
  await expect(
    page.getByRole("button", { name: "Add to schedule", exact: true }),
  ).toBeDisabled();
  await expect(assignment(page, "Hollow Body Hold", "Monday")).toHaveCount(1);
  await add(page, "wednesday", "push-up");
  await add(page, "wednesday", "planche-lean");
  await expect(assignment(page, "Planche Lean", "Wednesday")).toContainText(
    "Training",
  );
  await remove(page, "Push-up", "Monday");
  await expect(assignment(page, "Push-up", "Wednesday")).toHaveCount(1);
  const expectedSchedule = {
    monday: ["hollow-body-hold"],
    wednesday: ["push-up", "planche-lean"],
  };
  await expect
    .poll(async () => (await storedProfile(page)).weeklySchedule)
    .toEqual(expectedSchedule);
  const saved = await storedProfile(page);
  expect({ ...saved, weeklySchedule: undefined }).toEqual({
    ...original,
    weeklySchedule: undefined,
  });
  const summary = page.locator('[aria-label="Weekly schedule summary"]');
  await expect(summary).toContainText("2 planned training days");
  await expect(summary).toContainText("3 skill slots");
  await expect(summary).toContainText("5 rest days");

  await navigate(page, "Practice log");
  expect(await storedProfile(page)).toEqual(saved);
  await navigate(page, "Weekly schedule");
  await expect(assignment(page, "Hollow Body Hold", "Monday")).toBeVisible();
  await page.reload();
  await navigate(page, "Weekly schedule");
  await expect(assignment(page, "Planche Lean", "Wednesday")).toBeVisible();
  expect(await storedProfile(page)).toEqual(saved);

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
  const exported = await readFile((await download.path())!, "utf8");
  expect(JSON.parse(exported)).toEqual(saved);
  await navigate(page, "Weekly schedule");
  await remove(page, "Hollow Body Hold", "Monday");
  await expect(
    page.getByRole("region", { name: "Monday", exact: true }),
  ).toContainText("Rest day");
  await navigate(page, "Overview");
  page.once("dialog", (dialog) => dialog.accept());
  await backup.locator('input[type="file"]').setInputFiles({
    name: "weekly-plan.json",
    mimeType: "application/json",
    buffer: Buffer.from(exported),
  });
  await expect(backup.getByRole("status")).toHaveText(
    "Profile imported and saved on this device.",
  );
  await navigate(page, "Weekly schedule");
  await expect(assignment(page, "Hollow Body Hold", "Monday")).toBeVisible();
  expect(await storedProfile(page)).toEqual(saved);
});

test("cross-tab prerequisite and equipment changes keep assignments and prevent practice until a usable route returns", async ({
  page,
  context,
}) => {
  const initial = trainingProfile();
  initial.equipment = ["floor", "rings"];
  initial.weeklySchedule = { monday: ["planche-lean", "dead-hang"] };
  await seed(page, initial);
  await page.goto("/");
  await navigate(page, "Weekly schedule");
  await page
    .getByRole("combobox", { name: "Schedule day", exact: true })
    .selectOption("tuesday");
  await picker(page).selectOption("planche-lean");
  await expect(
    assignment(page, "Dead Hang", "Monday").getByRole("button", {
      name: "Log Dead Hang practice for Monday",
      exact: true,
    }),
  ).toBeEnabled();
  const other = await context.newPage();
  try {
    await other.goto("/");
    const details = await pushUpDetails(other);
    await details
      .getByRole("button", { name: "Reset Progress", exact: true })
      .click();
    const lean = assignment(page, "Planche Lean", "Monday");
    await expect(lean).toContainText("Currently unavailable.");
    await expect(lean).toContainText("Locked: master its prerequisites");
    await expect(
      lean.getByRole("button", {
        name: "Log Planche Lean practice for Monday",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      picker(page).getByRole("option", { name: "Planche Lean", exact: true }),
    ).toHaveCount(0);
    await expect(picker(page)).not.toHaveValue("planche-lean");
    await navigate(other, "Equipment");
    const rings = other.locator(".equipment-card").filter({
      has: other.getByRole("heading", { name: "Rings", exact: true }),
    });
    await rings.click();
    const hang = assignment(page, "Dead Hang", "Monday");
    await expect(hang).toContainText("Equipment needed: Pull-up bar.");
    await expect(
      hang.getByRole("button", {
        name: "Log Dead Hang practice for Monday",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      picker(page).getByRole("option", { name: "Dead Hang", exact: true }),
    ).toHaveCount(0);
    expect((await storedProfile(page)).weeklySchedule).toEqual(
      initial.weeklySchedule,
    );
    await remove(page, "Dead Hang", "Monday");
    await expect
      .poll(async () => (await storedProfile(other)).weeklySchedule)
      .toEqual({ monday: ["planche-lean"] });

    await rings.click();
    await expect(
      picker(page).getByRole("option", { name: "Dead Hang", exact: true }),
    ).toHaveCount(1);
    const restored = await pushUpDetails(other);
    await restored
      .getByRole("button", { name: "Mark as Mastered", exact: true })
      .click();
    await expect(lean).not.toContainText("Currently unavailable.");
    await expect(
      lean.getByRole("button", {
        name: "Log Planche Lean practice for Monday",
        exact: true,
      }),
    ).toBeEnabled();
    await expect(
      picker(page).getByRole("option", { name: "Planche Lean", exact: true }),
    ).toHaveCount(1);
    await page.reload();
    await navigate(page, "Weekly schedule");
    await expect(lean).toBeVisible();
    expect((await storedProfile(page)).practiceLog).toEqual(
      initial.practiceLog,
    );
  } finally {
    await other.close();
  }
});

test("mobile weekly planning fits both themes and opens details or a prefilled log without completing practice", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await seed(page);
  await page.goto("/");
  await navigate(page, "Weekly schedule");
  await add(page, "friday", "hollow-body-hold");
  const item = assignment(page, "Hollow Body Hold", "Friday");
  await expect(item).toBeVisible();
  const saved = await storedProfile(page);
  await page
    .getByLabel("Find a schedule skill", { exact: true })
    .fill("Full Planche");
  await expect(picker(page)).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Add to schedule", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Find a schedule skill", { exact: true }).fill("");
  for (const mode of ["light", "dark"]) {
    await page
      .getByRole("button", { name: `Switch to ${mode} mode`, exact: true })
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await item
    .getByRole("button", {
      name: "View Hollow Body Hold details for Friday",
      exact: true,
    })
    .click();
  const details = page.locator(".detail-panel");
  await expect(
    details.getByRole("heading", {
      name: "Hollow Body Hold",
      exact: true,
      level: 2,
    }),
  ).toBeVisible();
  await details
    .getByRole("button", { name: "Close skill details", exact: true })
    .click();
  await navigate(page, "Weekly schedule");
  await item
    .getByRole("button", {
      name: "Log Hollow Body Hold practice for Friday",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Practised skill", exact: true }),
  ).toHaveValue("hollow-body-hold");
  await expect(
    page.getByRole("spinbutton", { name: "Hold seconds per set", exact: true }),
  ).toHaveValue("");
  expect(await storedProfile(page)).toEqual(saved);
  await navigate(page, "Weekly schedule");
  await expect(item).toBeVisible();
  await remove(page, "Hollow Body Hold", "Friday");
  await expect(
    page.getByRole("region", { name: "Friday", exact: true }),
  ).toContainText("Rest day");
  const removed = await storedProfile(page);
  expect({ ...removed, weeklySchedule: undefined }).toEqual({
    ...saved,
    weeklySchedule: undefined,
  });
  expect(removed.weeklySchedule).toBeUndefined();
  expect(errors).toEqual([]);
});

test("storage-unavailable weekly edits survive navigation for this session and remain exportable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    for (const method of ["getItem", "setItem"])
      Object.defineProperty(Storage.prototype, method, {
        value() {
          throw new DOMException("Storage blocked", "SecurityError");
        },
      });
  });
  await page.goto("/");
  await navigate(page, "Weekly schedule");
  await expect(page.locator(".page-footer")).toContainText(
    "Storage unavailable",
  );
  await expect(
    page.getByText("Your schedule lasts for this session.", { exact: false }),
  ).toBeVisible();
  await add(page, "saturday", "push-up");
  await expect(assignment(page, "Push-up", "Saturday")).toBeVisible();
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
  expect(
    JSON.parse(await readFile((await download.path())!, "utf8")).weeklySchedule,
  ).toEqual({ saturday: ["push-up"] });
  await navigate(page, "Weekly schedule");
  await expect(assignment(page, "Push-up", "Saturday")).toBeVisible();
  await page.reload();
  await navigate(page, "Weekly schedule");
  await expect(assignment(page, "Push-up", "Saturday")).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Saturday", exact: true }),
  ).toContainText("Rest day");
});
