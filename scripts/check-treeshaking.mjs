#!/usr/bin/env node
import { gzipSync } from "node:zlib";
import { build } from "esbuild";

// 트리셰이킹 회귀 가드. 소비자 입장에서 dist/ 를 실제로 번들해, 레지스트리를 쓰지
// 않는 import 경로에 94 KB 기관 테이블이 딸려 오지 않는지 확인한다.
// (v0.0.3 까지는 `normalize` 하나만 import 해도 11.5 KB gz 가 딸려 왔다.)
//
// 유출 판정은 크기가 아니라 기관 한글명(nameKo) 문자열로 한다 — registry 청크에만
// 존재하므로 훨씬 정확하다. `detectAccount` 케이스는 레지스트리를 *기대하는* 대조군
// 으로, 가드가 거짓 통과하고 있지 않은지 검증한다.

/** registry 청크에만 등장하는 문자열. 하나라도 번들에 보이면 레지스트리가 유입된 것. */
const REGISTRY_MARKERS = ["신한은행", "키움증권", "새마을금고"];

/**
 * @typedef {object} Case
 * @property {string} name
 * @property {string} entry      소비자가 작성했을 법한 import 문
 * @property {number} maxBytes   gzip 후 상한
 * @property {boolean} registry  레지스트리가 들어와야 정상인가
 */

/** @type {readonly Case[]} */
const CASES = [
  {
    name: "normalize",
    entry: `import { normalize } from "korean-account"; console.log(normalize("110-436-387740"));`,
    maxBytes: 1_000,
    registry: false,
  },
  {
    name: "formatAccount + createPatternTemplate",
    entry: `import { formatAccount, createPatternTemplate } from "korean-account"; console.log(formatAccount, createPatternTemplate);`,
    maxBytes: 1_000,
    registry: false,
  },
  {
    name: "defineInstitution",
    entry: `import { defineInstitution } from "korean-account"; console.log(defineInstitution);`,
    maxBytes: 1_000,
    registry: false,
  },
  {
    name: "순수 유틸 5개",
    entry: `import { normalize, formatAccount, extractIdentifier, extractSubject, scoreToConfidence } from "korean-account"; console.log(normalize, formatAccount, extractIdentifier, extractSubject, scoreToConfidence);`,
    maxBytes: 1_500,
    registry: false,
  },
  {
    name: "korean-account/schema",
    entry: `import { accountSchema, institutionIdSchema } from "korean-account/schema"; console.log(accountSchema, institutionIdSchema);`,
    maxBytes: 2_000,
    registry: false,
  },
  {
    // 대조군 — 레지스트리가 실제로 필요한 경로. 여기서 마커가 안 보이면
    // 가드가 아무것도 검사하지 못하고 있다는 뜻이다.
    name: "detectAccount (대조군: 레지스트리 필요)",
    entry: `import { detectAccount } from "korean-account"; console.log(detectAccount("110-436-387740"));`,
    maxBytes: 16_000,
    registry: true,
  },
];

/** @param {string} entry */
async function bundle(entry) {
  const result = await build({
    stdin: { contents: entry, resolveDir: process.cwd(), loader: "js" },
    bundle: true,
    format: "esm",
    minify: true,
    // 기본값 "ascii" 는 한글을 유니코드 escape (\uXXXX) 로 바꿔 마커 검색이 조용히
    // 실패한다. 대조군 케이스가 이걸 잡아냈다.
    charset: "utf8",
    write: false,
    logLevel: "silent",
    external: ["zod"],
  });
  return result.outputFiles[0].text;
}

const failures = [];

for (const testCase of CASES) {
  const code = await bundle(testCase.entry);
  const gzipped = gzipSync(code).byteLength;
  const leaked = REGISTRY_MARKERS.filter((marker) => code.includes(marker));
  const hasRegistry = leaked.length > 0;

  const sizeOk = gzipped <= testCase.maxBytes;
  const registryOk = hasRegistry === testCase.registry;
  const ok = sizeOk && registryOk;
  if (!ok) failures.push(testCase.name);

  const verdict = ok ? "PASS" : "FAIL";
  console.log(
    `${verdict}  ${testCase.name.padEnd(42)} gz=${String(gzipped).padStart(6)}B (≤${testCase.maxBytes}) registry=${hasRegistry}`,
  );

  if (!sizeOk) {
    console.log(`      └─ 크기 초과: ${gzipped}B > ${testCase.maxBytes}B`);
  }
  if (!registryOk) {
    console.log(
      hasRegistry
        ? `      └─ 레지스트리 유출: ${leaked.join(", ")} — pure 어노테이션이나 청크 분리가 깨졌다`
        : `      └─ 대조군인데 레지스트리가 없다 — 이 가드가 아무것도 검사하지 못하고 있다`,
    );
  }
}

if (failures.length > 0) {
  console.error(`\n트리셰이킹 회귀 ${failures.length}건: ${failures.join(", ")}`);
  console.error(
    "tsdown.config.ts 의 청크 그룹과 defaultDetector 의 /* @__PURE__ */ 를 확인하세요.",
  );
  process.exit(1);
}

console.log("\n트리셰이킹 정상 — 레지스트리는 필요한 경로에만 포함됩니다.");
