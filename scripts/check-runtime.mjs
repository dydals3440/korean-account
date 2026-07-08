// 배포될 dist 가 `engines.node` 하한에서 실제로 실행되는지 확인한다.
//
// 빌드 도구(tsdown)는 Node 22.18+ 를 요구하지만, 그건 산출물의 제약이 아니다.
// 그래서 CI 는 Node 22 에서 빌드한 뒤 이 스크립트를 Node 20 에서 돌린다.
// `engines` 를 낮추면서 실제로는 검증하지 않는 사고를 막는 것이 목적이다.

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
  console.error(
    `이 Node (${process.versions.node}) 는 engines (${pkg.engines.node}) 보다 낮습니다.`,
  );
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

check("ESM/CJS 결과 동치", () => {
  const a = JSON.stringify(esm.detectAccount("3333-12-3456789"));
  const b = JSON.stringify(cjs.detectAccount("3333-12-3456789"));
  if (a !== b) throw new Error("ESM 과 CJS 결과가 다릅니다");
});

check("순수 헬퍼 (별도 청크에서 로드)", () => {
  if (esm.normalize("110-436-387740") !== "110436387740") throw new Error("normalize");
  if (esm.institutionByCode("088")?.nameKo !== "신한은행") throw new Error("institutionByCode");
});

check("extend() 로 만든 detector", () => {
  const extended = esm.defaultDetector.extend({ scoring: { identifierMatch: 6 } });
  if (extended.detect("110-436-387740").length === 0) throw new Error("빈 결과");
});

check("registry 청크 초기화 순서 (TDZ 회귀 가드)", () => {
  if (esm.institutions.length !== 57) throw new Error(`${esm.institutions.length} !== 57`);
});

// zod 없이도 메인 엔트리는 로드돼야 한다. `/schema` 는 optional peerDep 이다.
check("메인 엔트리는 zod 를 요구하지 않는다", () => {
  const source = readFileSync(`${root}dist/index.js`, "utf8");
  if (/from\s*["']zod["']/.test(source)) throw new Error("dist/index.js 가 zod 를 import 합니다");
});

if (failures.length > 0) {
  console.error(`\n${failures.length}건 실패:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\n런타임 호환 정상.");
