import { expect, test } from "@playwright/test";
import { skillById } from "../src/data/skills";

const milestones = [
  ["protracted-victorian-on-bars", 9, "BJ13"],
  ["victorian-on-bars", 11, "BJ15"],
  ["wide-victorian-on-bars", 13, "BJ17"],
  ["floor-victorian-one-forearm", 14, "BJ18"],
  ["floor-victorian-forearms", 16, "BJ20"],
  ["floor-victorian-straight-arms", 17, "BJ21"],
  ["straight-arm-touch", 16, null],
] as const;

for (const mobile of [false, true]) {
  test(`Victorian and SAT show their apparatus-specific levels and persist records on ${mobile ? "mobile" : "desktop"}`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".page-footer")).toContainText(
      "Progress saved on this device",
    );
    const group = page.getByRole("combobox", { name: "Skill group" });
    await group.selectOption("pull");
    await expect(group).toHaveValue("pull");
    const branch = page.getByRole("combobox", { name: "Skill branch" });
    await expect(branch.locator('option[value="victorian"]')).toHaveText(
      "Victorian & SAT",
    );
    await branch.selectOption("victorian");
    const search = page.getByRole("textbox", { name: "Search all skills" });
    for (const [id, level, cell] of milestones) {
      const skill = skillById[id];
      await search.fill(skill.name);
      const node = mobile
        ? page
            .locator(".mobile-skill")
            .filter({ has: page.getByText(skill.name, { exact: true }) })
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
        panel.getByRole("heading", { name: skill.name, exact: true, level: 2 }),
      ).toBeVisible();
      await expect(panel.locator(".difficulty-source")).toHaveText(
        cell ? "Community chart" : "App estimate",
      );
      if (cell)
        await expect(panel.locator(".reference-level")).toContainText(
          `Level ${level} · ${cell}`,
        );
      await expect(
        panel.getByRole("region", { name: "Muscles used" }),
      ).toBeVisible();
      await expect(
        panel.getByRole("region", { name: "Technique & form" }),
      ).toBeVisible();
      if (id === "straight-arm-touch") {
        await expect(panel.locator(".detail-description")).toContainText(
          "hips",
        );
        await panel
          .getByRole("textbox", { name: "Personal Record", exact: true })
          .fill("2 seconds");
      }
      if (mobile) await page.keyboard.press("Escape");
    }
    const maximum = page.getByRole("combobox", {
      name: "Maximum skill level",
      exact: true,
    });
    const sat = mobile
      ? page.locator(".mobile-skill").filter({
          has: page.getByText(skillById["straight-arm-touch"].name, {
            exact: true,
          }),
        })
      : page.locator('[data-id="straight-arm-touch"]');
    await maximum.selectOption("15");
    await expect(sat).toHaveCount(0);
    await maximum.selectOption("16");
    await expect(sat).toHaveCount(1);
    await page.reload();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("calisthenics-skill-tree:v1")!)
            .personalRecords["straight-arm-touch"],
      ),
    ).toBe("2 seconds");
  });
}
