import type { PatternTemplate } from "../../types";

const GROUP_SEPARATOR = "-";

/**
 * Groups digits by a template. Short input stops at the last typed digit;
 * digits beyond the template are appended unchanged.
 *
 * @example
 * const template = patternTemplate("XXX-XXX-XXXXXX");
 * formatAccount("110436387740", template); // "110-436-387740"
 * formatAccount("110436", template);       // "110-436"
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
