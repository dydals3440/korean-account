// Verifies the published dist actually runs on the `engines.node` floor.
//
// Build tooling (tsdown) may require a newer Node than the artifact does, so
// CI builds on .nvmrc and then executes this script on every supported Node
// (currently 22 and 24). This prevents lowering `engines` without verifying it.

import { globSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { sep } from "node:path";
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

check("registry barrel integrity", () => {
  if (esm.institutions.length !== 57) throw new Error(`${esm.institutions.length} !== 57`);
});

check("scoped detector from institution constants (ESM)", () => {
  const detector = esm.createDetector([esm.kb, esm.shinhan]);
  const top = detector.detect("110-436-387740")[0];
  if (top?.institution.id !== "shinhan") throw new Error(`got ${top?.institution.id}`);
});

check("scoped detector from institution constants (CJS)", () => {
  const detector = cjs.createDetector([cjs.kb, cjs.shinhan]);
  const top = detector.detect("110-436-387740")[0];
  if (top?.institution.id !== "shinhan") throw new Error(`got ${top?.institution.id}`);
});

// Each validator peer may only be imported from its own adapter directory.
// The regex includes a trailing [/'"] so subpath imports ("yup/lib/…") are
// caught too.
const ADAPTER_LIBS = ["zod", "valibot", "yup", "arktype"];
check("no module outside adapters/<lib> imports <lib>", () => {
  for (const lib of ADAPTER_LIBS) {
    const files = globSync(`${root}dist/**/*.{js,cjs}`).filter(
      (file) => !file.includes(`${sep}adapters${sep}${lib}${sep}`),
    );
    if (files.length < 10) throw new Error("glob matched suspiciously few files");
    const leak = new RegExp(`from\\s*["']${lib}["'/]|require\\(\\s*["']${lib}["'/]`);
    for (const file of files) {
      if (leak.test(readFileSync(file, "utf8"))) throw new Error(`${file} imports ${lib}`);
    }
  }
});

// The standard-schema adapter claims zero dependencies — enforce literally:
// no bare-specifier import anywhere in its emitted modules.
check("standard-schema adapter imports no external module", () => {
  const files = globSync(`${root}dist/adapters/standard-schema/**/*.{js,cjs}`);
  if (files.length < 2) throw new Error("standard-schema dist files missing");
  for (const file of files) {
    if (/from\s*["'][^./]|require\(\s*["'][^./]/.test(readFileSync(file, "utf8"))) {
      throw new Error(`${file} imports an external module`);
    }
  }
});

const stdEsm = await import(`${root}dist/adapters/standard-schema/index.js`);
const stdCjs = require(`${root}dist/adapters/standard-schema/index.cjs`);

check("standard-schema adapter validates (ESM+CJS)", () => {
  for (const std of [stdEsm, stdCjs]) {
    const pass = std.accountSchema["~standard"].validate("110-436-387740");
    const failCase = std.accountSchema["~standard"].validate("12345");
    if (pass.issues || !failCase.issues) throw new Error("unexpected validate result");
  }
});

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nRuntime compatibility OK.");
