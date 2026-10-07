const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");
const {
  APP_URL,
  isAppUrl,
  isExternalUrl,
  resolveAppPath,
} = require("./protocol.cjs");

const root = path.resolve("desktop-test-fixtures", "out");

test("only the fixed app host without credentials or ports is trusted", () => {
  assert.equal(isAppUrl(APP_URL), true);
  assert.equal(isAppUrl(`${APP_URL}_next/static/app.js?version=2#chunk`), true);
  for (const value of [
    "app://other/",
    "app://calisthenics.example/",
    "app://calisthenics./",
    "app://calisthenics:80/",
    "app://user@calisthenics/",
    "app://user:password@calisthenics/",
    "https://calisthenics/",
    "file:///calisthenics/",
    "not a URL",
  ]) {
    assert.equal(isAppUrl(value), false, value);
  }
});

test("root pages and bundled assets resolve within the static export", () => {
  assert.equal(resolveAppPath(APP_URL, root), path.join(root, "index.html"));
  assert.equal(
    resolveAppPath(`${APP_URL}_next/static/css/app.css?version=2`, root),
    path.join(root, "_next", "static", "css", "app.css"),
  );
  assert.equal(
    resolveAppPath(`${APP_URL}fonts/Manrope%20Variable.woff2`, root),
    path.join(root, "fonts", "Manrope Variable.woff2"),
  );
  assert.equal(
    resolveAppPath(`${APP_URL}nested/`, root),
    path.join(root, "nested", "index.html"),
  );
});

test("encoded traversal cannot expose files outside the export or sibling directories", () => {
  for (const value of [
    `${APP_URL}..%2fpackage.json`,
    `${APP_URL}..%2fout-secrets%2fprivate.json`,
    `${APP_URL}_next/..%2f..%2f..%2fpackage.json`,
    `${APP_URL}%2f..%2f..%2fpackage.json`,
    "file:///etc/passwd",
    "app://other/index.html",
  ]) {
    assert.equal(resolveAppPath(value, root), null, value);
  }
});

test("URL-normalized dot segments still point inside the export", () => {
  for (const value of [
    `${APP_URL}../../package.json`,
    `${APP_URL}%2e%2e/%2e%2e/package.json`,
  ]) {
    assert.equal(resolveAppPath(value, root), path.join(root, "package.json"));
  }
});

test("Windows separators, NULs, and malformed escapes are rejected on every platform", () => {
  for (const pathname of [
    "..%5csecret.txt",
    "%5c%5cserver%5cshare%5csecret.txt",
    "C:%5cWindows%5csecret.txt",
    "_next%5cstatic%5capp.js",
    "assets\\secret.txt",
    "index.html%00.txt",
    "%",
    "%C0%AF",
  ]) {
    assert.equal(resolveAppPath(`${APP_URL}${pathname}`, root), null, pathname);
  }
});

test("system-browser links permit HTTP and HTTPS without credentials", () => {
  assert.equal(
    isExternalUrl("https://github.com/wucaslu/Calisthenics-App"),
    true,
  );
  assert.equal(isExternalUrl("http://example.com/reference"), true);
  for (const value of [
    APP_URL,
    "javascript:alert(1)",
    "data:text/html,hello",
    "file:///etc/passwd",
    "mailto:hello@example.com",
    "https://user:password@example.com/",
    "https://user@example.com/",
    "not a URL",
  ]) {
    assert.equal(isExternalUrl(value), false, value);
  }
});
