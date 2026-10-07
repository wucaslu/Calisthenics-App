import { expect, test, type Locator, type Page } from "@playwright/test";

const storageKey = "calisthenics-skill-tree:v1";

interface PracticeEntry {
  id: string;
  skillId: string;
  date: string;
  sets: number;
  repetitions?: number;
  holdSeconds?: number;
  notes: string;
}

function profile(practiceLog: PracticeEntry[]) {
  return {
    version: 2,
    progress: { "push-up": "mastered" },
    personalRecords: {
      "push-up": "17 clean reps",
      "chin-up": "3 clean reps",
    },
    goals: ["full-planche"],
    equipment: ["floor", "rings"],
    archivedSkills: {},
    practiceLog,
  };
}

async function seed(page: Page, entries: PracticeEntry[]) {
  await page.clock.setFixedTime(new Date("2026-10-07T12:00:00+02:00"));
  await page.addInitScript(
    ({ key, initial }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(initial));
    },
    { key: storageKey, initial: profile(entries) },
  );
}

async function storedProfile(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
}

async function navigate(page: Page, label: string) {
  await expect(page.locator(".page-footer")).toContainText(
    /Progress saved on this device|Storage unavailable/,
  );
  const toggle = page.locator(".menu-button");
  if ((await toggle.getAttribute("aria-expanded")) !== "true")
    await toggle.click();
  await page
    .locator("#main-navigation")
    .getByRole("button", { name: label, exact: true })
    .click();
}

async function openPushUp(page: Page) {
  await navigate(page, "Skill tree");
  await page
    .getByRole("textbox", { name: "Search all skills", exact: true })
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

async function fillPractice(
  page: Page,
  date: string,
  repetitions: string,
  holdSeconds: string,
) {
  await page
    .getByRole("combobox", { name: "Practised skill", exact: true })
    .selectOption("push-up");
  await page.getByLabel("Practice date", { exact: true }).fill(date);
  await page.getByRole("spinbutton", { name: "Sets", exact: true }).fill("4");
  await page
    .getByRole("spinbutton", { name: "Repetitions per set", exact: true })
    .fill(repetitions);
  await page
    .getByRole("spinbutton", { name: "Hold seconds per set", exact: true })
    .fill(holdSeconds);
}

function entry(page: Page, skill: string, date: string) {
  return page.getByRole("article", {
    name: `${skill} practice on ${date}`,
    exact: true,
  });
}

async function deleteEntry(article: Locator) {
  await article.getByRole("button", { name: /^Delete / }).click();
  await article
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(article).toHaveCount(0);
}

async function expectPushRecord(page: Page, value: string | undefined) {
  await expect
    .poll(async () => (await storedProfile(page)).personalRecords["push-up"])
    .toBe(value);
}

test.use({ timezoneId: "Europe/Berlin" });

test("practice saves replace manual records with separate single-set bests and rebuild them after edits and deletion", async ({
  page,
}) => {
  await seed(page, [
    {
      id: "earlier-push",
      skillId: "push-up",
      date: "2026-09-28",
      sets: 2,
      repetitions: 8,
      holdSeconds: 3,
      notes: "Earlier baseline",
    },
    {
      id: "earlier-hold",
      skillId: "hollow-body-hold",
      date: "2026-10-06",
      sets: 1,
      holdSeconds: 20,
      notes: "Independent skill record",
    },
  ]);
  await page.goto("/");
  const panel = await openPushUp(page);
  const record = panel.getByRole("textbox", {
    name: "Personal Record",
    exact: true,
  });
  // Loading old history fills missing records and preserves an existing manual record.
  await expect(record).toHaveValue("17 clean reps");
  expect((await storedProfile(page)).personalRecords["hollow-body-hold"]).toBe(
    "20 sec hold",
  );
  await panel
    .getByRole("button", { name: "Log practice", exact: true })
    .click();
  await fillPractice(page, "2026-10-05", "12", "5");
  await page
    .getByRole("button", { name: "Save practice", exact: true })
    .click();
  await expectPushRecord(page, "12 reps · 5 sec hold");

  await openPushUp(page);
  await expect(record).toHaveValue("12 reps · 5 sec hold");
  await record.fill("Outside practice: 15 clean reps");
  await page.reload();
  await openPushUp(page);
  await expect(record).toHaveValue("Outside practice: 15 clean reps");
  await panel
    .getByRole("button", { name: "Log practice", exact: true })
    .click();
  await fillPractice(page, "2026-10-06", "9", "7.5");
  await page
    .getByRole("button", { name: "Save practice", exact: true })
    .click();
  await expectPushRecord(page, "12 reps · 7.5 sec hold");

  const beforeInvalid = await storedProfile(page);
  await fillPractice(page, "2026-10-08", "99", "99");
  await page
    .getByRole("button", { name: "Save practice", exact: true })
    .click();
  await expect(
    page
      .getByRole("region", { name: "Log practice", exact: true })
      .getByRole("alert"),
  ).toHaveText("Practice dates cannot be in the future.");
  expect(await storedProfile(page)).toEqual(beforeInvalid);

  const highest = entry(page, "Push-up", "October 5, 2026");
  await highest.getByRole("button", { name: /^Edit / }).click();
  await fillPractice(page, "2026-10-01", "6", "2");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(highest).toHaveCount(0);
  await expectPushRecord(page, "9 reps · 7.5 sec hold");
  await navigate(page, "Analytics");
  const recordHistory = page.getByRole("region", {
    name: "Personal records over time",
    exact: true,
  });
  await recordHistory
    .getByRole("combobox", { name: "Record skill", exact: true })
    .selectOption("push-up");
  await expect(
    recordHistory.getByRole("table").getByRole("rowheader"),
  ).toHaveText(["October 6, 2026"]);
  await expect(recordHistory.getByRole("table").getByRole("cell")).toHaveText([
    "9 reps",
  ]);
  await navigate(page, "Practice log");
  await deleteEntry(entry(page, "Push-up", "October 6, 2026"));
  await expectPushRecord(page, "8 reps · 3 sec hold");
  await navigate(page, "Analytics");
  await recordHistory
    .getByRole("combobox", { name: "Record skill", exact: true })
    .selectOption("push-up");
  await expect(recordHistory.getByRole("table")).toHaveCount(0);
  await expect(recordHistory.getByRole("status")).toContainText(
    "No new repetition record this week.",
  );
  await navigate(page, "Practice log");
  await deleteEntry(entry(page, "Push-up", "October 1, 2026"));
  await expectPushRecord(page, "8 reps · 3 sec hold");

  // Moving a log to another skill recalculates both skills independently.
  const baseline = entry(page, "Push-up", "September 28, 2026");
  await baseline.getByRole("button", { name: /^Edit / }).click();
  await page
    .getByRole("combobox", { name: "Practised skill", exact: true })
    .selectOption("hollow-body-hold");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expectPushRecord(page, undefined);
  expect((await storedProfile(page)).personalRecords["hollow-body-hold"]).toBe(
    "8 reps · 20 sec hold",
  );
  await page
    .getByRole("combobox", { name: "History skill", exact: true })
    .selectOption("all");
  await deleteEntry(entry(page, "Hollow Body Hold", "September 28, 2026"));
  expect((await storedProfile(page)).personalRecords["hollow-body-hold"]).toBe(
    "20 sec hold",
  );
  await deleteEntry(entry(page, "Hollow Body Hold", "October 6, 2026"));
  await page.reload();
  await navigate(page, "Practice log");
  const saved = await storedProfile(page);
  expect(saved.practiceLog).toEqual([]);
  expect(saved.personalRecords).toEqual({ "chin-up": "3 clean reps" });
  expect(saved.progress).toEqual({ "push-up": "mastered" });
  expect(saved.goals).toEqual(["full-planche"]);
  expect(saved.equipment).toEqual(["floor", "rings"]);
});

for (const mobile of [false, true]) {
  test(`dated record milestones follow weekly and monthly ranges on ${mobile ? "mobile" : "desktop"}`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await seed(page, [
      {
        id: "september-baseline",
        skillId: "push-up",
        date: "2026-09-28",
        sets: 2,
        repetitions: 8,
        holdSeconds: 3,
        notes: "",
      },
      {
        id: "first-improvement",
        skillId: "push-up",
        date: "2026-10-05",
        sets: 4,
        repetitions: 10,
        holdSeconds: 5.5,
        notes: "",
      },
      {
        id: "lower-effort",
        skillId: "push-up",
        date: "2026-10-06",
        sets: 8,
        repetitions: 9,
        holdSeconds: 4.5,
        notes: "More sets do not raise the single-set record",
      },
      {
        id: "second-improvement",
        skillId: "push-up",
        date: "2026-10-07",
        sets: 3,
        repetitions: 12,
        holdSeconds: 5,
        notes: "",
      },
      {
        id: "independent-hold",
        skillId: "hollow-body-hold",
        date: "2026-10-06",
        sets: 1,
        holdSeconds: 90,
        notes: "",
      },
    ]);
    await page.goto("/");
    await navigate(page, "Analytics");
    const history = page.getByRole("region", {
      name: "Personal records over time",
      exact: true,
    });
    const skill = history.getByRole("combobox", {
      name: "Record skill",
      exact: true,
    });
    await skill.selectOption("push-up");
    await expect(skill.locator("option")).toHaveText([
      "Hollow Body Hold",
      "Push-up",
    ]);
    await expect(history).toContainText(
      "Starting record: 8 reps, set on September 28, 2026.",
    );
    await expect(
      history.locator('dl[aria-label="Records at period end"]'),
    ).toContainText("12 reps");
    await expect(
      history.locator('dl[aria-label="Records at period end"]'),
    ).toContainText("5.5 sec hold");
    const table = history.getByRole("table");
    await expect(table).toHaveAccessibleName(
      "New repetition records this week (2)",
    );
    await expect(table.getByRole("rowheader")).toHaveText([
      "October 5, 2026",
      "October 7, 2026",
    ]);
    await expect(table.getByRole("cell")).toHaveText(["10 reps", "12 reps"]);
    await expect(
      history.getByRole("img", {
        name: /^Push-up repetition personal records over time/,
      }),
    ).toBeVisible();

    await history
      .getByRole("button", { name: "Record metric: Hold time", exact: true })
      .click();
    await expect(table).toHaveAccessibleName(
      "New hold-time records this week (1)",
    );
    await expect(table.getByRole("rowheader")).toHaveText(["October 5, 2026"]);
    await expect(table.getByRole("cell")).toHaveText(["5.5 sec hold"]);
    await expect(history).toContainText(
      "Starting record: 3 sec hold, set on September 28, 2026.",
    );
    await expect(
      history.getByRole("img", {
        name: /^Push-up hold-time personal records over time/,
      }),
    ).toBeVisible();

    await skill.selectOption("hollow-body-hold");
    await expect(table.getByRole("cell")).toHaveText(["90 sec hold"]);
    await history
      .getByRole("button", { name: "Record metric: Repetitions", exact: true })
      .click();
    await expect(history.getByRole("status")).toContainText(
      "No repetition record for Hollow Body Hold",
    );
    await skill.selectOption("push-up");
    await page.getByRole("button", { name: "Monthly", exact: true }).click();
    await expect(table).toHaveAccessibleName(
      "New repetition records this month (2)",
    );
    await expect(table.getByRole("cell")).toHaveText(["10 reps", "12 reps"]);
    await page
      .getByRole("button", { name: "Previous month", exact: true })
      .click();
    await expect(table).toHaveAccessibleName(
      "New repetition records this month (1)",
    );
    await expect(table.getByRole("rowheader")).toHaveText([
      "September 28, 2026",
    ]);
    await expect(table.getByRole("cell")).toHaveText(["8 reps"]);
    await expect(
      history.locator('dl[aria-label="Records at period end"]'),
    ).toContainText("3 sec hold");
    await page
      .getByRole("button", { name: "Previous month", exact: true })
      .click();
    await expect(history.getByRole("status")).toContainText(
      "No repetition record for Push-up",
    );
    await expect(history.getByRole("img")).toHaveCount(0);
    await page.getByRole("button", { name: "This month", exact: true }).click();

    for (const theme of ["light", "dark"]) {
      await page
        .getByRole("button", { name: `Switch to ${theme} mode`, exact: true })
        .click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(
        history.getByRole("region", {
          name: "Personal record timeline chart",
          exact: true,
        }),
      ).toHaveAttribute("tabindex", "0");
      const viewport = await page.evaluate(() => ({
        width: innerWidth,
        body: document.body.scrollWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(viewport.body).toBeLessThanOrEqual(viewport.width + 1);
      expect(viewport.document).toBeLessThanOrEqual(viewport.width + 1);
    }
    await page.reload();
    await navigate(page, "Analytics");
    await skill.selectOption("push-up");
    await expect(table.getByRole("cell")).toHaveText(["10 reps", "12 reps"]);
    // Analytics derives dated values from logs without overwriting manual text.
    expect((await storedProfile(page)).personalRecords["push-up"]).toBe(
      "17 clean reps",
    );
  });
}
