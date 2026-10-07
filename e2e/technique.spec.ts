import { expect, test, type Locator, type Page } from "@playwright/test";
import { skillById } from "../src/data/skills";
import { skillTechnique, techniqueSources } from "../src/data/technique";
import type { UserProfile } from "../src/types/skill";

const storageKey = "calisthenics-skill-tree:v1";

async function seed(page: Page, theme: "light" | "dark" = "dark") {
  const profile: UserProfile = {
    version: 2,
    progress: {},
    personalRecords: { "pull-up": "8 clean reps" },
    goals: ["full-planche"],
    equipment: ["floor", "pull-up-bar", "parallettes", "dip-bars", "rings"],
    archivedSkills: {},
    practiceLog: [],
    weeklySchedule: { monday: ["push-up"] },
  };
  await page.addInitScript(
    ({ key, initial, appearance }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(initial));
      localStorage.setItem("calisthenics-skill-tree:theme", appearance);
    },
    { key: storageKey, initial: profile, appearance: theme },
  );
}

async function openSkill(page: Page, id: string, mobile = false) {
  const skill = skillById[id];
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill(skill.name);
  if (mobile)
    await page
      .locator(".mobile-skill")
      .filter({ has: page.getByText(skill.name, { exact: true }) })
      .click();
  else {
    const node = page.locator(`[data-id="${id}"] button`);
    await expect(node).toBeVisible();
    await page.getByRole("button", { name: "Fit View", exact: true }).click();
    await node.click();
  }
  const panel = mobile
    ? page.getByRole("dialog")
    : page.locator(".detail-panel");
  await expect(
    panel.getByRole("heading", { name: skill.name, exact: true, level: 2 }),
  ).toBeVisible();
  return panel;
}

async function expectTechnique(panel: Locator, id: string) {
  const guidance = skillTechnique[id];
  const region = panel.getByRole("region", {
    name: "Technique & form",
    exact: true,
  });
  await expect(region).toBeVisible();
  for (const heading of [
    "Setup",
    "Form cues",
    "Common mistakes",
    "Technique sources",
  ])
    await expect(
      region.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  await expect(region.getByRole("listitem")).toHaveCount(
    guidance.setup.length +
      guidance.cues.length +
      guidance.mistakes.length +
      guidance.sources.length,
  );
  for (const text of [
    guidance.setup[0],
    guidance.cues[0],
    guidance.mistakes[0],
  ])
    await expect(region.getByText(text, { exact: true })).toBeVisible();
  await expect(region.getByRole("link")).toHaveCount(guidance.sources.length);
  for (const sourceId of guidance.sources) {
    const source = techniqueSources[sourceId];
    const link = region.getByRole("link", { name: source.title, exact: true });
    await expect(link).toHaveAttribute("href", source.url);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
  if (guidance.sourceScope)
    await expect(
      region.getByText(guidance.sourceScope, { exact: true }),
    ).toBeVisible();
  return region;
}

test("all four skill groups show fresh technique and instructional citations while personal records keep working", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  await expect(page.locator(".page-footer")).toContainText(
    "Progress saved on this device",
  );
  let previousCue: string | undefined;
  for (const id of ["pull-up", "90-degree-hold", "nordic-curl", "l-sit"]) {
    const panel = await openSkill(page, id);
    const region = await expectTechnique(panel, id);
    if (previousCue)
      await expect(region.getByText(previousCue, { exact: true })).toHaveCount(
        0,
      );
    previousCue = skillTechnique[id].cues[0];
    const record = panel.getByRole("textbox", {
      name: "Personal Record",
      exact: true,
    });
    await expect(record).toBeEnabled();
    if (id === "pull-up") {
      await expect(record).toHaveValue("8 clean reps");
      await record.fill("11 clean reps");
    } else await expect(record).toHaveValue("");
  }
  const foundation = await openSkill(page, "hollow-body-hold");
  await expectTechnique(foundation, "hollow-body-hold");
  await foundation
    .getByRole("button", { name: "Start Training", exact: true })
    .click();
  await expect(
    foundation.getByRole("button", { name: "Currently training", exact: true }),
  ).toBeVisible();
  await foundation
    .getByRole("button", { name: "Mark as Mastered", exact: true })
    .click();
  await expect(
    foundation.getByRole("button", { name: "Skill mastered", exact: true }),
  ).toBeVisible();
  await foundation
    .getByRole("button", { name: "Reset Progress", exact: true })
    .click();
  const goal = foundation.getByRole("button", {
    name: "Add to my goals",
    exact: true,
  });
  await goal.click();
  await expect(
    foundation.getByRole("button", { name: "One of your goals", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await foundation
    .getByRole("button", { name: "One of your goals", exact: true })
    .click();
  await expectTechnique(foundation, "hollow-body-hold");
  await page.reload();
  const panel = await openSkill(page, "pull-up");
  await expectTechnique(panel, "pull-up");
  await expect(
    panel.getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toHaveValue("11 clean reps");
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
  expect(saved.progress).toEqual({});
  expect(saved.goals).toEqual(["full-planche"]);
  expect(saved.practiceLog).toEqual([]);
  expect(saved.weeklySchedule).toEqual({ monday: ["push-up"] });
});

for (const theme of ["dark", "light"] as const)
  test(`mobile ${theme} mode keeps technique readable, sources keyboard reachable, and details dismissible`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seed(page, theme);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    for (const id of ["pelican-planche", "dragon-squat", "dragon-flag"]) {
      const panel = await openSkill(page, id, true);
      const region = await expectTechnique(panel, id);
      expect(
        await region.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const source = region.getByRole("link").first();
      await source.scrollIntoViewIfNeeded();
      await source.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(source).toBeFocused();
      await page.keyboard.press("Tab");
      expect(
        await panel.evaluate((element) =>
          element.contains(document.activeElement),
        ),
      ).toBe(true);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page.locator("body")).toHaveCSS("overflow", "visible");
    }
  });
