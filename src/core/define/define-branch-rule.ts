import type { BranchRule } from "../../types";

/**
 * Declares a branch rule with full type checking.
 *
 * @example
 * const routeToCoop = defineBranchRule({
 *   describe: "first digit 2 belongs to the coop",
 *   evaluate: (digits) => (digits[0] === "2" ? { institutionId: "my-coop" } : null),
 * });
 */
export function defineBranchRule(rule: BranchRule): BranchRule {
  return rule;
}
