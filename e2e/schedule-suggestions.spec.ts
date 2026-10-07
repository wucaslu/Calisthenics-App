import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { skills } from "../src/data/skills";
import type { UserProfile, Weekday, WeeklySchedule } from "../src/types/skill";

const storageKey = "calisthenics-skill-tree:v1";
const weekdayNames: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

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
        id: "existing-push-session",
        skillId: "push-up",
        date: "2026-09-20",
        sets: 2,
        repetitions: 10,
        notes: "This completed practice is independent of planning",
      },
    ],
  };
}

async function seed(page: Page, profile: UserProfile) {
  await page.clock.setFixedTime(new Date("2026-10-07T12:00:00+02:00"));
  await page.addInitScript(
    ({ key, initial }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(initial));
    },
    { key: storageKey, initial: profile },
  );
}

async function storedProfile(page: Page): Promise<UserProfile> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
}

async function navigate(page: Page, label: string) {
  await expect(page.locator(".page-footer")).toContainText(
    /Progress saved on this device|Storage unavailable/,
  );
  const menu = page.locator(".menu-button");
  if ((await menu.getAttribute("aria-expanded")) !== "true") await menu.click();
  await page
    .locator("#main-navigation")
    .getByRole("button", { name: label, exact: true })
    .click();
}

function generator(page: Page) {
  return page.getByRole("region", {
    name: "Suggest a training week",
    exact: true,
  });
}

function applyButton(page: Page) {
  return generator(page).getByRole("button", {
    name: "Add suggestions to schedule",
    exact: true,
  });
}

async function configure(page: Page, days: Weekday[], count: number) {
  for (const [day, label] of Object.entries(weekdayNames))
    await generator(page)
      .getByRole("checkbox", { name: `Train on ${label}`, exact: true })
      .setChecked(days.includes(day as Weekday));
  await generator(page)
    .getByRole("combobox", { name: "Suggested skills per day", exact: true })
    .selectOption(String(count));
}

async function generate(page: Page) {
  await generator(page)
    .getByRole("button", { name: "Generate suggestions", exact: true })
    .click();
}

async function suggestedSchedule(
  page: Page,
  days: Weekday[],
  maximum: number,
): Promise<WeeklySchedule> {
  const schedule: WeeklySchedule = {};
  for (const day of days) {
    const preview = page.getByRole("region", {
      name: `Suggested ${weekdayNames[day]}`,
      exact: true,
    });
    await expect(preview).toBeVisible();
    const ids = await preview
      .locator("article[data-skill-id]")
      .evaluateAll((items) =>
        items.map((item) => item.getAttribute("data-skill-id")!),
      );
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.length).toBeLessThanOrEqual(maximum);
    expect(new Set(ids).size).toBe(ids.length);
    schedule[day] = ids;
  }
  return schedule;
}

function withoutSchedule(profile: UserProfile) {
  const rest = { ...profile };
  delete rest.weeklySchedule;
  return rest;
}

async function addManual(page: Page, day: Weekday, id: string) {
  await page
    .getByRole("combobox", { name: "Schedule day", exact: true })
    .selectOption(day);
  await page
    .getByRole("combobox", { name: "Schedule skill", exact: true })
    .selectOption(id);
  await page
    .getByRole("button", { name: "Add to schedule", exact: true })
    .click();
}

test.use({ timezoneId: "Europe/Berlin" });

test("goal suggestions preview chosen days without writes and merge with manual plans through reload and export", async ({
  page,
}) => {
  const initial = trainingProfile();
  initial.weeklySchedule = {
    monday: ["push-up"],
    tuesday: ["planche-lean"],
    sunday: ["hollow-body-hold"],
  };
  await seed(page, initial);
  await page.goto("/");
  await navigate(page, "Weekly schedule");
  const original = await storedProfile(page);
  await configure(page, ["tuesday", "thursday"], 3);
  await generate(page);
  const preview = await suggestedSchedule(page, ["tuesday", "thursday"], 3);
  await expect(
    page.getByRole("region", { name: "Suggested Monday", exact: true }),
  ).toHaveCount(0);
  expect(Object.values(preview).flat()).toContain("planche-lean");
  await expect(generator(page)).toContainText("Full Planche");
  for (const id of ["full-planche", "dead-hang"])
    await expect(
      generator(page).locator(`article[data-skill-id="${id}"]`),
    ).toHaveCount(0);
  expect(await storedProfile(page)).toEqual(original);

  // Manual schedule edits remain additive and do not invalidate a skill preview.
  await addManual(page, "friday", "hollow-body-hold");
  await expect(applyButton(page)).toBeEnabled();
  const manual = await storedProfile(page);
  await applyButton(page).click();
  const expected: WeeklySchedule = { ...manual.weeklySchedule };
  for (const day of ["tuesday", "thursday"] as const)
    expected[day] = [...new Set([...(expected[day] ?? []), ...preview[day]!])];
  await expect
    .poll(async () => (await storedProfile(page)).weeklySchedule)
    .toEqual(expected);
  const saved = await storedProfile(page);
  expect(withoutSchedule(saved)).toEqual(withoutSchedule(original));
  expect(saved.weeklySchedule?.monday).toEqual(["push-up"]);
  expect(saved.weeklySchedule?.friday).toEqual(["hollow-body-hold"]);
  expect(saved.weeklySchedule?.sunday).toEqual(["hollow-body-hold"]);
  expect(
    saved.weeklySchedule?.tuesday?.filter((id) => id === "planche-lean"),
  ).toHaveLength(1);

  await page.reload();
  await navigate(page, "Weekly schedule");
  expect(await storedProfile(page)).toEqual(saved);
  await expect(
    page.getByRole("article", {
      name: "Planche Lean scheduled for Tuesday",
      exact: true,
    }),
  ).toBeVisible();
  await navigate(page, "Overview");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("region", { name: "Profile backup", exact: true })
    .getByRole("button", { name: "Export JSON", exact: true })
    .click();
  const download = await downloadPromise;
  expect(JSON.parse(await readFile((await download.path())!, "utf8"))).toEqual(
    saved,
  );
});

test("suggestions use ring substitutions while excluding locked skills and equipment-blocked goals", async ({
  page,
}) => {
  const initial = trainingProfile();
  initial.progress = {
    "dead-hang": "mastered",
    "scapular-pull-up": "mastered",
    "pull-up-negative": "mastered",
    "pull-up": "mastered",
  };
  initial.goals = ["chest-to-bar-pull-up"];
  initial.equipment = ["rings"];
  await seed(page, initial);
  await page.goto("/");
  await navigate(page, "Weekly schedule");
  const picker = page.getByRole("combobox", {
    name: "Schedule skill",
    exact: true,
  });
  await expect(
    picker.getByRole("option", { name: "Pull-up", exact: true }),
  ).toHaveCount(1);
  await expect(
    picker.getByRole("option", { name: "Chest-to-Bar Pull-up", exact: true }),
  ).toHaveCount(0);
  await configure(page, ["saturday"], 6);
  const original = await storedProfile(page);
  await generate(page);
  const preview = await suggestedSchedule(page, ["saturday"], 6);
  expect(preview.saturday).toContain("pull-up");
  for (const id of [
    "chest-to-bar-pull-up",
    "explosive-pull-up",
    "full-planche",
  ])
    expect(preview.saturday).not.toContain(id);
  const pullUp = page.getByRole("article", {
    name: "Pull-up suggested for Saturday",
    exact: true,
  });
  await expect(pullUp).toContainText("Mastered");
  await expect(pullUp).toContainText("Chest-to-Bar Pull-up");
  expect(await storedProfile(page)).toEqual(original);
  await applyButton(page).click();
  await expect
    .poll(async () => (await storedProfile(page)).weeklySchedule)
    .toEqual(preview);
  expect(withoutSchedule(await storedProfile(page))).toEqual(
    withoutSchedule(original),
  );
});

test("real cross-tab equipment and prerequisite changes invalidate previews before they can be applied", async ({
  page,
  context,
}) => {
  const initial = trainingProfile();
  initial.equipment = ["floor", "rings"];
  await seed(page, initial);
  await page.goto("/");
  await navigate(page, "Weekly schedule");
  await configure(page, ["monday"], 6);
  await generate(page);
  await expect(applyButton(page)).toBeEnabled();
  const other = await context.newPage();
  try {
    await other.goto("/");
    await navigate(other, "Equipment");
    await other
      .locator(".equipment-card")
      .filter({
        has: other.getByRole("heading", { name: "Rings", exact: true }),
      })
      .click();
    await expect(applyButton(page)).toBeDisabled();
    await expect(generator(page)).toContainText(
      "Generate suggestions again before adding them.",
    );
    expect((await storedProfile(page)).weeklySchedule).toBeUndefined();
    await generate(page);
    const floorPreview = await suggestedSchedule(page, ["monday"], 6);
    expect(floorPreview.monday).not.toContain("dead-hang");
    await expect(applyButton(page)).toBeEnabled();

    await navigate(other, "Skill tree");
    await other
      .getByRole("textbox", { name: "Search all skills", exact: true })
      .fill("Push-up");
    await expect(other.locator('[data-id="push-up"] button')).toBeVisible();
    await other.getByRole("button", { name: "Fit View", exact: true }).click();
    await other.locator('[data-id="push-up"] button').click();
    await other
      .locator(".detail-panel")
      .getByRole("button", { name: "Reset Progress", exact: true })
      .click();
    await expect(applyButton(page)).toBeDisabled();
    await expect(generator(page)).toContainText(
      "Generate suggestions again before adding them.",
    );
    expect((await storedProfile(page)).weeklySchedule).toBeUndefined();
    await generate(page);
    const current = await suggestedSchedule(page, ["monday"], 6);
    expect(current.monday).not.toContain("planche-lean");
    expect(current.monday).not.toContain("dead-hang");
    const beforeApply = await storedProfile(page);
    await applyButton(page).click();
    await expect
      .poll(async () => (await storedProfile(page)).weeklySchedule)
      .toEqual(current);
    expect(withoutSchedule(await storedProfile(page))).toEqual(
      withoutSchedule(beforeApply),
    );
    await expect
      .poll(async () => (await storedProfile(other)).weeklySchedule)
      .toEqual(current);
  } finally {
    await other.close();
  }
});

test("a profile without goals receives available foundations and changing settings requires a fresh preview", async ({
  page,
}) => {
  const initial: UserProfile = {
    version: 2,
    progress: {},
    personalRecords: {},
    goals: [],
    equipment: ["floor"],
    archivedSkills: {},
    practiceLog: [],
  };
  await seed(page, initial);
  await page.goto("/");
  await navigate(page, "Weekly schedule");
  await configure(page, ["sunday"], 1);
  const original = await storedProfile(page);
  await generate(page);
  const preview = await suggestedSchedule(page, ["sunday"], 1);
  await expect(
    page.getByRole("region", { name: "Suggested Sunday", exact: true }),
  ).toContainText("Available");
  expect(preview.sunday).toHaveLength(1);
  expect(await storedProfile(page)).toEqual(original);
  await generator(page)
    .getByRole("combobox", { name: "Suggested skills per day", exact: true })
    .selectOption("2");
  await expect(applyButton(page)).toBeDisabled();
  await expect(generator(page)).toContainText(
    "Generate suggestions again before adding them.",
  );
  await generate(page);
  await suggestedSchedule(page, ["sunday"], 2);
  await expect(applyButton(page)).toBeEnabled();
  await generator(page)
    .getByRole("checkbox", { name: "Train on Sunday", exact: true })
    .uncheck();
  await expect(
    generator(page).getByRole("button", {
      name: "Generate suggestions",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(applyButton(page)).toBeDisabled();
  expect(await storedProfile(page)).toEqual(original);
});

test("mastered maintenance suggestions fit mobile in both themes and apply without recording practice", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const initial = trainingProfile();
  initial.progress = Object.fromEntries(
    skills.map((skill) => [skill.id, "mastered"]),
  );
  initial.goals = [];
  await seed(page, initial);
  await page.goto("/");
  await navigate(page, "Weekly schedule");
  const original = await storedProfile(page);
  await generate(page);
  const preview = await suggestedSchedule(
    page,
    ["monday", "wednesday", "friday"],
    3,
  );
  for (const day of ["Monday", "Wednesday", "Friday"])
    await expect(
      page.getByRole("region", { name: `Suggested ${day}`, exact: true }),
    ).toContainText("Mastered");
  for (const mode of ["light", "dark"]) {
    await page
      .getByRole("button", { name: `Switch to ${mode} mode`, exact: true })
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  }
  expect(await storedProfile(page)).toEqual(original);
  await applyButton(page).click();
  await expect
    .poll(async () => (await storedProfile(page)).weeklySchedule)
    .toEqual(preview);
  expect(withoutSchedule(await storedProfile(page))).toEqual(
    withoutSchedule(original),
  );
  await expect(
    page.getByRole("region", { name: "Tuesday", exact: true }),
  ).toContainText("Rest day");
  expect(errors).toEqual([]);
});
