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

function analyticsProfile() {
  const practiceLog: PracticeEntry[] = [
    {
      id: "oct-5-push",
      skillId: "push-up",
      date: "2026-10-05",
      sets: 2,
      repetitions: 8,
      notes: "",
    },
    {
      id: "oct-5-hold",
      skillId: "hollow-body-hold",
      date: "2026-10-05",
      sets: 3,
      holdSeconds: 12.5,
      notes: "",
    },
    {
      id: "oct-6-pull",
      skillId: "pull-up",
      date: "2026-10-06",
      sets: 1,
      repetitions: 5,
      notes: "",
    },
    {
      id: "oct-7-push",
      skillId: "push-up",
      date: "2026-10-07",
      sets: 4,
      repetitions: 6,
      notes: "",
    },
    {
      id: "oct-7-hold",
      skillId: "hollow-body-hold",
      date: "2026-10-07",
      sets: 1,
      holdSeconds: 30,
      notes: "",
    },
    {
      id: "oct-1-push",
      skillId: "push-up",
      date: "2026-10-01",
      sets: 3,
      repetitions: 10,
      notes: "",
    },
    {
      id: "oct-3-hold",
      skillId: "hollow-body-hold",
      date: "2026-10-03",
      sets: 2,
      holdSeconds: 20,
      notes: "",
    },
    {
      id: "sep-28-push",
      skillId: "push-up",
      date: "2026-09-28",
      sets: 1,
      repetitions: 4,
      notes: "",
    },
    {
      id: "sep-30-hold",
      skillId: "hollow-body-hold",
      date: "2026-09-30",
      sets: 2,
      holdSeconds: 10,
      notes: "",
    },
    {
      id: "sep-1-push",
      skillId: "push-up",
      date: "2026-09-01",
      sets: 2,
      repetitions: 5,
      notes: "",
    },
    {
      id: "sep-3-hold",
      skillId: "hollow-body-hold",
      date: "2026-09-03",
      sets: 1,
      holdSeconds: 8,
      notes: "",
    },
    {
      id: "sep-26-push",
      skillId: "push-up",
      date: "2026-09-26",
      sets: 2,
      repetitions: 3,
      notes: "",
    },
    // Travel can leave a valid stored date ahead of today's local date. Preserve
    // this record in storage, but do not count tomorrow in today's analytics.
    {
      id: "future-push",
      skillId: "push-up",
      date: "2026-10-08",
      sets: 100,
      repetitions: 100,
      notes: "Recorded before travel",
    },
  ];
  return {
    version: 2,
    progress: { "push-up": "mastered" },
    personalRecords: { "push-up": "20 clean reps" },
    goals: [],
    equipment: ["floor", "pull-up-bar"],
    archivedSkills: {},
    practiceLog,
  };
}

async function seed(page: Page) {
  await page.addInitScript(
    ({ key, initial }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(initial));
    },
    { key: storageKey, initial: analyticsProfile() },
  );
}

async function navigate(page: Page, label: string) {
  await expect(page.locator(".page-footer")).toContainText(
    /Progress saved on this device|Storage unavailable/,
  );
  const toggle = page.locator(".menu-button");
  if ((await toggle.getAttribute("aria-expanded")) !== "true")
    await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page
    .locator("#main-navigation")
    .getByRole("button", { name: label, exact: true })
    .click();
}

function summary(page: Page) {
  return page.getByRole("region", { name: "Training summary", exact: true });
}

async function expectStat(region: Locator, label: string, value: string) {
  await expect(
    region
      .getByRole("group", { name: label, exact: true })
      .locator("strong")
      .first(),
  ).toHaveText(value);
}

async function expectPreviousStat(
  region: Locator,
  label: string,
  value: string,
) {
  await expect(
    region.getByText(label, { exact: true }).locator("..").locator("dd"),
  ).toHaveText(value);
}

async function openAnalytics(page: Page) {
  await navigate(page, "Analytics");
  await expect(
    page.getByRole("heading", {
      name: "See your training take shape.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Analytics skill", exact: true }),
  ).toBeEnabled();
}

test.use({ timezoneId: "Europe/Berlin" });

test("weekly and monthly totals multiply per-set metrics and compare equal elapsed calendar days", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-07T12:00:00+02:00"));
  await seed(page);
  await page.goto("/");
  await openAnalytics(page);
  await expect(
    page.getByRole("button", { name: "Weekly", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Next week", exact: true }),
  ).toBeDisabled();
  await expectStat(summary(page), "Practice days", "3 / 3");
  await expectStat(summary(page), "Logged entries", "5");
  await expectStat(summary(page), "Total sets", "11");
  await expectStat(summary(page), "Total repetitions", "45");
  await expectStat(summary(page), "Total hold time", "1m 7.5s");
  const comparison = page.getByRole("region", {
    name: "Period comparison",
    exact: true,
  });
  await expect(comparison).toContainText("September 28, 2026");
  await expect(comparison).toContainText("September 30, 2026");
  await expectPreviousStat(comparison, "Practice days", "2 / 3");
  await expectPreviousStat(comparison, "Total sets", "3");
  await expectPreviousStat(comparison, "Total repetitions", "4");
  await expectPreviousStat(comparison, "Total hold time", "20s");
  const daily = page.getByRole("region", {
    name: "Daily training volume",
    exact: true,
  });
  await expect(
    daily.getByRole("listitem", {
      name: "October 5, 2026: 5 sets, 2 entries",
      exact: true,
    }),
  ).toBeVisible();
  await daily.getByRole("button", { name: "Repetitions", exact: true }).click();
  await expect(
    daily.getByRole("button", { name: "Repetitions", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    daily.getByRole("listitem", {
      name: "October 7, 2026: 24 repetitions, 2 entries",
      exact: true,
    }),
  ).toBeVisible();
  await daily.getByRole("button", { name: "Hold time", exact: true }).click();
  await expect(
    daily.getByRole("button", { name: "Hold time", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    daily.getByRole("listitem", {
      name: "October 5, 2026: 37.5 seconds held, 2 entries",
      exact: true,
    }),
  ).toBeVisible();
  const groups = page.getByRole("region", {
    name: "Training by group",
    exact: true,
  });
  await expect(
    groups.getByRole("listitem").filter({ hasText: "Push" }),
  ).toContainText("6 sets");
  await expect(
    groups.getByRole("listitem").filter({ hasText: "Core" }),
  ).toContainText("4 sets");
  await page.getByText("Skill breakdown (3)", { exact: true }).click();
  const skillTable = page.getByRole("region", {
    name: "Skill breakdown table",
    exact: true,
  });
  const pushRow = skillTable.getByRole("row").filter({
    has: page.getByRole("rowheader", { name: "Push-up", exact: true }),
  });
  await expect(pushRow.getByRole("cell")).toHaveText([
    "2",
    "6",
    "40",
    "—",
    "8 reps",
  ]);
  const hollowRow = skillTable.getByRole("row").filter({
    has: page.getByRole("rowheader", {
      name: "Hollow Body Hold",
      exact: true,
    }),
  });
  await expect(hollowRow.getByRole("cell")).toHaveText([
    "2",
    "4",
    "—",
    "1m 7.5s",
    "30s hold",
  ]);
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Monthly", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Next month", exact: true }),
  ).toBeDisabled();
  await expectStat(summary(page), "Practice days", "5 / 7");
  await expectStat(summary(page), "Logged entries", "7");
  await expectStat(summary(page), "Total sets", "16");
  await expectStat(summary(page), "Total repetitions", "75");
  await expectStat(summary(page), "Total hold time", "1m 47.5s");
  await expect(comparison).toContainText("September 1, 2026");
  await expect(comparison).toContainText("September 7, 2026");
  await expectPreviousStat(comparison, "Practice days", "2 / 7");
  await expectPreviousStat(comparison, "Total repetitions", "10");
  await expectPreviousStat(comparison, "Total hold time", "8s");
  await expect(
    daily.getByRole("listitem", {
      name: "October 8, 2026: 0 seconds held, 0 entries, upcoming day",
      exact: true,
    }),
  ).toBeAttached();
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
  expect(
    stored.practiceLog.find(
      (entry: PracticeEntry) => entry.id === "future-push",
    ),
  ).toBeTruthy();
});

test("historical weeks and months include completed periods and empty periods stay finite", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-07T12:00:00+02:00"));
  await seed(page);
  await page.goto("/");
  await openAnalytics(page);
  await page
    .getByRole("button", { name: "Previous week", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Next week", exact: true }),
  ).toBeEnabled();
  await expectStat(summary(page), "Practice days", "4 / 7");
  await expectStat(summary(page), "Logged entries", "4");
  await expectStat(summary(page), "Total sets", "8");
  await expectStat(summary(page), "Total repetitions", "34");
  await expectStat(summary(page), "Total hold time", "1m");
  const comparison = page.getByRole("region", {
    name: "Period comparison",
    exact: true,
  });
  await expect(comparison).toContainText("September 21, 2026");
  await expect(comparison).toContainText("September 27, 2026");
  await expectPreviousStat(comparison, "Practice days", "1 / 7");
  await expectPreviousStat(comparison, "Total repetitions", "6");
  await page.getByRole("button", { name: "Next week", exact: true }).click();
  await expectStat(summary(page), "Total sets", "11");
  await expect(
    page.getByRole("button", { name: "Next week", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  await page
    .getByRole("button", { name: "Previous month", exact: true })
    .click();
  await expectStat(summary(page), "Practice days", "5 / 30");
  await expectStat(summary(page), "Total sets", "8");
  await expectStat(summary(page), "Total repetitions", "20");
  await expectStat(summary(page), "Total hold time", "28s");
  await expect(comparison).toContainText("August 1, 2026");
  await expect(comparison).toContainText("August 31, 2026");
  await expectPreviousStat(comparison, "Total sets", "0");
  await page
    .getByRole("button", { name: "Previous month", exact: true })
    .click();
  await expectStat(summary(page), "Practice days", "0 / 31");
  await expectStat(summary(page), "Logged entries", "0");
  await expectStat(summary(page), "Total sets", "0");
  await expectStat(summary(page), "Total repetitions", "0");
  await expectStat(summary(page), "Total hold time", "0s");
  await expect(page.locator(".page-content")).not.toContainText(/NaN|Infinity/);
  await page.getByRole("button", { name: "This month", exact: true }).click();
  await expectStat(summary(page), "Total sets", "16");
  await expect(
    page.getByRole("button", { name: "Next month", exact: true }),
  ).toBeDisabled();
});

test("practice-history shortcuts carry the skill filter and edited records immediately update analytics", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-07T12:00:00+02:00"));
  await seed(page);
  await page.goto("/");
  await navigate(page, "Practice log");
  const historySkill = page.getByRole("combobox", {
    name: "History skill",
    exact: true,
  });
  await expect(historySkill).toBeEnabled();
  await historySkill.selectOption("push-up");
  await page
    .getByRole("button", { name: "Weekly & monthly analytics", exact: true })
    .click();
  const analyticsSkill = page.getByRole("combobox", {
    name: "Analytics skill",
    exact: true,
  });
  await expect(analyticsSkill).toHaveValue("push-up");
  await expectStat(summary(page), "Practice days", "2 / 3");
  await expectStat(summary(page), "Total sets", "6");
  await expectStat(summary(page), "Total repetitions", "40");
  await analyticsSkill.selectOption("hollow-body-hold");
  await expectStat(summary(page), "Total repetitions", "0");
  await expectStat(summary(page), "Total hold time", "1m 7.5s");
  await navigate(page, "Practice log");
  await expect(historySkill).toBeEnabled();
  await historySkill.selectOption("push-up");
  const entry = page.getByRole("article", {
    name: "Push-up practice on October 7, 2026",
    exact: true,
  });
  await entry
    .getByRole("button", {
      name: "Edit Push-up practice on October 7, 2026",
      exact: true,
    })
    .click();
  await page
    .getByRole("spinbutton", { name: "Repetitions per set", exact: true })
    .fill("9");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(entry).toContainText("4 sets × 9 reps per set");
  await page
    .getByRole("button", { name: "Weekly & monthly analytics", exact: true })
    .click();
  await expect(analyticsSkill).toHaveValue("push-up");
  await expectStat(summary(page), "Total repetitions", "52");
  await page.reload();
  await openAnalytics(page);
  await analyticsSkill.selectOption("push-up");
  await expectStat(summary(page), "Total repetitions", "52");
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
  expect(stored.progress).toEqual({ "push-up": "mastered" });
  expect(stored.personalRecords).toEqual({
    "push-up": "10 reps",
    "hollow-body-hold": "30 sec hold",
    "pull-up": "5 reps",
  });
});

test("mobile monthly analytics use the local date and keep charts accessible without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // It is October 7 in Berlin while the UTC calendar date is still October 6.
  await page.clock.setFixedTime(new Date("2026-10-06T22:30:00Z"));
  await seed(page);
  await page.goto("/");
  await openAnalytics(page);
  await expectStat(summary(page), "Practice days", "3 / 3");
  await expectStat(summary(page), "Logged entries", "5");
  await page.getByRole("button", { name: "Monthly", exact: true }).click();
  await expectStat(summary(page), "Practice days", "5 / 7");
  await expectStat(summary(page), "Total sets", "16");
  const daily = page.getByRole("region", {
    name: "Daily training volume",
    exact: true,
  });
  await daily.scrollIntoViewIfNeeded();
  await expect(daily).toBeVisible();
  await daily.getByRole("button", { name: "Hold time", exact: true }).click();
  await expect(
    daily.getByRole("button", { name: "Hold time", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const chart = daily.getByRole("region", {
    name: "Scrollable monthly daily volume chart",
    exact: true,
  });
  await expect(chart).toHaveAttribute("tabindex", "0");
  await expect(
    chart
      .getByRole("list", { name: "Hold time by day", exact: true })
      .getByRole("listitem"),
  ).toHaveCount(31);
  await expect(
    chart.getByRole("listitem", {
      name: "October 7, 2026: 30 seconds held, 2 entries",
      exact: true,
    }),
  ).toBeAttached();
  await expect(
    page.getByRole("button", { name: "Next month", exact: true }),
  ).toBeDisabled();
  const viewport = await page.evaluate(() => ({
    width: innerWidth,
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(viewport.body).toBeLessThanOrEqual(viewport.width + 1);
  expect(viewport.document).toBeLessThanOrEqual(viewport.width + 1);
});
