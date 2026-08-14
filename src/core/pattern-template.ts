import type { PatternTemplate } from "../types";

const ALLOWED_CHARS = new Set<string>(["X", "-"]);

/**
 * 패턴 템플릿 문자열을 검증한 뒤 브랜드 타입으로 반환한다.
 *
 * v2부터 템플릿은 자릿수(`X`)와 시각 그루핑(`-`)만 표현한다.
 * 식별·과목·검증 자리는 `AccountPattern` 객체의 `*Position` 필드로 명시.
 *
 * @example
 * createPatternTemplate("XXX-XX-XXXXXX");   // 11자리, 3-2-6 그루핑
 * createPatternTemplate("XXXX-XX-XXXXXX");  // 12자리, 4-2-6 그루핑
 */
export function createPatternTemplate(template: string): PatternTemplate {
  if (template.length === 0) {
    throw new Error("Pattern template must be non-empty.");
  }
  for (const ch of template) {
    if (!ALLOWED_CHARS.has(ch)) {
      throw new Error(
        `Invalid pattern template "${template}" — unexpected character "${ch}". Allowed: X, -.`,
      );
    }
  }
  return template as PatternTemplate;
}
