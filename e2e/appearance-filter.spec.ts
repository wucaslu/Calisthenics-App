import { expect, test, type Page } from "@playwright/test";

const profileKey = "calisthenics-skill-tree:v1";
const themeKey = "calisthenics-skill-tree:theme";

async function ready(page: Page) {
  await expect(page.locator(".page-footer")).toContainText(
    "Progress saved on this device",
  );
}

for (const mobile of [false, true]) {
  test(`light mode and available-only filtering preserve records on ${mobile ? "mobile" : "desktop"}`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await ready(page);
    const before = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      profileKey,
    );
    await page
      .getByRole("button", { name: "Switch to light mode", exact: true })
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(
      await page.evaluate((key) => localStorage.getItem(key), themeKey),
    ).toBe("light");
    expect(
      await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        profileKey,
      ),
    ).toEqual(before);
    await page.reload();
    await ready(page);
    await expect(
      page.getByRole("button", { name: "Switch to dark mode", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".react-flow.light")).toBeAttached();

    const available = page.getByRole("checkbox", {
      name: "Available only",
      exact: true,
    });
    await available.check();
    await expect(page.locator(".detail-panel")).toHaveCount(0);
    const items = page.locator(
      mobile ? ".mobile-skill" : ".react-flow__node-skill",
    );
    await expect(items.first()).toBeAttached();
    const states = await items
      .locator(mobile ? ".state-badge" : ".node-state")
      .allTextContents();
    expect(states.length).toBeGreaterThan(0);
    expect(states.every((state) => state.trim() === "Available")).toBe(true);
    await expect(page.locator(".tree-heading .count-pill")).toHaveText(
      `${states.length} ${states.length === 1 ? "skill" : "skills"}`,
    );
    const search = page.getByRole("textbox", { name: "Search all skills" });
    await search.fill("Full Planche");
    await expect(
      page.getByRole("heading", { name: "No available skills", exact: true }),
    ).toBeVisible();
    await expect(items).toHaveCount(0);
    await page
      .getByRole("button", { name: "Clear skill search", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Skill group", exact: true })
      .selectOption("legs");
    await page
      .getByRole("combobox", { name: "Maximum skill level", exact: true })
      .selectOption("2");
    await expect(items.first()).toBeAttached();
    expect(
      await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        profileKey,
      ),
    ).toEqual(before);

    const open = async (id: string, name: string) => {
      if (mobile)
        await page
          .locator(".mobile-skill")
          .filter({ has: page.getByText(name, { exact: true }) })
          .click();
      else {
        await page
          .getByRole("button", { name: "Fit View", exact: true })
          .click();
        await page.locator(`[data-id="${id}"] button`).click();
      }
      return page.locator(".detail-panel");
    };
    const panel = await open("bodyweight-squat", "Bodyweight Squat");
    await panel
      .getByRole("textbox", { name: "Personal Record", exact: true })
      .fill("25 clean reps");
    await panel
      .getByRole("button", { name: "Mark as Mastered", exact: true })
      .click();
    await expect(panel).toHaveCount(0);
    await expect(items.filter({ hasText: "Bodyweight Squat" })).toHaveCount(0);
    const split = await open("split-squat", "Split Squat");
    await split
      .getByRole("button", { name: "Start Training", exact: true })
      .click();
    await expect(split).toHaveCount(0);
    await expect(items.filter({ hasText: "Split Squat" })).toHaveCount(0);
    await available.uncheck();
    await expect(items.filter({ hasText: "Bodyweight Squat" })).toBeAttached();
    await expect(items.filter({ hasText: "Split Squat" })).toBeAttached();
    await page.reload();
    await ready(page);
    await expect(available).not.toBeChecked();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const saved = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      profileKey,
    );
    expect(saved.progress["bodyweight-squat"]).toBe("mastered");
    expect(saved.progress["split-squat"]).toBe("training");
    expect(saved.personalRecords["bodyweight-squat"]).toBe("25 clean reps");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("themes sync across tabs and still switch when local storage is blocked", async ({
  page,
  context,
  browser,
}) => {
  await page.goto("/");
  await ready(page);
  const second = await context.newPage();
  await second.goto("/");
  await ready(second);
  await page
    .getByRole("button", { name: "Switch to light mode", exact: true })
    .click();
  await expect(second.locator("html")).toHaveAttribute("data-theme", "light");
  await second
    .getByRole("button", { name: "Switch to dark mode", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await second.close();

  const blocked = await browser.newContext();
  try {
    const blockedPage = await blocked.newPage();
    await blockedPage.addInitScript(() => {
      for (const method of ["getItem", "setItem"])
        Object.defineProperty(Storage.prototype, method, {
          value() {
            throw new DOMException("Storage blocked", "SecurityError");
          },
        });
    });
    await blockedPage.goto(new URL("/", page.url()).href);
    await expect(blockedPage.locator(".page-footer")).toContainText(
      "Storage unavailable",
    );
    await blockedPage
      .getByRole("button", { name: "Switch to light mode", exact: true })
      .click();
    await expect(blockedPage.locator("html")).toHaveAttribute(
      "data-theme",
      "light",
    );
    await blockedPage
      .getByRole("button", { name: "Switch to dark mode", exact: true })
      .click();
    await expect(blockedPage.locator("html")).toHaveAttribute(
      "data-theme",
      "dark",
    );
  } finally {
    await blocked.close();
  }
});
