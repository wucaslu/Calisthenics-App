const {
  app,
  BrowserWindow,
  dialog,
  Menu,
  protocol,
  session,
  shell,
} = require("electron");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const {
  APP_URL,
  isAppUrl,
  isExternalUrl,
  resolveAppPath,
} = require("./protocol.cjs");

const productName = "Calisthenics Skill Tree";
app.setName(productName);
// Keep progress outside the portable executable's temporary extraction folder.
app.setPath("userData", path.join(app.getPath("appData"), productName));
app.setAppUserModelId("com.wucaslu.calisthenicsskilltree");
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};
const policy =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-src 'none'; form-action 'none'";

let mainWindow;
function openExternal(url) {
  if (isExternalUrl(url))
    shell
      .openExternal(url)
      .catch(() =>
        dialog.showErrorBox(
          productName,
          "The link could not be opened in your browser.",
        ),
      );
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: productName,
    width: 1440,
    height: 1000,
    minWidth: 760,
    minHeight: 640,
    icon: path.join(__dirname, "icon.png"),
    backgroundColor: "#16191d",
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isAppUrl(url)) {
      event.preventDefault();
      openExternal(url);
    }
  });
  mainWindow.webContents.on("will-attach-webview", (event) =>
    event.preventDefault(),
  );
  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
  mainWindow.loadURL(APP_URL).catch(() => {
    dialog.showErrorBox(
      productName,
      "The app files could not be loaded. Download a fresh copy of the executable.",
    );
    app.quit();
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow?.isMinimized()) mainWindow.restore();
    mainWindow?.show();
    mainWindow?.focus();
  });
  app
    .whenReady()
    .then(() => {
      const root = app.isPackaged
        ? path.join(process.resourcesPath, "web")
        : path.join(__dirname, "..", "out");
      protocol.handle("app", async (request) => {
        const target = resolveAppPath(request.url, root);
        if (!target || !["GET", "HEAD"].includes(request.method))
          return new Response("Not found", { status: 404 });
        try {
          const data = await readFile(target);
          return new Response(request.method === "HEAD" ? null : data, {
            headers: {
              "Content-Type":
                contentTypes[path.extname(target)] ??
                "application/octet-stream",
              "Content-Security-Policy": policy,
              "X-Content-Type-Options": "nosniff",
            },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      });
      session.defaultSession.setPermissionRequestHandler(
        (_contents, _permission, callback) => callback(false),
      );
      session.defaultSession.setPermissionCheckHandler(() => false);
      Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          { label: "File", submenu: [{ role: "quit" }] },
          {
            label: "Edit",
            submenu: [
              { role: "undo" },
              { role: "redo" },
              { type: "separator" },
              { role: "cut" },
              { role: "copy" },
              { role: "paste" },
              { role: "selectAll" },
            ],
          },
          {
            label: "View",
            submenu: [
              { role: "reload" },
              { role: "resetZoom" },
              { role: "zoomIn" },
              { role: "zoomOut" },
              { role: "togglefullscreen" },
            ],
          },
          {
            label: "Help",
            submenu: [
              {
                label: "About Calisthenics Skill Tree",
                click: () =>
                  dialog.showMessageBox({
                    title: productName,
                    message: productName,
                    detail: `Version ${app.getVersion()}\nYour skill tree and training journal, available offline.`,
                  }),
              },
            ],
          },
        ]),
      );
      createWindow();
      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
      });
    })
    .catch((error) => {
      dialog.showErrorBox(productName, error.message);
      app.quit();
    });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
