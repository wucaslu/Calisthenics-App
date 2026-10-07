import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const storageKey = "calisthenics-skill-tree:v1";
const transferred = {
  version: 2,
  progress: { "push-up": "mastered" },
  personalRecords: { "push-up": "18 reps" },
  goals: ["full-planche"],
  equipment: ["floor", "rings"],
  archivedSkills: {
    "wall-handstand": {
      name: "Wall Handstand",
      progress: "mastered",
      personalRecord: "30 sec",
    },
  },
  practiceLog: [
    {
      id: "transferred-practice",
      skillId: "push-up",
      date: "2026-01-02",
      sets: 3,
      repetitions: 8,
      notes: "Imported session",
    },
  ],
};

async function overview(page: Page) {
  await expect(page.locator(".page-footer")).toContainText(
    /Progress saved on this device|Storage unavailable/,
  );
  if (
    (await page.locator(".menu-button").getAttribute("aria-expanded")) !==
    "true"
  )
    await page.locator(".menu-button").click();
  await page
    .locator("#main-navigation")
    .getByRole("button", { name: "Overview", exact: true })
    .click();
  const panel = page.getByRole("region", {
    name: "Profile backup",
    exact: true,
  });
  await expect(
    panel.getByRole("button", { name: "Export JSON", exact: true }),
  ).toBeEnabled();
  return panel;
}

async function profile(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    storageKey,
  );
}

function file(raw: string) {
  return {
    name: "profile.json",
    mimeType: "application/json",
    buffer: Buffer.from(raw),
  };
}

test("JSON import confirms replacement, saves all data, survives reload, and exports a portable backup", async ({
  page,
}) => {
  await page.goto("/");
  const panel = await overview(page);
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("replaces your current progress");
    await dialog.accept();
  });
  await panel
    .locator('input[type="file"]')
    .setInputFiles(file(JSON.stringify(transferred)));
  await expect(panel.getByRole("status")).toHaveText(
    "Profile imported and saved on this device.",
  );
  expect(await profile(page)).toEqual(transferred);
  await page.reload();
  await overview(page);
  expect(await profile(page)).toEqual(transferred);
  const downloadPromise = page.waitForEvent("download");
  await panel.getByRole("button", { name: "Export JSON", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^calisthenics-profile-\d{4}-\d{2}-\d{2}\.json$/,
  );
  const path = await download.path();
  expect(JSON.parse(await readFile(path!, "utf8"))).toEqual(transferred);
});

test("invalid or cancelled imports retain the current profile and can be retried", async ({
  page,
}) => {
  await page.goto("/");
  const panel = await overview(page);
  const original = await profile(page);
  const input = panel.locator('input[type="file"]');
  for (const invalid of [
    "{",
    '{"version":2}',
    JSON.stringify({ ...transferred, practiceLog: [{ sets: 0 }] }),
  ]) {
    await input.setInputFiles(file(invalid));
    await expect(panel.getByRole("status")).toContainText(
      "Your current profile has not changed.",
    );
    expect(await profile(page)).toEqual(original);
    await expect(
      panel.getByRole("button", { name: "Import JSON", exact: true }),
    ).toBeEnabled();
  }
  page.once("dialog", (dialog) => dialog.dismiss());
  await input.setInputFiles(file(JSON.stringify(transferred)));
  await expect(panel.getByRole("status")).toHaveText(
    "Import cancelled. Your current profile has not changed.",
  );
  expect(await profile(page)).toEqual(original);
  page.once("dialog", (dialog) => dialog.accept());
  await input.setInputFiles(file(JSON.stringify(transferred)));
  await expect(panel.getByRole("status")).toHaveText(
    "Profile imported and saved on this device.",
  );
  expect(await profile(page)).toEqual(transferred);
});

test("a failed storage write leaves the existing profile available for export", async ({
  page,
}) => {
  await page.goto("/");
  const panel = await overview(page);
  const original = await profile(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage full", "QuotaExceededError");
    };
  });
  page.once("dialog", (dialog) => dialog.accept());
  await panel
    .locator('input[type="file"]')
    .setInputFiles(file(JSON.stringify(transferred)));
  await expect(panel.getByRole("status")).toContainText(
    "could not be saved on this device. Your current profile has not changed.",
  );
  expect(await profile(page)).toEqual(original);
  await expect(
    panel.getByRole("button", { name: "Import JSON", exact: true }),
  ).toBeDisabled();
  await expect(
    panel.getByRole("button", { name: "Export JSON", exact: true }),
  ).toBeEnabled();
  const downloadPromise = page.waitForEvent("download");
  await panel.getByRole("button", { name: "Export JSON", exact: true }).click();
  const download = await downloadPromise;
  expect(JSON.parse(await readFile((await download.path())!, "utf8"))).toEqual(
    original,
  );
});
