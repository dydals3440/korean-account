import assert from "node:assert/strict";
import spawn from "cross-spawn";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const result = spawn.sync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});
assert.equal(result.status, 0, `${result.error ?? ""}${result.stderr}`);
const output = JSON.parse(result.stdout);
const packs = Array.isArray(output) ? output : Object.values(output);
assert.equal(packs.length, 1);
const pack = packs[0];
const required = new Set([
  "package.json",
  "README.md",
  "README.en.md",
  "CHANGELOG.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
]);
const paths = new Set(pack.files.map((file) => file.path));
for (const path of required) assert(paths.has(path), `Missing package file: ${path}`);
for (const path of paths) {
  assert(required.has(path) || path.startsWith("dist/"), `Unexpected package file: ${path}`);
  assert(!/\.(?:png|jpe?g|gif|webp|pdf)$/i.test(path), `Media included: ${path}`);
}
assert(
  [...paths].some((path) => path.endsWith(".js.map")),
  "Keep JS source maps",
);
for (const name of ["README.md", "README.en.md"]) {
  const markdown = readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
  for (const [, target] of markdown.matchAll(/(?:\]\(|src=")([^\s)"]+)/g)) {
    assert(
      target.startsWith("https://") || target.startsWith("#"),
      `${name}: package-relative link ${target}`,
    );
    const match = target.match(
      /^https:\/\/(?:github\.com\/dydals3440\/korean-account\/blob|raw\.githubusercontent\.com\/dydals3440\/korean-account)\/main\/([^#?]+)/,
    );
    if (match)
      assert(
        existsSync(new URL(`../${match[1]}`, import.meta.url)),
        `${name}: missing repository target ${target}`,
      );
  }
}
assert(
  readFileSync(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8").includes(
    "Copyright (c) 2024 Colin McDonnell",
  ),
);
console.log(
  `Package contents OK: ${paths.size} files, ${pack.size} packed / ${pack.unpackedSize} unpacked bytes; docs and media excluded.`,
);
