import { expect, test } from "@playwright/test";

const stages = [
  ["incline-pelican-curl", "Incline Pelican Curl", 5, "BI9"],
  ["pelican-curl", "Pelican Curl", 6, "BI10"],
  ["feet-elevated-pelican-curl", "Feet-Elevated Pelican Curl", 7, "BI11"],
  ["hefesto-negative", "Hefesto Negative", 8, "BI12"],
  ["hefesto", "Hefesto", 9, "BI13"],
  ["back-lever-hefesto", "Back Lever Hefesto", 10, "BI14"],
  ["archer-hefesto", "Archer Hefesto", 11, "BI15"],
  ["hand-on-wrist-hefesto", "Hand-on-Wrist Hefesto", 12, "BI16"],
] as const;

for (const mobile of [false, true]) {
  test(`workbook Hefesto progressions show exact levels, form, and filtering on ${mobile ? "mobile" : "desktop"}`, async ({
    page,
  }) => {
    // Exercise all eight chart stages and their details in one profile.
    test.setTimeout(60_000);
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const search = page.getByRole("textbox", { name: "Search all skills" });
    const maximum = page.getByRole("combobox", {
      name: "Maximum skill level",
      exact: true,
    });

    for (const [id, name, level, cell] of stages) {
      await search.fill(name);
      const node = mobile
        ? page
            .locator(".mobile-skill")
            .filter({ has: page.getByText(name, { exact: true }) })
        : page.locator(`[data-id="${id}"] button`);
      await expect(node.locator(".difficulty-score")).toHaveText(
        `Level ${level}/17`,
      );
      if (!mobile)
        await page
          .getByRole("button", { name: "Fit View", exact: true })
          .click();
      await node.click();
      const panel = mobile
        ? page.getByRole("dialog")
        : page.locator(".detail-panel");
      await expect(
        panel.getByRole("heading", { name, exact: true, level: 2 }),
      ).toBeVisible();
      await expect(panel.locator(".reference-level")).toContainText(
        `Community extension · Level ${level} · ${cell}`,
      );
      await expect(panel.locator(".difficulty-source")).toHaveText(
        "Community chart",
      );
      await expect(
        panel.getByRole("region", { name: "Technique & form" }),
      ).toBeVisible();
      if (id === "hand-on-wrist-hefesto") {
        await expect(panel.locator(".detail-description")).toContainText(
          "other hand holds the working wrist",
        );
        await panel
          .getByRole("textbox", { name: "Personal Record", exact: true })
          .fill("1 rep each side");
      }
      if (mobile) await page.keyboard.press("Escape");
    }

    await search.fill("Hefesto");
    await maximum.selectOption("9");
    const visibleNames = mobile
      ? page.locator(".mobile-skill")
      : page.locator(".react-flow__node-skill");
    await expect(
      visibleNames.filter({ has: page.getByText("Hefesto", { exact: true }) }),
    ).toHaveCount(1);
    for (const name of [
      "Back Lever Hefesto",
      "Archer Hefesto",
      "Hand-on-Wrist Hefesto",
    ]) {
      await expect(
        visibleNames.filter({ has: page.getByText(name, { exact: true }) }),
      ).toHaveCount(0);
    }
    await maximum.selectOption("12");
    await expect(
      visibleNames.filter({
        has: page.getByText("Hand-on-Wrist Hefesto", { exact: true }),
      }),
    ).toHaveCount(1);
    await page.reload();
    const profile = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("calisthenics-skill-tree:v1")!),
    );
    expect(profile.personalRecords["hand-on-wrist-hefesto"]).toBe(
      "1 rep each side",
    );
    expect(profile).not.toHaveProperty("savedGraphViews");
  });
}
