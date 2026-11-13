import type { PatternTemplate } from "../../types";

const DIGIT_TOKEN = "X";

/** Number of digits a template holds, separators excluded. */
export function templateLength(template: PatternTemplate): number {
  let length = 0;
  for (const token of template) {
    if (token === DIGIT_TOKEN) {
      length += 1;
    }
  }
  return length;
}
