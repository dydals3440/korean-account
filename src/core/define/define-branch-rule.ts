import type { BranchRule } from "../../types";

/**
 * Returns the given branch rule unchanged, type-checked as a {@link BranchRule}.
 *
 * A branch rule runs after its pattern matches and adjusts the result: it can reroute it to
 * another institution, replace the account kind or override `capabilities.virtual`, e.g. to
 * split one format between a bank and its cooperative. Attach it as `pattern.branchRule`.
 * Detector filters (`categories`, `include`, ...) see the rerouted institution; rerouting to an
 * id the detector does not contain keeps the original institution.
 *
 * A returned adjustment adds `scoring.branchRuleMatch` (default 2) when the match has evidence:
 * an identifier or subject match, or the rule itself. Return `isFallback: true` from an
 * "otherwise" branch; it still applies, but does not count as evidence for `confidence`.
 *
 * @param rule - `describe` summarizes the rule for docs and debugging; `evaluate` receives the
 *   normalized digits and returns an adjustment, or `null` to leave the match unchanged.
 * @returns The same object.
 * @example
 * const routeToCoop = defineBranchRule({
 *   describe: "first digit 2 belongs to the coop",
 *   evaluate: (digits) => (digits[0] === "2" ? { institutionId: "my-coop" } : null),
 * });
 * // pattern: { template: patternTemplate("XXX-XX-XXXXXX"), kind: "new", branchRule: routeToCoop }
 */
export function defineBranchRule(rule: BranchRule): BranchRule {
  return rule;
}
