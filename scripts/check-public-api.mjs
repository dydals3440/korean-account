#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

// 공개 API 스냅샷 가드. 소스가 아니라 실제로 배포되는 `dist/*.d.ts` 를 보므로
// 값 export 와 타입 export 를 모두 덮는다 (`Object.keys(import(...))` 는 타입을 못 본다).
// 의도적으로 API 를 바꿨다면 `pnpm check:api --update` 로 갱신해 diff 가 리뷰에 보이게 한다.

const SNAPSHOT_PATH = new URL("./public-api.snapshot.txt", import.meta.url);
const ENTRIES = [
  { name: ".", dts: "dist/index.d.ts" },
  { name: "./schema", dts: "dist/schema.d.ts" },
];

/**
 * `.d.ts` 말미의 `export { ... }` 블록에서 export 이름을 뽑는다.
 * `type Foo` 는 타입 export, `Bar as Baz` 는 외부에 보이는 `Baz` 를 취한다.
 *
 * @param {string} dts
 * @returns {string[]}
 */
function extractExports(dts) {
  const blocks = [...dts.matchAll(/export\s*\{([^}]*)\}/g)];
  if (blocks.length === 0) {
    throw new Error("export 블록을 찾지 못했습니다 — d.ts 형식이 바뀌었습니까?");
  }
  return blocks[blocks.length - 1][1]
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const isType = entry.startsWith("type ");
      const name = entry
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)
        .pop();
      return `${isType ? "type " : ""}${name}`;
    })
    .sort();
}

const actual = ENTRIES.flatMap(({ name, dts }) =>
  extractExports(readFileSync(dts, "utf8")).map((symbol) => `${name}\t${symbol}`),
).join("\n");

if (process.argv.includes("--update")) {
  writeFileSync(SNAPSHOT_PATH, `${actual}\n`);
  console.log("공개 API 스냅샷을 갱신했습니다. diff 를 확인하고 커밋하세요.");
  process.exit(0);
}

const expected = readFileSync(SNAPSHOT_PATH, "utf8").trimEnd();
if (actual === expected) {
  console.log(`공개 API 불변 — ${actual.split("\n").length}개 export.`);
  process.exit(0);
}

const expectedSet = new Set(expected.split("\n"));
const actualSet = new Set(actual.split("\n"));
const removed = [...expectedSet].filter((line) => !actualSet.has(line));
const added = [...actualSet].filter((line) => !expectedSet.has(line));

console.error("공개 API 가 바뀌었습니다.\n");
for (const line of removed) console.error(`  - ${line}`);
for (const line of added) console.error(`  + ${line}`);
console.error(
  "\n제거(-)는 breaking change 입니다. 의도한 변경이면 `pnpm check:api --update` 로 스냅샷을 갱신하고 changeset 에 명시하세요.",
);
process.exit(1);
