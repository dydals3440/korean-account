import type { PatternTemplate } from "../../types";

const TEMPLATE_SYNTAX = /^[X-]+$/;

/**
 * Validates a template made of `X` (one digit) and `-` (group separator).
 *
 * @throws {TypeError} When the template is empty or has other characters.
 * @example
 * patternTemplate("XXX-XX-XXXXXX"); // 11 digits, grouped 3-2-6
 */
export function patternTemplate(template: string): PatternTemplate {
  if (template.length === 0) {
    throw new TypeError("korean-account: pattern template must be non-empty");
  }
  if (!TEMPLATE_SYNTAX.test(template)) {
    throw new TypeError(
      `korean-account: invalid pattern template "${template}" (only "X" and "-" are allowed)`,
    );
  }
  return template as PatternTemplate;
}
