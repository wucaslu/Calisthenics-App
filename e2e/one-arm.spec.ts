import { expect, test } from "@playwright/test";
import { skillById } from "../src/data/skills";

const milestones = [
  ["one-arm-one-leg-plank", 4, "AU8"],
  ["elevated-one-arm-push-up", 5, "AJ9"],
  ["ring-straddle-one-arm-push-up", 7, "AJ11"],
  ["bent-body-one-arm-dip", 7, "AK11"],
  ["straddle-one-arm-elbow-lever", 7, "AS11"],
  ["one-arm-elbow-lever", 8, "AS12"],
  ["one-arm-back-lever", 8, "BL12"],
  ["ring-one-arm-push-up", 9, "AJ13"],
  ["straight-body-one-arm-dip", 9, "AK13"],
  ["one-arm-straight-muscle-up", 9, "AR13"],
  ["one-arm-handstand", 10, "E14"],
  ["one-arm-ab-wheel", 10, "AU14"],
  ["one-arm-front-lever", 12, "BL16"],
  ["one-arm-dragon-press", 13, "BL17"],
  ["one-arm-planche", 16, "BL20"],
] as const;

for (const mobile of [false, true]) {
  test(`new one-arm workbook skills display exact levels and preserve records on ${mobile ? "mobile" : "desktop"}`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const search = page.getByRole("textbox", { name: "Search all skills" });
    const maximum = page.getByRole("combobox", {
      name: "Maximum skill level",
      exact: true,
    });

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
      await expect(panel.locator(".reference-level")).toContainText(
        `Level ${level} · ${cell}`,
      );
      await expect(panel.locator(".difficulty-source")).toHaveText(
        cell.startsWith("BL") ? "Community chart" : "OG2 book",
      );
      await expect(
        panel.getByRole("region", { name: "Muscles used" }),
      ).toBeVisible();
      await expect(
        panel.getByRole("region", { name: "Technique & form" }),
      ).toBeVisible();
      if (id === "one-arm-planche") {
        await panel
          .getByRole("textbox", { name: "Personal Record", exact: true })
          .fill("2 seconds each side");
      }
      if (mobile) await page.keyboard.press("Escape");
    }

    await maximum.selectOption("15");
    const planche = mobile
      ? page
          .locator(".mobile-skill")
          .filter({ has: page.getByText("One-Arm Planche", { exact: true }) })
      : page.locator('[data-id="one-arm-planche"]');
    await expect(planche).toHaveCount(0);
    await maximum.selectOption("16");
    await expect(planche).toHaveCount(1);
    await page.reload();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("calisthenics-skill-tree:v1")!)
            .personalRecords["one-arm-planche"],
      ),
    ).toBe("2 seconds each side");
  });
}

test("ab wheel equipment stays separate from gym equipment and persists in the profile", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Equipment", exact: true }).click();
  const wheel = page.locator(".equipment-card").filter({
    has: page.getByRole("heading", { name: "Ab wheel", exact: true }),
  });
  await expect(wheel).toHaveAttribute("aria-pressed", "false");
  await wheel.click();
  await expect(wheel).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("calisthenics-skill-tree:v1")!)
          .equipment,
    ),
  ).toContain("ab-wheel");
});
