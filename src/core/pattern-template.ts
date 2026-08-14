import type { PatternTemplate } from "../types";

const ALLOWED_CHARS = new Set<string>(["X", "-"]);

/**
 * Validates a pattern template string and returns it as the branded type.
 *
 * A template expresses digit count (`X`) and visual grouping (`-`) only.
 * Identifier, subject, and check-digit positions are declared on the
 * `AccountPattern` object via the `*Position` fields.
 *
 * @example
 * patternTemplate("XXX-XX-XXXXXX");  // 11 digits, 3-2-6 grouping
 * patternTemplate("XXXX-XX-XXXXXX"); // 12 digits, 4-2-6 grouping
 */
export function patternTemplate(template: string): PatternTemplate {
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
