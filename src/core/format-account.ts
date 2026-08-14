import type { PatternTemplate } from "../types";

/**
 * Groups normalized digits into the template shape (`XXX-XX-XXXXXX` etc.).
 *
 * - When digits run short, remaining tokens are dropped along with a trailing
 *   hyphen (useful while the user is still typing).
 * - When digits outlast the template, the excess is appended verbatim.
 *
 * @example
 * import { patternTemplate } from "korean-account";
 * const tpl = patternTemplate("XXX-XXX-XXXXXX");
 * formatAccount("110436387740", tpl); // "110-436-387740"
 * formatAccount("110436", tpl);       // "110-436"
 */
export function formatAccount(digits: string, template: PatternTemplate): string {
  if (digits.length === 0) {
    return "";
  }

  let result = "";
  let cursor = 0;

  for (const ch of template) {
    if (ch === "-") {
      if (cursor === 0) {
        continue;
      }

      if (cursor >= digits.length) {
        break;
      }

      result += "-";

      continue;
    }

    if (cursor >= digits.length) {
      break;
    }

    result += digits[cursor];
    cursor += 1;
  }

  if (cursor < digits.length) {
    result += digits.slice(cursor);
  }

  return result;
}
