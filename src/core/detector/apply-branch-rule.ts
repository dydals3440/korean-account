import type { AccountKind, AccountPattern, Institution } from "../../types";

/** Result of applying a pattern's branch rule. */
export interface BranchRuleOutcome<TInstitution extends Institution> {
  readonly institution: TInstitution;
  readonly kind: AccountKind;
  /** Overrides `capabilities.virtual`, or `null` to derive it. */
  readonly virtualOverride: boolean | null;
  /** Score to add on top of the pattern score. */
  readonly bonus: number;
}

export interface ApplyBranchRuleContext<TInstitution extends Institution> {
  readonly institutionById: ReadonlyMap<string, TInstitution>;
  /** Weight added when the rule produces an adjustment. */
  readonly bonus: number;
}

/** Applies the matched pattern's branch rule, which may reroute the institution or replace the kind. */
export function applyBranchRule<TInstitution extends Institution>(
  digits: string,
  pattern: AccountPattern,
  institution: TInstitution,
  context: ApplyBranchRuleContext<TInstitution>,
): BranchRuleOutcome<TInstitution> {
  const adjustment = pattern.branchRule?.evaluate(digits) ?? null;
  if (adjustment === null) {
    return { institution, kind: pattern.kind, virtualOverride: null, bonus: 0 };
  }

  const routedInstitution =
    adjustment.institutionId === undefined
      ? institution
      : (context.institutionById.get(adjustment.institutionId) ?? institution);

  return {
    institution: routedInstitution,
    kind: adjustment.kindOverride ?? pattern.kind,
    virtualOverride: adjustment.virtualOverride ?? null,
    bonus: context.bonus,
  };
}
