import type { PatternTemplate } from "../types";

/**
 * 정규화된 digits를 템플릿(`XXX-YY-ZZZZ` 등) 형태로 그루핑한다.
 *
 * - digits가 짧으면 남는 토큰은 잘리고 끝의 하이픈도 떼낸다.
 * - digits가 길어 템플릿을 다 소진하면 남은 digits를 끝에 그대로 붙인다.
 *
 * @example
 * import { createPatternTemplate } from "korean-account";
 * const tpl = createPatternTemplate("XXX-XXX-XXXXXX");
 * formatAccount("110436387740", tpl); // "110-436-387740"
 * formatAccount("110436", tpl); // "110-436"
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
