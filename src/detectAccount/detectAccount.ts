import { createDetector } from "../createDetector";
import { type InstitutionId, institutions } from "../data";
import type { DetectOptions } from "../types";

/**
 * 기본 institution 레지스트리로 만든 detector.
 *
 * 아래 pure 어노테이션은 필수다. 이 호출이 최상위 side effect 로 보이면 번들러가
 * `institutions` (94 KB) 를 버리지 못해, `normalize` 하나만 import 한 소비자에게도
 * 레지스트리 전체가 딸려 간다. `scripts/check-treeshaking.mjs` 가 회귀를 막는다.
 */
export const defaultDetector = /* @__PURE__ */ createDetector({ institutions });

/**
 * 입력 계좌번호를 분석해 후보 institution / kind / subject / capabilities 를 반환한다.
 *
 * `options.include` / `options.exclude` 는 등록된 `InstitutionId` literal 에
 * 대해 autocomplete 가 동작한다 (외부 확장 id 등 임의 string 도 허용).
 *
 * @example
 * detectAccount("110-436-387740");
 * detectAccount("3333-12-3456789", { categories: ["bank"] });
 * detectAccount("110-436-387740", { include: ["shinhan", "kb", "hana"] });
 */
export function detectAccount(input: string, options?: DetectOptions<InstitutionId>) {
  return defaultDetector.detect(input, options);
}
