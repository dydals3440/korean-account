// Verifies the published dist actually runs on the `engines.node` floor.
//
// Build tooling (tsdown) may require a newer Node than the artifact does, so
// CI builds on .nvmrc and then executes this script on every supported Node
// (currently 22 and 24). This prevents lowering `engines` without verifying it.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));

const failures = [];
const check = (label, fn) => {
  try {
    fn();
    console.log(`  ✓ ${label}`);
  } catch (error) {
    failures.push(`${label} — ${error.message}`);
    console.log(`  ✗ ${label}`);
  }
};

const [major, minor] = process.versions.node.split(".").map(Number);
const [reqMajor, reqMinor] = pkg.engines.node
  .replace(/[^\d.]/g, "")
  .split(".")
  .map(Number);
if (major < reqMajor || (major === reqMajor && minor < (reqMinor ?? 0))) {
  console.error(`This Node (${process.versions.node}) is below engines (${pkg.engines.node}).`);
  process.exit(1);
}

console.log(`Node ${process.versions.node} · engines ${pkg.engines.node}\n`);

const esm = await import(`${root}dist/index.js`);
const cjs = require(`${root}dist/index.cjs`);

check("ESM detectBest", () => {
  const result = esm.detectBest("110-436-387740");
  if (result?.institution.id !== "shinhan") throw new Error(`got ${result?.institution.id}`);
});

check("CJS detectBest", () => {
  const result = cjs.detectBest("110-436-387740");
  if (result?.institution.id !== "shinhan") throw new Error(`got ${result?.institution.id}`);
});

check("ESM/CJS results are equivalent", () => {
  const a = JSON.stringify(esm.detect("3333-12-3456789"));
  const b = JSON.stringify(cjs.detect("3333-12-3456789"));
  if (a !== b) throw new Error("ESM and CJS results differ");
});

check("pure helpers load (from the non-registry chunk)", () => {
  if (esm.normalizeAccount("110-436-387740") !== "110436387740") {
    throw new Error("normalizeAccount");
  }
  if (esm.getInstitution("088")?.nameKo !== "신한은행") throw new Error("getInstitution");
});

check("createDetector with custom scoring", () => {
  const detector = esm.createDetector(esm.institutions, { scoring: { identifierMatch: 6 } });
  if (detector.detect("110-436-387740").length === 0) throw new Error("empty result");
});

check("registry chunk init order (TDZ regression guard)", () => {
  if (esm.institutions.length !== 57) throw new Error(`${esm.institutions.length} !== 57`);
});

// The main entry must load without zod. `/schema` is an optional peerDep.
check("main entry does not require zod", () => {
  const source = readFileSync(`${root}dist/index.js`, "utf8");
  if (/from\s*["']zod["']/.test(source)) throw new Error("dist/index.js imports zod");
});

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nRuntime compatibility OK.");
