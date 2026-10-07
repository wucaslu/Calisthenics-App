import { expect, test, type Page } from "@playwright/test";

const chartCases = [
  {
    id: "full-planche",
    name: "Full Planche",
    level: 11,
    tier: "Advanced",
    source: "OG2 book",
    cell: "AE15",
  },
  {
    id: "ring-full-planche",
    name: "Ring Full Planche",
    level: 14,
    tier: "Elite",
    source: "OG2 book",
    cell: "AF18",
  },
  {
    id: "maltese",
    name: "Maltese",
    level: 17,
    tier: "Elite",
    source: "OG2 book",
    cell: "AM20",
  },
  {
    id: "hefesto",
    name: "Hefesto",
    level: 9,
    tier: "Intermediate",
    source: "Community chart",
    cell: "BI13",
  },
] as const;

async function openSkill(
  page: Page,
  entry: (typeof chartCases)[number],
  mobile: boolean,
) {
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill(entry.name);
  const skill = mobile
    ? page.locator(".mobile-skill").filter({
        has: page.getByText(entry.name, { exact: true }),
      })
    : page.locator(`[data-id="${entry.id}"] button`);
  await expect(skill.locator(".difficulty-score")).toHaveText(
    `Level ${entry.level}/17`,
  );
  if (!mobile)
    await page.getByRole("button", { name: "Fit View", exact: true }).click();
  await skill.click();
  return mobile ? page.getByRole("dialog") : page.locator(".detail-panel");
}

for (const mobile of [false, true]) {
  test(`workbook levels distinguish floor, ring, and community skills on ${mobile ? "mobile" : "desktop"}`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".page-footer")).toContainText(
      "Progress saved on this device",
    );
    const maximum = page.getByRole("combobox", {
      name: "Maximum skill level",
      exact: true,
    });
    await expect(maximum).toHaveValue("17");
    await expect(maximum.locator("option")).toHaveCount(17);

    for (const entry of chartCases) {
      const panel = await openSkill(page, entry, mobile);
      await expect(
        panel.getByRole("heading", {
          name: entry.name,
          exact: true,
          level: 2,
        }),
      ).toBeVisible();
      const difficulty = panel.locator(".detail-meta .difficulty");
      await expect(difficulty).toHaveAttribute(
        "aria-label",
        `Level ${entry.level} of 17, ${entry.tier}, ${entry.source}`,
      );
      await expect(difficulty.locator(".difficulty-bars i")).toHaveCount(17);
      await expect(difficulty.locator(".difficulty-bars i.filled")).toHaveCount(
        entry.level,
      );
      await expect(difficulty.locator(".difficulty-source")).toHaveText(
        entry.source,
      );
      await expect(panel.locator(".reference-level")).toContainText(
        `Level ${entry.level}`,
      );
      await expect(panel.locator(".reference-level")).toContainText(entry.cell);
      await expect(
        panel.getByRole("link", {
          name: "Overcoming Gravity 2nd Edition · uploaded exercise chart",
          exact: true,
        }),
      ).toHaveAttribute(
        "href",
        /docs.google.com\/spreadsheets\/d\/19l4tVfdTJLheLMwZBYqcw1oeEBPRh8mxngqrCz2YnVg/,
      );
      await expect(
        panel.getByRole("region", { name: "Muscles used" }),
      ).toBeVisible();
      expect(
        await panel
          .locator(".detail-meta")
          .evaluate((element) => element.scrollWidth <= element.clientWidth),
      ).toBe(true);
      if (mobile) await page.keyboard.press("Escape");
    }

    if (!mobile) {
      await page
        .getByRole("textbox", { name: "Search all skills" })
        .fill("Full Planche");
      await maximum.selectOption("11");
      await expect(page.locator('[data-id="full-planche"]')).toBeAttached();
      await expect(page.locator('[data-id="ring-full-planche"]')).toHaveCount(
        0,
      );
      const visibleLevels = await page
        .locator(".react-flow__node-skill .difficulty")
        .evaluateAll((elements) =>
          elements.map((element) =>
            Number(
              element.getAttribute("aria-label")?.match(/Level (\d+)/)?.[1],
            ),
          ),
        );
      expect(visibleLevels.length).toBeGreaterThan(0);
      expect(visibleLevels.every((level) => level <= 11)).toBe(true);
      await maximum.selectOption("14");
      await expect(
        page.locator('[data-id="ring-full-planche"]'),
      ).toBeAttached();
      await page
        .getByRole("textbox", { name: "Search all skills" })
        .fill("Maltese");
      await expect(page.locator('[data-id="maltese"]')).toHaveCount(0);
      await maximum.selectOption("17");
      await expect(page.locator('[data-id="maltese"]')).toBeAttached();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
