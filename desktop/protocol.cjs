const path = require("node:path");

const APP_URL = "app://calisthenics/";

function isAppUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "app:" &&
      url.hostname === "calisthenics" &&
      !url.port &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function resolveAppPath(value, root) {
  if (!isAppUrl(value)) return null;
  try {
    let pathname = decodeURIComponent(new URL(value).pathname);
    if (pathname.includes("\\") || pathname.includes("\0")) return null;
    if (pathname.endsWith("/")) pathname += "index.html";
    const absoluteRoot = path.resolve(root);
    const target = path.resolve(absoluteRoot, `.${pathname}`);
    const relative = path.relative(absoluteRoot, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
    return target;
  } catch {
    return null;
  }
}

function isExternalUrl(value) {
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

module.exports = { APP_URL, isAppUrl, isExternalUrl, resolveAppPath };
