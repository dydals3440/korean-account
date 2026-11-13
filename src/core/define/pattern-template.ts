import type { PatternTemplate } from "../../types";

/** One or more `X` groups joined by single hyphens, e.g. `XXX-XX-XXXXXX`. */
const TEMPLATE_SYNTAX = /^X+(?:-X+)*$/;

/**
 * Returns the template as a {@link PatternTemplate} after checking its characters.
 *
 * `X` stands for one digit and `-` separates display groups, so a template sets both the digit
 * count a pattern matches and how `formatted` and {@link formatAccount} group it. A template is
 * one or more `X` groups joined by single hyphens; where the groups split is up to the caller.
 *
 * @param template - Template such as `"XXX-XX-XXXXXX"`, using uppercase `X` and `-` only.
 * @returns The same string, branded for use as `pattern.template`.
 * @throws {TypeError} When `template` is empty, contains a character other than `X` or `-`, or
 *   has a leading, trailing or doubled `-`.
 * @example
 * patternTemplate("XXX-XX-XXXXXX"); // => "XXX-XX-XXXXXX" (11 digits, grouped 3-2-6)
 * patternTemplate("xxx-xx");        // throws TypeError: only "X" and "-" are allowed
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
