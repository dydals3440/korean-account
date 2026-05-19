import type { InstitutionId, RegisteredInstitution } from "../data";
import { defaultDetector } from "../detectAccount";
import type { DetectionResult, DetectOptions } from "../types";

/**
 * 입력의 1순위 후보만 반환한다. 매칭이 없으면 `null`.
 *
 * `detectAccount(input)[0] ?? null` 의 단축형. 폼 검증 / 자동이체 가드 등
 * 단일 결과만 필요할 때 사용한다.
 *
 * @example
 * const top = detectBest("110-436-387740");
 * if (top) console.log(top.institution.id, top.kind);
 *
 * @example 필터 적용
 * const top = detectBest("110-436-387740", { categories: ["bank"] });
 */
export function detectBest(
  input: string,
  options?: DetectOptions<InstitutionId>,
): DetectionResult<RegisteredInstitution> | null {
  return defaultDetector.detect(input, options)[0] ?? null;
}
