import type { PatternTemplate } from "../types";

/** Number of digit tokens in a template (hyphens excluded). */
export function templateLength(template: PatternTemplate): number {
  let length = 0;

  for (const ch of template) {
    if (ch !== "-") {
      length += 1;
    }
  }

  return length;
}
