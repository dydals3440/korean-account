import type { PatternTemplate } from "../types";

/** 템플릿에서 하이픈을 제외한 토큰 수 (= 매칭에 필요한 digits 자릿수). */
export function templateLength(template: PatternTemplate): number {
  let length = 0;

  for (const ch of template) {
    if (ch !== "-") {
      length += 1;
    }
  }

  return length;
}
