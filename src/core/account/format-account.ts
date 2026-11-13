import type { PatternTemplate } from "../../types";

const GROUP_SEPARATOR = "-";

/**
 * Returns the digits grouped with hyphens according to a pattern template.
 *
 * Built for formatting as the user types: a hyphen is added only once a digit follows it, so
 * partial input never ends with one, and digits beyond the template are appended ungrouped.
 * Detection results already carry this as `formatted`. Pass {@link normalizeAccount} output;
 * every input character fills one `X`, so existing hyphens would misalign the groups.
 *
 * @param digits - Normalized account digits, shorter or longer than the template.
 * @param template - Template from {@link patternTemplate} or a pattern's `template`.
 * @returns The grouped string, or `""` for empty input.
 * @example
 * const template = patternTemplate("XXX-XXX-XXXXXX");
 * formatAccount("110436387740", template);  // => "110-436-387740"
 * formatAccount("1104", template);          // => "110-4"
 * formatAccount("1104363877401", template); // => "110-436-3877401"
 */
export function formatAccount(digits: string, template: PatternTemplate): string {
  let formatted = "";
  let digitIndex = 0;

  for (const token of template) {
    if (digitIndex === digits.length) {
      break;
    }
    if (token !== GROUP_SEPARATOR) {
      formatted += digits.charAt(digitIndex);
      digitIndex += 1;
    } else if (digitIndex > 0) {
      formatted += GROUP_SEPARATOR;
    }
  }

  return formatted + digits.slice(digitIndex);
}
