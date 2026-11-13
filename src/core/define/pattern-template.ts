import type { PatternTemplate } from "../../types";

/** One or more `X` groups joined by single hyphens, e.g. `XXX-XX-XXXXXX`. */
const TEMPLATE_SYNTAX = /^X+(?:-X+)*$/;

/**
 * Validates a template made of `X` (one digit) and `-` (group separator).
 *
 * @throws {TypeError} When the template is empty, has other characters, or has a leading,
 *   trailing or doubled `-`.
 * @example
 * patternTemplate("XXX-XX-XXXXXX"); // 11 digits, grouped 3-2-6
 */
export function patternTemplate(template: string): PatternTemplate {
  if (template.length === 0) {
    throw new TypeError("korean-account: pattern template must be non-empty");
  }
  if (!TEMPLATE_SYNTAX.test(template)) {
    throw new TypeError(
      `korean-account: invalid pattern template "${template}" (expected "X" groups joined by single "-")`,
    );
  }
  return template as PatternTemplate;
}
