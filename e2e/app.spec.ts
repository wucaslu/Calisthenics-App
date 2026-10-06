import { expect, test, type Page } from "@playwright/test";

async function openTreeSkill(page: Page, id: string, name: string) {
  await page.getByRole("textbox", { name: "Search all skills" }).fill(name);
  const node = page.locator(`[data-id="${id}"] button`);
  await expect(node).toBeVisible();
  await page.getByRole("button", { name: "Fit View", exact: true }).click();
  await node.click();
  await expect(
    page
      .locator(".detail-panel")
      .getByRole("heading", { name, exact: true, level: 2 }),
  ).toBeVisible();
}

test("desktop navigation collapses to expand the workspace and can be reopened", async ({
  page,
}) => {
  await page.goto("/");
  const sidebar = page.locator("#main-navigation");
  const toggle = page.locator(".menu-button");
  const main = page.locator(".app-main");
  const canvas = page.locator(".tree-canvas");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(toggle).toHaveAttribute("aria-controls", "main-navigation");
  for (const [width, sidebarWidth] of [
    [1440, 224],
    [1200, 205],
    [900, 180],
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(main).toHaveCSS("margin-left", `${sidebarWidth}px`);
    const canvasWidth = await canvas.evaluate((element) => element.clientWidth);
    await toggle.click();
    await expect(toggle).toHaveAccessibleName("Open navigation");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar).toBeHidden();
    await expect(sidebar).toHaveAttribute("inert", "");
    await expect(main).toHaveCSS("margin-left", "0px");
    await expect
      .poll(() => canvas.evaluate((element) => element.clientWidth))
      .toBeGreaterThan(canvasWidth + 100);
    await toggle.press("Tab");
    await expect(
      page.getByRole("textbox", { name: "Search all skills" }),
    ).toBeFocused();
    await toggle.focus();
    await toggle.press("Enter");
    await expect(toggle).toHaveAccessibleName("Close navigation");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toBeVisible();
    await expect(main).toHaveCSS("margin-left", `${sidebarWidth}px`);
  }
  await toggle.click();
  await page
    .getByRole("button", { name: "Set your goals", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Choose your next milestone." }),
  ).toBeVisible();
  await expect(sidebar).toBeHidden();
  await toggle.click();
  await expect(
    sidebar.getByRole("button", { name: "My goals", exact: false }),
  ).toHaveAttribute("aria-current", "page");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("mobile navigation closes with its button, Escape, backdrop, and selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sidebar = page.locator("#main-navigation");
  const main = page.locator(".app-main");
  const toggle = page.locator(".menu-button");
  const close = sidebar.getByRole("button", {
    name: "Close navigation",
    exact: true,
  });
  for (const dismissal of ["button", "escape", "backdrop"]) {
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toBeInViewport();
    await expect(close).toBeFocused();
    await expect(main).toHaveAttribute("inert", "");
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    if (dismissal === "button") await close.press("Enter");
    else if (dismissal === "escape") await page.keyboard.press("Escape");
    else
      await page
        .locator(".sidebar-backdrop")
        .click({ position: { x: 370, y: 200 } });
    await expect(sidebar).toHaveAttribute("aria-hidden", "true");
    await expect(sidebar).not.toBeInViewport();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await expect(main).not.toHaveAttribute("inert");
    await expect(page.locator("body")).toHaveCSS("overflow", "visible");
  }
  await toggle.click();
  await sidebar.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your progress, in perspective." }),
  ).toBeVisible();
  await expect(sidebar).not.toBeInViewport();
  await expect(toggle).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

for (const mobile of [false, true]) {
  test(`new planche skills show calibrated scores and preserve records on ${mobile ? "mobile" : "desktop"}`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const entries = [
      {
        id: "90-degree-hold",
        name: "90 Degree Hold",
        score: 7,
        movement: "Static",
        record: "4 seconds",
      },
      {
        id: "pelican-planche",
        name: "Pelican Planche",
        score: 10,
        movement: "Dynamic",
        record: "1 full cycle",
      },
    ];
    const open = async (entry: (typeof entries)[number]) => {
      if (mobile) {
        await page
          .getByRole("textbox", { name: "Search all skills" })
          .fill(entry.name);
        const card = page.locator(".mobile-skill").filter({
          has: page.getByText(entry.name, { exact: true }),
        });
        await expect(card.locator(".difficulty-score")).toHaveText(
          `${entry.score}/10`,
        );
        await card.click();
      } else {
        await openTreeSkill(page, entry.id, entry.name);
        await expect(
          page.locator(`[data-id="${entry.id}"] .difficulty-score`),
        ).toHaveText(`${entry.score}/10`);
      }
      return mobile ? page.getByRole("dialog") : page.locator(".detail-panel");
    };
    for (const entry of entries) {
      const panel = await open(entry);
      await expect(panel.locator(".movement-badge")).toHaveText(entry.movement);
      const score = panel.locator(".detail-meta .difficulty");
      await expect(score).toHaveAttribute(
        "aria-label",
        `Difficulty ${entry.score} of 10`,
      );
      await expect(score.locator(".difficulty-score")).toHaveText(
        `${entry.score}/10`,
      );
      await expect(score.locator(".difficulty-bars i.filled")).toHaveCount(
        entry.score,
      );
      await expect(panel.locator(".detail-description")).toContainText(
        entry.id === "90-degree-hold"
          ? "elbows free of the abdomen"
          : "Transition on rings from a planche to a back lever and return",
      );
      await expect(
        panel.getByRole("button", { name: "Start Training", exact: true }),
      ).toBeDisabled();
      await panel
        .getByRole("textbox", { name: "Personal Record", exact: true })
        .fill(entry.record);
      await panel
        .getByRole("button", { name: "Add to my goals", exact: true })
        .click();
      if (mobile) await page.keyboard.press("Escape");
    }
    await page.reload();
    for (const entry of entries) {
      const panel = await open(entry);
      await expect(
        panel.getByRole("textbox", { name: "Personal Record", exact: true }),
      ).toHaveValue(entry.record);
      await expect(
        panel.getByRole("button", { name: "One of your goals", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      if (mobile) await page.keyboard.press("Escape");
    }
    if (!mobile) {
      await page
        .getByRole("button", { name: "My goals", exact: false })
        .first()
        .click();
      for (const entry of entries) {
        const card = page.locator(".goal-path-card").filter({
          has: page.getByRole("heading", { name: entry.name, exact: true }),
        });
        await expect(card.locator(".difficulty-score")).toHaveText(
          `${entry.score}/10`,
        );
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("researched milestones show published levels, independent routes, and named lanes", async ({
  page,
}) => {
  await page.goto("/");
  const panel = page.locator(".detail-panel");
  await expect(
    panel.getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toBeEnabled();
  await openTreeSkill(page, "diamond-push-up", "Diamond Push-up");
  await expect(panel.locator(".reference-level")).toContainText(
    "Pushing progression · Level 4",
  );
  await expect(panel.locator(".detail-meta .difficulty")).toHaveAttribute(
    "aria-label",
    "Difficulty 3 of 10",
  );
  await expect(
    panel.getByRole("link", {
      name: "Recommended Routine · archived exercise levels",
    }),
  ).toHaveAttribute(
    "href",
    /github.com\/mazurio\/bodyweight-fitness-android\/blob\/19806813/,
  );
  await expect(
    page.locator('[data-id="lane-push-push-up"] .graph-lane'),
  ).toHaveText(/Push-up strength/);
  await openTreeSkill(page, "ring-muscle-up", "Ring Muscle-up");
  await expect(panel.locator(".prerequisite-list")).toContainText(
    "Ring Pull-up",
  );
  await expect(panel.locator(".prerequisite-list")).toContainText(
    "False-Grip Hang",
  );
  await expect(page.locator('[data-id="muscle-up"]')).toHaveCount(0);
  await openTreeSkill(page, "nordic-curl", "Nordic Curl");
  await expect(panel.locator(".detail-description")).toContainText(
    "without pushing off with the hands",
  );
  await expect(
    page.locator('[data-id="lane-legs-posterior-chain"] .graph-lane'),
  ).toHaveText(/Posterior chain/);
  await openTreeSkill(page, "hefesto", "Hefesto");
  await expect(
    panel.getByText("Custom app progression; no published level is assigned."),
  ).toBeVisible();
});

test("reorganization keeps retired records in the overview and retained records editable after reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("calisthenics-skill-tree:v1")) return;
    localStorage.setItem(
      "calisthenics-skill-tree:v1",
      JSON.stringify({
        version: 1,
        goals: ["pistol-squat", "assisted-pistol-squat"],
        equipment: ["floor"],
        progress: {
          "bodyweight-squat": "mastered",
          "split-squat": "mastered",
          "assisted-pistol-squat": "mastered",
          "pistol-squat": "mastered",
        },
        personalRecords: {
          "assisted-pistol-squat": "8 reps",
          "pistol-squat": "4 reps",
        },
      }),
    );
  });
  await page.goto("/");
  const panel = page.locator(".detail-panel");
  await expect(
    panel.getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.locator(".archived-skills summary").click();
  await expect(page.locator(".archived-skill-list")).toContainText(
    "Assisted Pistol Squat",
  );
  await expect(page.locator(".archived-skill-list")).toContainText("8 reps");
  await page.getByRole("button", { name: "Show Legs skills" }).click();
  await expect(page.locator('[data-id="assisted-pistol-squat"]')).toHaveCount(
    0,
  );
  await openTreeSkill(page, "pistol-squat", "Pistol Squat");
  await expect(
    panel.getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toHaveValue("4 reps");
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    panel.getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.locator(".archived-skills summary").click();
  await expect(page.locator(".archived-skill-list")).toContainText("8 reps");
});

test("one-leg steps leave the tree and goals while their records remain archived", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("calisthenics-skill-tree:v1")) return;
    const ids = [
      "one-leg-front-lever",
      "one-leg-back-lever",
      "one-leg-l-sit",
      "single-leg-glute-bridge",
    ];
    localStorage.setItem(
      "calisthenics-skill-tree:v1",
      JSON.stringify({
        version: 1,
        progress: Object.fromEntries(ids.map((id) => [id, "mastered"])),
        personalRecords: Object.fromEntries(ids.map((id) => [id, "8 seconds"])),
        goals: [...ids, "full-front-lever"],
        equipment: ["floor", "pull-up-bar", "rings", "parallettes", "gym"],
      }),
    );
  });
  await page.goto("/");
  await expect(
    page
      .locator(".detail-panel")
      .getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toBeEnabled();
  for (const [parent, id, name] of [
    [
      "advanced-tuck-front-lever",
      "straddle-front-lever",
      "Straddle Front Lever",
    ],
    ["advanced-tuck-back-lever", "straddle-back-lever", "Straddle Back Lever"],
    ["tuck-l-sit", "l-sit", "L-Sit"],
    ["glute-bridge", "nordic-curl-negative", "Nordic Curl Negative"],
  ]) {
    await openTreeSkill(page, id, name);
    await expect(
      page.getByRole("img", {
        name: `Edge from ${parent} to ${id}`,
        exact: true,
      }),
    ).toBeAttached();
    await expect(
      page.locator(
        '.react-flow__node-skill[data-id^="one-leg"], .react-flow__node-skill[data-id^="single-leg"]',
      ),
    ).toHaveCount(0);
  }
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("one-leg");
  await expect(
    page.getByRole("heading", { name: "No skills found" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "My goals", exact: false })
    .first()
    .click();
  await expect(page.locator(".goal-path-card")).toHaveCount(1);
  await expect(page.locator(".goal-path-card")).toContainText(
    "Full Front Lever",
  );
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.locator(".archived-skills summary").click();
  const archive = page.locator(".archived-skill-list");
  for (const name of [
    "One-Leg Front Lever",
    "One-Leg Back Lever",
    "One-Leg L-Sit",
    "Single-Leg Glute Bridge",
  ])
    await expect(archive).toContainText(name);
  await expect(archive).toContainText("8 seconds");
  await page.reload();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.locator(".archived-skills summary").click();
  await expect(page.locator(".archived-skill-list")).toContainText(
    "One-Leg Front Lever",
  );
});

test("muscle-up follows the ordered pulling chain without band assistance", async ({
  page,
}) => {
  await page.goto("/");
  const panel = page.locator(".detail-panel");
  await expect(
    panel.getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Show Pull skills" }).click();
  await page
    .getByRole("combobox", { name: "Skill branch" })
    .selectOption("muscle-up");
  for (const [source, target] of [
    ["pull-up", "chest-to-bar-pull-up"],
    ["chest-to-bar-pull-up", "explosive-pull-up"],
    ["explosive-pull-up", "high-pull-up"],
    ["high-pull-up", "muscle-up"],
  ])
    await expect(
      page.getByRole("img", {
        name: `Edge from ${source} to ${target}`,
        exact: true,
      }),
    ).toBeAttached();
  await expect(page.locator('[data-id="band-muscle-up"]')).toHaveCount(0);
  await openTreeSkill(page, "explosive-pull-up", "Explosive Pull-up");
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeDisabled();
  for (const [id, name] of [
    ["chest-to-bar-pull-up", "Chest-to-Bar Pull-up"],
    ["explosive-pull-up", "Explosive Pull-up"],
    ["high-pull-up", "High Pull-up"],
  ]) {
    await openTreeSkill(page, id, name);
    await expect(
      panel.getByRole("button", { name: "Mark as Mastered", exact: true }),
    ).toBeEnabled();
    await panel.getByRole("button", { name: "Mark as Mastered" }).click();
  }
  await openTreeSkill(page, "muscle-up", "Muscle-up");
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeDisabled();
  await openTreeSkill(page, "dip", "Dip");
  await panel.getByRole("button", { name: "Mark as Mastered" }).click();
  await openTreeSkill(page, "straight-bar-dip", "Straight-Bar Dip");
  await panel.getByRole("button", { name: "Mark as Mastered" }).click();
  await openTreeSkill(page, "muscle-up", "Muscle-up");
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Equipment", exact: true }).click();
  await expect(page.locator(".equipment-card")).toHaveCount(6);
  await expect(
    page.getByRole("heading", { name: "Resistance bands", exact: true }),
  ).toHaveCount(0);
});

test("advanced branches open their details and retain separate personal records", async ({
  page,
}) => {
  await page.goto("/");
  const panel = page.locator(".detail-panel");
  const record = panel.getByRole("textbox", {
    name: "Personal Record",
    exact: true,
  });
  await expect(record).toBeEnabled();
  const milestones = [
    ["back-lever", "Back Lever", "pull", "back-lever", "Static", "6 seconds"],
    ["maltese", "Maltese", "push", "maltese", "Static", "3 seconds"],
    ["pelican-press", "Pelican Press", "push", "pelican", "Dynamic", "2 reps"],
    ["hefesto", "Hefesto", "pull", "hefesto", "Dynamic", "1 rep"],
  ];
  for (const [id, name, group, branch, movement, value] of milestones) {
    await page
      .getByRole("button", {
        name: `Show ${group === "push" ? "Push" : "Pull"} skills`,
      })
      .click();
    await page
      .getByRole("combobox", { name: "Skill branch" })
      .selectOption(branch);
    await expect(page.locator(`[data-id="${id}"] button`)).toBeInViewport();
    await openTreeSkill(page, id, name);
    await expect(panel.locator(".movement-badge")).toHaveText(movement);
    await expect(panel.locator(".detail-description")).not.toBeEmpty();
    await expect(panel.locator(".exercise")).not.toHaveCount(0);
    await expect(record).toHaveValue("");
    await record.fill(value);
  }
  await page.reload();
  await expect(record).toBeEnabled();
  for (const [id, name, , , , value] of milestones) {
    await openTreeSkill(page, id, name);
    await expect(record).toHaveValue(value);
  }
});

test("blocked storage reports session-only progress and keeps training usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await expect(page.locator(".page-footer")).toContainText(
    "Storage unavailable — progress lasts for this session",
  );
  const panel = page.locator(".detail-panel");
  await panel
    .getByRole("textbox", { name: "Personal Record", exact: true })
    .fill("15 seconds");
  await expect(
    panel.getByRole("textbox", { name: "Personal Record", exact: true }),
  ).toHaveValue("15 seconds");
  await expect(panel.locator("#personal-record-storage")).toContainText(
    "Kept for this session",
  );
  await panel
    .getByRole("button", { name: "Planche Lean", exact: true })
    .click();
  await panel.getByRole("button", { name: "Mark as Mastered" }).click();
  await expect(
    panel.getByRole("button", { name: "Skill mastered" }),
  ).toBeVisible();
});

test("demo profile loads, graph zooms, and mastery unlocks downstream skills and persists", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Build strength. Unlock skills." }),
  ).toBeVisible();
  await expect(page.locator(".stat-card").first()).toContainText("8");
  const panel = page.locator(".detail-panel");
  await expect(
    panel.getByRole("heading", { name: "Tuck Planche", exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeDisabled();
  // A readable initial goal path, rather than an off-center, tiny graph.
  const initialCanvas = await page.locator(".react-flow__pane").boundingBox();
  await expect
    .poll(
      async () =>
        (await page.locator('[data-id="group-push"]').boundingBox())?.y ?? -1,
    )
    .toBeGreaterThan(initialCanvas!.y);
  await expect
    .poll(
      async () =>
        (await page.locator('[data-id="tuck-planche"]').boundingBox())?.width ??
        0,
    )
    .toBeGreaterThan(135);
  const before = await page
    .locator(".react-flow__viewport")
    .getAttribute("style");
  await page.getByRole("button", { name: "Zoom In", exact: true }).click();
  await expect(page.locator(".react-flow__viewport")).not.toHaveAttribute(
    "style",
    before!,
  );
  const zoomed = await page
    .locator(".react-flow__viewport")
    .getAttribute("style");
  const canvas = await page.locator(".react-flow__pane").boundingBox();
  await page.mouse.move(
    canvas!.x + canvas!.width - 35,
    canvas!.y + canvas!.height - 65,
  );
  await page.mouse.down();
  await page.mouse.move(
    canvas!.x + canvas!.width - 75,
    canvas!.y + canvas!.height - 95,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(page.locator(".react-flow__viewport")).not.toHaveAttribute(
    "style",
    zoomed!,
  );
  await page.getByRole("button", { name: "Fit View", exact: true }).click();
  await expect
    .poll(async () => {
      const last = await page.locator('[data-id="full-planche"]').boundingBox();
      return last ? last.y + last.height : Number.POSITIVE_INFINITY;
    })
    .toBeLessThan(canvas!.y + canvas!.height);
  await panel
    .getByRole("button", { name: "Planche Lean", exact: true })
    .click();
  await expect(
    panel.getByRole("heading", { name: "Planche Lean", exact: true }),
  ).toBeVisible();
  await panel.getByRole("button", { name: "Mark as Mastered" }).click();
  await expect(page.getByRole("status")).toContainText("mastered");
  await panel
    .getByRole("button", { name: "Tuck Planche", exact: true })
    .click();
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeEnabled();
  await panel
    .getByRole("button", { name: "Start Training", exact: true })
    .click();
  await expect(
    panel.getByRole("button", { name: "Currently training" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    panel.getByRole("button", { name: "Currently training" }),
  ).toBeVisible();
  await panel
    .getByRole("button", { name: "Planche Lean", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Reset Progress", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Tuck Planche", exact: true })
    .click();
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});

test("goals can be selected and their minimal prerequisite paths update", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "My goals", exact: false })
    .first()
    .click();
  const planche = page.locator(".goal-path-card").filter({
    has: page.getByRole("heading", { name: "Tuck Planche", exact: true }),
  });
  await expect(planche).toContainText("2 remaining skills");
  await expect(planche.locator(".path-steps button")).toHaveCount(2);
  await page
    .getByRole("textbox", { name: "Search target skills" })
    .fill("pistol");
  await page
    .getByRole("button", { name: "Pistol Squat Legs", exact: true })
    .click();
  await expect(
    page.locator(".goal-path-card").filter({
      has: page.getByRole("heading", { name: "Pistol Squat", exact: true }),
    }),
  ).toContainText("5 remaining skills");
  await page
    .getByRole("button", { name: "Remove Pistol Squat from goals" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Pistol Squat", exact: true }),
  ).toHaveCount(0);
});

test("equipment filters recommendations without clearing mastered skills", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Equipment", exact: true }).click();
  const bar = page.locator(".equipment-card").filter({
    has: page.getByRole("heading", { name: "Pull-up bar", exact: true }),
  });
  await expect(bar).toHaveAttribute("aria-pressed", "true");
  await bar.click();
  await expect(bar).toHaveAttribute("aria-pressed", "false");
  await expect(
    page
      .locator(".recommendation-card")
      .filter({ hasText: "Tuck Front Lever" }),
  ).toHaveCount(0);
  await expect(page.locator(".stat-card").first()).toContainText("8");
  await page.reload();
  await page.getByRole("button", { name: "Equipment", exact: true }).click();
  await expect(bar).toHaveAttribute("aria-pressed", "false");
});

test("the four groups, global search, and dashboard are functional", async ({
  page,
}) => {
  await page.goto("/");
  for (const name of ["Pull", "Push", "Legs", "Core"])
    await expect(
      page.getByRole("button", { name: `Show ${name} skills` }),
    ).toBeVisible();
  await page.getByRole("button", { name: "Show Legs skills" }).click();
  await expect(page.locator(".react-flow__node-skill")).toHaveCount(13);
  await expect(page.getByRole("combobox", { name: "Skill group" })).toHaveValue(
    "legs",
  );
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("freestanding");
  await expect(page.getByRole("combobox", { name: "Skill group" })).toHaveValue(
    "all",
  );
  await expect(
    page.getByRole("button", { name: "Freestanding Handstand, Available" }),
  ).toBeAttached();
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("not-a-skill");
  await expect(
    page.getByRole("heading", { name: "No skills found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Progress by group" }),
  ).toBeVisible();
  await expect(page.locator(".category-progress > div")).toHaveCount(4);
});

test("mobile lists, navigation, and skill dialog work without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".mobile-skill-list")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .locator(".mobile-skill")
    .filter({ hasText: "Planche Lean" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Planche Lean", exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Close skill details" }),
  ).toBeFocused();
  await expect(dialog.locator(".movement-badge")).toHaveText("Static");
  const record = dialog.getByRole("textbox", {
    name: "Personal Record",
    exact: true,
  });
  await record.fill("32 seconds");
  await record.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", {
      name: "Clear personal record for Planche Lean",
    }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(record).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page
    .locator(".mobile-skill")
    .filter({ hasText: "Planche Lean" })
    .click();
  await expect(record).toHaveValue("32 seconds");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page.getByRole("button", { name: "Show Legs skills" }).click();
  await expect(page.locator(".mobile-skill")).toHaveCount(13);
  await page
    .getByRole("combobox", { name: "Skill branch" })
    .selectOption("dragon-squat");
  await expect(page.locator(".mobile-skill")).toHaveCount(7);
  const dragon = page
    .locator(".mobile-skill")
    .filter({ has: page.getByText("Dragon Squat", { exact: true }) });
  await dragon.click();
  await expect(
    dialog.getByRole("heading", {
      name: "Dragon Squat",
      exact: true,
      level: 2,
    }),
  ).toBeVisible();
  await expect(dialog.locator(".movement-badge")).toHaveText("Dynamic");
  await expect(dialog.locator(".detail-description")).toContainText(
    "free leg passes behind",
  );
  await record.fill("2 reps per leg");
  await page.keyboard.press("Escape");
  await dragon.click();
  await expect(record).toHaveValue("2 reps per leg");
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("clicking tree nodes shows descriptions and saves independent personal records", async ({
  page,
}) => {
  await page.goto("/");
  const panel = page.locator(".detail-panel");
  const record = panel.getByRole("textbox", {
    name: "Personal Record",
    exact: true,
  });
  const lean = page.locator('[data-id="planche-lean"] button');
  await expect(lean.locator(".movement-badge")).toHaveText("Static");
  await lean.click();
  await expect(
    panel.getByRole("heading", { name: "Planche Lean", exact: true }),
  ).toBeVisible();
  await expect(panel.locator(".detail-description")).toContainText(
    "leaning your shoulders ahead of your wrists",
  );
  await record.fill("25 seconds");
  await page.locator('[data-id="tuck-planche"] button').click();
  await expect(record).toHaveValue("");
  await expect(
    panel.getByRole("button", { name: "Start Training", exact: true }),
  ).toBeDisabled();
  await record.fill("8 seconds");
  await page.reload();
  await expect(record).toHaveValue("8 seconds");
  await page.locator('[data-id="planche-lean"] button').click();
  await expect(record).toHaveValue("25 seconds");
  await panel
    .getByRole("button", { name: "Reset Progress", exact: true })
    .click();
  await expect(record).toHaveValue("25 seconds");
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("Bodyweight Squat");
  const squat = page.locator('[data-id="bodyweight-squat"] button');
  await expect(squat.locator(".movement-badge")).toHaveText("Dynamic");
  await squat.click();
  await expect(
    panel.getByRole("heading", { name: "Bodyweight Squat", exact: true }),
  ).toBeVisible();
  await expect(panel.locator(".movement-badge")).toHaveText("Dynamic");
  await expect(record).toHaveValue("");
  await record.fill("20 reps + 5 kg");
  await page.reload();
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("Bodyweight Squat");
  await squat.click();
  await expect(record).toHaveValue("20 reps + 5 kg");
  await panel
    .getByRole("button", { name: "Clear personal record for Bodyweight Squat" })
    .click();
  await expect(record).toHaveValue("");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const saved = JSON.parse(
          localStorage.getItem("calisthenics-skill-tree:v1")!,
        );
        return saved.personalRecords;
      }),
    )
    .toEqual({ "planche-lean": "25 seconds", "tuck-planche": "8 seconds" });
});

test("corrupt local storage falls back to the demo without breaking the app", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("calisthenics-skill-tree:v1", "broken json"),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Build strength. Unlock skills." }),
  ).toBeVisible();
  await expect(page.locator(".stat-card").first()).toContainText("8");
  await expect(page.locator(".page-footer")).toContainText(
    "Progress saved on this device",
  );
});
