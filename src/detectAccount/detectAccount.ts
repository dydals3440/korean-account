import { createDetector } from "../createDetector";
import { type InstitutionId, institutions } from "../data";
import type { DetectOptions } from "../types";

/** 기본 institution 레지스트리로 만든 detector. */
export const defaultDetector = createDetector({ institutions });

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
