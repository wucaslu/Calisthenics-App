import { expect, test, type Page } from "@playwright/test";

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

interface StoredProfile {
  version: number;
  progress: Record<string, "training" | "mastered">;
  personalRecords: Record<string, string>;
  goals: string[];
  equipment: string[];
  archivedSkills: Record<string, unknown>;
  practiceLog?: PracticeEntry[];
}

function emptyProfile(): StoredProfile {
  return {
    version: 2,
    progress: {},
    personalRecords: {},
    goals: [],
    equipment: ["floor"],
    archivedSkills: {},
    practiceLog: [],
  };
}

async function seedProfile(page: Page, profile: StoredProfile) {
  await page.addInitScript(
    ({ key, initial }) => {
      // Reloads must exercise persistence rather than recreate the fixture.
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(initial));
    },
    { key: storageKey, initial: profile },
  );
}

async function savedProfile(page: Page): Promise<StoredProfile> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
}

async function navigate(page: Page, label: string) {
  await expect(page.locator(".page-footer")).toContainText(
    /Progress saved on this device|Storage unavailable/,
  );
  const sidebar = page.locator("#main-navigation");
  if (
    (await page.locator(".menu-button").getAttribute("aria-expanded")) !==
    "true"
  )
    await page.locator(".menu-button").click();
  await expect(page.locator(".menu-button")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await sidebar
    .getByRole("button", { name: label, exact: label !== "My goals" })
    .click();
}

async function openTreeSkill(page: Page, id: string, name: string) {
  await page.getByRole("textbox", { name: "Search all skills" }).fill(name);
  const node = page.locator(`[data-id="${id}"] button`);
  await expect(node).toBeVisible();
  await page.getByRole("button", { name: "Fit View", exact: true }).click();
  await node.click();
  const panel = page.locator(".detail-panel");
  await expect(
    panel.getByRole("heading", { name, exact: true, level: 2 }),
  ).toBeVisible();
  await expect(
    panel.getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toBeEnabled();
  return panel;
}

test.use({ timezoneId: "Europe/Berlin" });

test("version 1 upgrades without losing progress, records, goals, or equipment", async ({
  page,
}) => {
  const profile = emptyProfile();
  profile.version = 1;
  delete profile.practiceLog;
  profile.progress = { "push-up": "mastered", "hollow-body-hold": "mastered" };
  profile.personalRecords = { "push-up": "17 clean reps" };
  profile.goals = ["full-planche"];
  profile.equipment = ["floor", "rings"];
  await seedProfile(page, profile);
  await page.goto("/");
  const panel = await openTreeSkill(page, "push-up", "Push-up");
  await expect(
    panel.getByRole("button", { name: "Skill mastered", exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toHaveValue("17 clean reps");
  await expect.poll(async () => (await savedProfile(page)).version).toBe(2);
  const saved = await savedProfile(page);
  expect(saved.progress).toEqual(profile.progress);
  expect(saved.personalRecords).toEqual(profile.personalRecords);
  expect(saved.goals).toEqual(profile.goals);
  expect(saved.equipment).toEqual(profile.equipment);
  expect(saved.practiceLog).toEqual([]);
  await navigate(page, "Practice log");
  await expect(
    page.getByRole("heading", { name: "Every session adds up.", exact: true }),
  ).toBeVisible();
  await page.reload();
  expect((await savedProfile(page)).version).toBe(2);
});

test("hold and repetition logs can be edited and deleted without changing mastery or Personal Records", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-07T12:00:00+02:00"));
  const profile = emptyProfile();
  profile.progress = { "hollow-body-hold": "mastered", "push-up": "mastered" };
  profile.personalRecords = {
    "hollow-body-hold": "30 seconds",
    "push-up": "20 reps",
  };
  await seedProfile(page, profile);
  await page.goto("/");
  const panel = await openTreeSkill(
    page,
    "hollow-body-hold",
    "Hollow Body Hold",
  );
  await panel
    .getByRole("button", { name: "Log practice", exact: true })
    .click();
  const skill = page.getByRole("combobox", {
    name: "Practised skill",
    exact: true,
  });
  await expect(skill).toBeEnabled();
  await expect(skill).toHaveValue("hollow-body-hold");
  await page.getByRole("spinbutton", { name: "Sets", exact: true }).fill("4");
  await page
    .getByRole("spinbutton", { name: "Hold seconds per set", exact: true })
    .fill("18.5");
  await page
    .getByRole("textbox", { name: "Practice notes (optional)", exact: true })
    .fill("Controlled hollow holds");
  await page
    .getByRole("button", { name: "Save practice", exact: true })
    .click();
  const hold = page.getByRole("article", {
    name: "Hollow Body Hold practice on October 7, 2026",
    exact: true,
  });
  await expect(hold).toContainText("4 sets × 18.5 sec hold per set");
  await expect
    .poll(async () => (await savedProfile(page)).practiceLog?.length)
    .toBe(1);
  await navigate(page, "Skill tree");
  await navigate(page, "Practice log");
  await expect(skill).toBeEnabled();
  await skill.selectOption("push-up");
  await page.getByRole("spinbutton", { name: "Sets", exact: true }).fill("3");
  await page
    .getByRole("spinbutton", { name: "Repetitions per set", exact: true })
    .fill("8");
  await page
    .getByRole("textbox", { name: "Practice notes (optional)", exact: true })
    .fill("Full range push-ups");
  await page
    .getByRole("button", { name: "Save practice", exact: true })
    .click();
  await expect
    .poll(async () => (await savedProfile(page)).practiceLog?.length)
    .toBe(2);
  await page.reload();
  await navigate(page, "Practice log");
  const repetitions = page.getByRole("article", {
    name: "Push-up practice on October 7, 2026",
    exact: true,
  });
  await expect(repetitions).toContainText("3 sets × 8 reps per set");
  await expect(hold).toContainText("Controlled hollow holds");
  await hold
    .getByRole("button", {
      name: "Edit Hollow Body Hold practice on October 7, 2026",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("spinbutton", { name: "Hold seconds per set", exact: true }),
  ).toHaveValue("18.5");
  await page
    .getByRole("spinbutton", { name: "Hold seconds per set", exact: true })
    .fill("22.5");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(hold).toContainText("4 sets × 22.5 sec hold per set");
  await expect
    .poll(
      async () =>
        (await savedProfile(page)).practiceLog?.find(
          (entry) => entry.skillId === "hollow-body-hold",
        )?.holdSeconds,
    )
    .toBe(22.5);
  await page.reload();
  await navigate(page, "Practice log");
  await expect(hold).toContainText("22.5 sec hold");
  await repetitions
    .getByRole("button", {
      name: "Delete Push-up practice on October 7, 2026",
      exact: true,
    })
    .click();
  const deletion = repetitions.getByRole("group", {
    name: "Confirm practice deletion",
    exact: true,
  });
  await deletion
    .getByRole("button", { name: "Keep entry", exact: true })
    .click();
  await expect(repetitions).toBeVisible();
  await repetitions
    .getByRole("button", {
      name: "Delete Push-up practice on October 7, 2026",
      exact: true,
    })
    .click();
  await deletion
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(repetitions).toHaveCount(0);
  await expect
    .poll(async () => (await savedProfile(page)).practiceLog?.length)
    .toBe(1);
  const saved = await savedProfile(page);
  expect(saved.progress).toEqual(profile.progress);
  expect(saved.personalRecords).toEqual(profile.personalRecords);
  await page.reload();
  await navigate(page, "Practice log");
  await expect(repetitions).toHaveCount(0);
  await expect(hold).toContainText("22.5 sec hold");
});

test("practice trends count distinct days and skill filters show measured bests", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-07T12:00:00+02:00"));
  const profile = emptyProfile();
  profile.practiceLog = [
    {
      id: "hold-a",
      skillId: "hollow-body-hold",
      date: "2026-10-05",
      sets: 3,
      holdSeconds: 12,
      notes: "First session",
    },
    {
      id: "hold-b",
      skillId: "hollow-body-hold",
      date: "2026-10-05",
      sets: 2,
      holdSeconds: 18.5,
      notes: "Second session on the same day",
    },
    {
      id: "reps-a",
      skillId: "push-up",
      date: "2026-10-06",
      sets: 3,
      repetitions: 8,
      notes: "Pushing",
    },
    {
      id: "previous",
      skillId: "push-up",
      date: "2026-09-28",
      sets: 2,
      repetitions: 6,
      notes: "Previous window",
    },
  ];
  await seedProfile(page, profile);
  await page.goto("/");
  await navigate(page, "Practice log");
  await expect(
    page.getByRole("combobox", { name: "History skill", exact: true }),
  ).toBeEnabled();
  const trends = page.getByRole("region", {
    name: "Practice consistency",
    exact: true,
  });
  await expect(
    trends.getByRole("listitem", {
      name: "Oct 1–Oct 7: 2 of 7 practice days, 3 log entries",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    trends.getByRole("listitem", {
      name: "Sep 24–Sep 30: 1 of 7 practice days, 1 log entries",
      exact: true,
    }),
  ).toBeVisible();
  await expect(trends).toContainText("3 distinct practice days, all time");
  await page
    .getByRole("combobox", { name: "History skill", exact: true })
    .selectOption("hollow-body-hold");
  await expect(
    trends.getByRole("listitem", {
      name: "Oct 1–Oct 7: 1 of 7 practice days, 2 log entries",
      exact: true,
    }),
  ).toBeVisible();
  const bestHold = page
    .getByText("Best hold per set", { exact: true })
    .locator("..");
  await expect(bestHold).toContainText("18.5 sec");
  await expect(page.getByRole("article")).toHaveCount(2);
  await page
    .getByRole("combobox", { name: "History skill", exact: true })
    .selectOption("push-up");
  const bestRepetitions = page
    .getByText("Best repetitions per set", { exact: true })
    .locator("..");
  await expect(bestRepetitions).toContainText("8 reps");
  await expect(page.getByRole("article")).toHaveCount(2);
});

test("practice logs synchronize across tabs", async ({ page, context }) => {
  await page.clock.setFixedTime(new Date("2026-10-07T12:00:00+02:00"));
  await seedProfile(page, emptyProfile());
  await page.goto("/");
  await navigate(page, "Practice log");
  const second = await context.newPage();
  await second.clock.setFixedTime(new Date("2026-10-07T12:00:00+02:00"));
  await second.goto("/");
  await navigate(second, "Practice log");
  await expect(
    second.getByRole("combobox", { name: "Practised skill", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("combobox", { name: "Practised skill", exact: true })
    .selectOption("push-up");
  await page
    .getByRole("spinbutton", { name: "Repetitions per set", exact: true })
    .fill("7");
  await page
    .getByRole("textbox", { name: "Practice notes (optional)", exact: true })
    .fill("Shared across both tabs");
  await page
    .getByRole("button", { name: "Save practice", exact: true })
    .click();
  const entry = second.getByRole("article", {
    name: "Push-up practice on October 7, 2026",
    exact: true,
  });
  await expect(entry).toContainText("Shared across both tabs");
  await entry
    .getByRole("button", {
      name: "Delete Push-up practice on October 7, 2026",
      exact: true,
    })
    .click();
  await entry
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(
    page.getByRole("article", {
      name: "Push-up practice on October 7, 2026",
      exact: true,
    }),
  ).toHaveCount(0);
  await second.close();
});

test("mobile practice uses the local calendar date and validates entries without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  // Berlin is already October 7 while the UTC calendar date is still October 6.
  await page.clock.setFixedTime(new Date("2026-10-06T22:30:00Z"));
  await seedProfile(page, emptyProfile());
  await page.goto("/");
  await navigate(page, "Practice log");
  const skill = page.getByRole("combobox", {
    name: "Practised skill",
    exact: true,
  });
  await expect(skill).toBeEnabled();
  const date = page.getByLabel("Practice date", { exact: true });
  const alert = page
    .getByRole("region", { name: "Log practice", exact: true })
    .getByRole("alert");
  await expect(date).toHaveValue("2026-10-07");
  await page
    .getByRole("button", { name: "Save practice", exact: true })
    .click();
  await expect(alert).toHaveText(
    "Add repetitions or a hold duration for each set.",
  );
  await expect
    .poll(async () => (await savedProfile(page)).practiceLog?.length)
    .toBe(0);
  await skill.selectOption("hollow-body-hold");
  await page
    .getByRole("spinbutton", { name: "Hold seconds per set", exact: true })
    .fill("10.5");
  await date.fill("2026-10-08");
  await page
    .getByRole("button", { name: "Save practice", exact: true })
    .click();
  await expect(alert).toHaveText("Practice dates cannot be in the future.");
  await date.fill("2026-10-07");
  await page
    .getByRole("button", { name: "Save practice", exact: true })
    .click();
  await expect(
    page.getByRole("article", {
      name: "Hollow Body Hold practice on October 7, 2026",
      exact: true,
    }),
  ).toContainText("10.5 sec hold");
  await expect
    .poll(async () => (await savedProfile(page)).practiceLog?.length)
    .toBe(1);
  expect((await savedProfile(page)).progress).toEqual({});
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await navigate(page, "Practice log");
  await expect(
    page.getByRole("article", {
      name: "Hollow Body Hold practice on October 7, 2026",
      exact: true,
    }),
  ).toBeVisible();
});

test("an alternative route keeps shared prerequisites and gives a single goal path", async ({
  page,
}) => {
  const profile = emptyProfile();
  profile.progress = {
    "dead-hang": "mastered",
    "scapular-pull-up": "mastered",
    "chin-up": "mastered",
  };
  profile.goals = ["tuck-front-lever"];
  profile.equipment = ["floor", "rings"];
  await seedProfile(page, profile);
  await page.goto("/");
  let panel = await openTreeSkill(page, "tuck-front-lever", "Tuck Front Lever");
  await expect(
    panel.getByRole("article", {
      name: "Chin-up foundation prerequisite route",
      exact: true,
    }),
  ).toContainText("2/3 mastered");
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeDisabled();
  await navigate(page, "My goals");
  const goal = page.locator(".goal-path-card").filter({
    has: page.getByRole("heading", { name: "Tuck Front Lever", exact: true }),
  });
  await expect(goal).toContainText("2 remaining skills");
  await expect(goal.locator(".path-steps button")).toHaveCount(2);
  await expect(goal.locator(".path-steps")).toContainText("Hollow Body Hold");
  await expect(goal.locator(".path-steps")).not.toContainText("Pull-up");
  await navigate(page, "Skill tree");
  panel = await openTreeSkill(page, "hollow-body-hold", "Hollow Body Hold");
  await panel
    .getByRole("button", { name: "Mark as Mastered", exact: true })
    .click();
  panel = await openTreeSkill(page, "tuck-front-lever", "Tuck Front Lever");
  await expect(
    panel.getByRole("article", {
      name: "Chin-up foundation prerequisite route",
      exact: true,
    }),
  ).toContainText("Route ready");
  await expect(
    panel.getByRole("article", {
      name: "Standard preparation prerequisite route",
      exact: true,
    }),
  ).toContainText("2/3 mastered");
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeEnabled();
  await panel
    .getByRole("button", { name: "Start Training", exact: true })
    .click();
  await expect(
    panel.getByRole("button", { name: "Currently training", exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await savedProfile(page)).progress["tuck-front-lever"])
    .toBe("training");
  expect((await savedProfile(page)).progress["pull-up"]).toBeUndefined();
  await page.reload();
  panel = await openTreeSkill(page, "tuck-front-lever", "Tuck Front Lever");
  await expect(
    panel.getByRole("button", { name: "Currently training", exact: true }),
  ).toBeVisible();
});

test("resetting a prerequisite preserves mastery while another full route remains", async ({
  page,
}) => {
  const profile = emptyProfile();
  profile.progress = {
    "dead-hang": "mastered",
    "scapular-pull-up": "mastered",
    "chin-up": "mastered",
    "pull-up": "mastered",
    "hollow-body-hold": "mastered",
    "tuck-front-lever": "mastered",
  };
  profile.equipment = ["floor", "pull-up-bar"];
  await seedProfile(page, profile);
  await page.goto("/");
  let panel = await openTreeSkill(page, "pull-up", "Pull-up");
  await panel
    .getByRole("button", { name: "Reset Progress", exact: true })
    .click();
  panel = await openTreeSkill(page, "tuck-front-lever", "Tuck Front Lever");
  await expect(
    panel.getByRole("button", { name: "Skill mastered", exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await savedProfile(page)).progress["tuck-front-lever"])
    .toBe("mastered");
  panel = await openTreeSkill(page, "chin-up", "Chin-up");
  await panel
    .getByRole("button", { name: "Reset Progress", exact: true })
    .click();
  panel = await openTreeSkill(page, "tuck-front-lever", "Tuck Front Lever");
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeDisabled();
  await expect
    .poll(async () => (await savedProfile(page)).progress["tuck-front-lever"])
    .toBeUndefined();
});

test("equipment substitutions unlock eligible practice and keep ring-specific skills on rings", async ({
  page,
}) => {
  const profile = emptyProfile();
  profile.progress = {
    "hollow-body-hold": "mastered",
    "tuck-l-sit": "mastered",
  };
  await seedProfile(page, profile);
  await page.goto("/");
  let panel = await openTreeSkill(page, "l-sit", "L-Sit");
  await expect(
    panel.getByRole("article", { name: "Floor equipment setup", exact: true }),
  ).toContainText("Available");
  await expect(
    panel.getByRole("article", {
      name: "Standard setup equipment setup",
      exact: true,
    }),
  ).toContainText("Parallettes · missing");
  await expect(
    panel.getByRole("article", {
      name: "Dip bars equipment setup",
      exact: true,
    }),
  ).toContainText("Equipment missing");
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeEnabled();
  await panel
    .getByRole("button", { name: "Start Training", exact: true })
    .click();
  await expect
    .poll(async () => (await savedProfile(page)).progress["l-sit"])
    .toBe("training");
  await navigate(page, "Equipment");
  await page
    .locator(".equipment-card")
    .filter({
      has: page.getByRole("heading", { name: "Parallettes", exact: true }),
    })
    .click();
  await navigate(page, "Skill tree");
  panel = await openTreeSkill(page, "90-degree-hold", "90 Degree Hold");
  await expect(
    panel.getByRole("article", {
      name: "Parallettes equipment setup",
      exact: true,
    }),
  ).toContainText("Available");
  for (const [id, name] of [
    ["pelican-planche", "Pelican Planche"],
    ["ring-muscle-up", "Ring Muscle-up"],
  ]) {
    panel = await openTreeSkill(page, id, name);
    await expect(
      panel.getByRole("heading", { name: "Equipment needed", exact: true }),
    ).toBeVisible();
    await expect(
      panel.getByRole("heading", { name: "Equipment options", exact: true }),
    ).toHaveCount(0);
    await expect(panel.locator(".equipment-chips")).toContainText(
      "Rings · missing",
    );
  }
  await navigate(page, "Equipment");
  await page
    .locator(".equipment-card")
    .filter({ has: page.getByRole("heading", { name: "Rings", exact: true }) })
    .click();
  await navigate(page, "Skill tree");
  panel = await openTreeSkill(page, "ring-muscle-up", "Ring Muscle-up");
  await expect(panel.locator(".equipment-chips")).toContainText("Rings");
  await expect(panel.locator(".equipment-chips")).not.toContainText("missing");
  panel = await openTreeSkill(page, "muscle-up", "Muscle-up");
  await expect(panel.locator(".equipment-chips")).toContainText(
    "Pull-up bar · missing",
  );
});
