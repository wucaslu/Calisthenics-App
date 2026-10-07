import {
  _electron,
  expect,
  test,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const storageKey = "calisthenics-skill-tree:v1";

async function launchDesktop(profileDirectory: string) {
  const packagedExecutable = process.env.CALISTHENICS_DESKTOP_EXECUTABLE;
  // The sandbox exception is needed only for Linux CI running as root.
  const linuxFlags =
    process.platform === "linux"
      ? [
          "--no-sandbox",
          "--disable-gpu",
          ...(process.env.DISPLAY ? [] : ["--ozone-platform=headless"]),
        ]
      : [];
  return _electron.launch({
    executablePath: packagedExecutable
      ? path.resolve(packagedExecutable)
      : undefined,
    args: [
      ...linuxFlags,
      ...(packagedExecutable ? [] : [path.resolve("desktop")]),
    ],
    env: {
      ...Object.fromEntries(
        Object.entries(process.env).filter(([, value]) => value !== undefined),
      ),
      XDG_CONFIG_HOME: profileDirectory,
      APPDATA: profileDirectory,
      LOCALAPPDATA: profileDirectory,
    },
    timeout: 30000,
  });
}

async function hydratedWindow(application: ElectronApplication) {
  const page = await application.firstWindow();
  await expect(page).toHaveURL("app://calisthenics/");
  await expect(page.locator(".page-footer")).toContainText(
    "Progress saved on this device",
  );
  await expect(
    page.getByRole("combobox", { name: "Maximum skill level", exact: true }),
  ).toBeEnabled();
  return page;
}

async function navigate(page: Page, name: string) {
  const toggle = page.locator(".menu-button");
  if ((await toggle.getAttribute("aria-expanded")) !== "true")
    await toggle.click();
  await page
    .locator("#main-navigation")
    .getByRole("button", { name, exact: true })
    .click();
}

async function openPullUp(page: Page) {
  await page
    .getByRole("textbox", { name: "Search all skills" })
    .fill("Pull-up");
  const node = page.locator('[data-id="pull-up"] button');
  await expect(node).toBeVisible();
  await page.getByRole("button", { name: "Fit View", exact: true }).click();
  await node.click();
  const panel = page.locator(".detail-panel");
  await expect(
    panel.getByRole("heading", { name: "Pull-up", level: 2, exact: true }),
  ).toBeVisible();
  return panel;
}

test("the offline desktop app keeps its renderer isolated and preserves training after restart", async () => {
  const profileDirectory = await mkdtemp(
    path.join(tmpdir(), "calisthenics-desktop-"),
  );
  let application: ElectronApplication | undefined;
  try {
    application = await launchDesktop(profileDirectory);
    const page = await hydratedWindow(application);
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    expect(
      await page.evaluate(() => ({
        process: typeof Reflect.get(window, "process"),
        require: typeof Reflect.get(window, "require"),
        secureContext: window.isSecureContext,
      })),
    ).toEqual({
      process: "undefined",
      require: "undefined",
      secureContext: true,
    });
    expect(
      await application.evaluate(({ BrowserWindow }) => {
        const contents = BrowserWindow.getAllWindows()[0].webContents;
        // Electron exposes this inspection method at runtime, without public typings.
        const preferences = Reflect.get(contents, "getLastWebPreferences").call(
          contents,
        );
        return {
          nodeIntegration: preferences.nodeIntegration,
          contextIsolation: preferences.contextIsolation,
          sandbox: preferences.sandbox,
          webSecurity: preferences.webSecurity,
        };
      }),
    ).toEqual({
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    });
    const storageLocation = await application.evaluate(({ app }) => ({
      userData: app.getPath("userData"),
      appData: app.getPath("appData"),
    }));
    expect(storageLocation.userData).toBe(
      path.join(storageLocation.appData, "Calisthenics Skill Tree"),
    );

    // Main-process fetch exercises the handler itself, independently of CSP.
    expect(
      await application.evaluate(async ({ net }) => {
        const response = await net.fetch("app://other/index.html");
        return response.status;
      }),
    ).toBe(404);
    expect(
      await application.evaluate(async ({ net }) => {
        const response = await net.fetch(
          "app://calisthenics/..%2fdesktop/main.cjs",
        );
        return response.status;
      }),
    ).toBe(404);
    expect(
      await page.evaluate(() =>
        window.open("javascript:window.desktopEscape=true"),
      ),
    ).toBeNull();
    expect(application.windows()).toHaveLength(1);

    const maximum = page.getByRole("combobox", {
      name: "Maximum skill level",
      exact: true,
    });
    await maximum.selectOption("3");
    await expect(page.locator('[data-id="full-planche"]')).toHaveCount(0);
    const levels = await page
      .locator(".react-flow__node-skill .difficulty")
      .evaluateAll((nodes) =>
        nodes.map((node) =>
          Number(node.getAttribute("aria-label")?.match(/Level (\d+)/)?.[1]),
        ),
      );
    expect(levels.length).toBeGreaterThan(0);
    expect(levels.every((level) => level >= 1 && level <= 3)).toBe(true);

    const panel = await openPullUp(page);
    await panel
      .getByRole("textbox", { name: "Personal Record", exact: true })
      .fill("11 clean reps on desktop");
    await expect
      .poll(() =>
        page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key) ?? "{}").personalRecords?.[
              "pull-up"
            ],
          storageKey,
        ),
      )
      .toBe("11 clean reps on desktop");
    await panel
      .getByRole("button", { name: "Log practice", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Practised skill", exact: true }),
    ).toHaveValue("pull-up");
    await page.getByRole("spinbutton", { name: "Sets", exact: true }).fill("3");
    await page
      .getByRole("spinbutton", { name: "Repetitions per set", exact: true })
      .fill("8");
    await page
      .getByRole("textbox", { name: "Practice notes (optional)", exact: true })
      .fill("Offline desktop practice");
    await page
      .getByRole("button", { name: "Save practice", exact: true })
      .click();
    await expect(page.getByRole("article")).toContainText(
      "3 sets × 8 reps per set",
    );
    await expect
      .poll(() =>
        page.evaluate(
          (key) =>
            JSON.parse(localStorage.getItem(key) ?? "{}").practiceLog?.length,
          storageKey,
        ),
      )
      .toBe(1);
    let savedProfile = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
      storageKey,
    );
    await navigate(page, "Analytics");
    const summary = page.getByRole("region", {
      name: "Training summary",
      exact: true,
    });
    await expect(
      summary.getByRole("group", { name: "Total repetitions", exact: true }),
    ).toContainText("24");
    await expect(
      summary.getByRole("group", { name: "Total sets", exact: true }),
    ).toContainText("3");
    await page.getByRole("button", { name: "Monthly", exact: true }).click();
    await expect(
      summary.getByRole("group", { name: "Logged entries", exact: true }),
    ).toContainText("1");

    await navigate(page, "Overview");
    const backup = page.getByRole("region", {
      name: "Profile backup",
      exact: true,
    });
    const exportedFile = path.join(profileDirectory, "desktop-profile.json");
    await application.evaluate(({ session }, filename) => {
      const download = { status: "pending", filename: "" };
      Reflect.set(globalThis, "desktopBackupDownload", download);
      session.defaultSession.once("will-download", (_event, item) => {
        item.setSavePath(filename);
        download.filename = item.getFilename();
        item.once("done", (_doneEvent, state) => {
          download.status = state;
        });
      });
    }, exportedFile);
    await backup
      .getByRole("button", { name: "Export JSON", exact: true })
      .click();
    await expect
      .poll(() =>
        application!.evaluate(
          () => Reflect.get(globalThis, "desktopBackupDownload").status,
        ),
      )
      .toBe("completed");
    expect(
      await application.evaluate(
        () => Reflect.get(globalThis, "desktopBackupDownload").filename,
      ),
    ).toMatch(/^calisthenics-profile-\d{4}-\d{2}-\d{2}\.json$/);
    const exportedProfile = JSON.parse(await readFile(exportedFile, "utf8"));
    expect(exportedProfile).toEqual(savedProfile);
    const importedProfile = {
      ...exportedProfile,
      personalRecords: {
        ...exportedProfile.personalRecords,
        "pull-up": "15 reps imported from backup",
      },
    };
    const confirmation = page.waitForEvent("dialog");
    const upload = backup
      .getByLabel("Choose profile backup JSON", { exact: true })
      .setInputFiles({
        name: "browser-profile.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(importedProfile)),
      });
    const dialog = await confirmation;
    expect(dialog.type()).toBe("confirm");
    expect(dialog.message()).toContain("replaces your current progress");
    await dialog.accept();
    await upload;
    await expect(backup.getByRole("status")).toHaveText(
      "Profile imported and saved on this device.",
    );
    await expect
      .poll(() =>
        page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
          storageKey,
        ),
      )
      .toEqual(importedProfile);
    savedProfile = importedProfile;
    expect(pageErrors).toEqual([]);

    await application.close();
    application = undefined;
    application = await launchDesktop(profileDirectory);
    const restarted = await hydratedWindow(application);
    expect(
      await restarted.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
        storageKey,
      ),
    ).toEqual(savedProfile);
    await expect(
      restarted.getByRole("combobox", {
        name: "Maximum skill level",
        exact: true,
      }),
    ).toHaveValue("17");
    const restoredPanel = await openPullUp(restarted);
    await expect(
      restoredPanel.getByRole("textbox", {
        name: "Personal Record",
        exact: true,
      }),
    ).toHaveValue("15 reps imported from backup");
    await navigate(restarted, "Practice log");
    await expect(restarted.getByRole("article")).toContainText(
      "Offline desktop practice",
    );
  } finally {
    await application?.close();
    await rm(profileDirectory, { recursive: true, force: true });
  }
});
