import type { AccountKind, AccountPattern, Institution } from "../../types";

/** Result of applying a pattern's branch rule. */
export interface BranchRuleOutcome<TInstitution extends Institution> {
  readonly institution: TInstitution;
  readonly kind: AccountKind;
  /** Overrides `capabilities.virtual`, or `null` to derive it. */
  readonly virtualOverride: boolean | null;
  /** Score to add on top of the pattern score. */
  readonly bonus: number;
  /** An identifier, subject or non-fallback branch condition backs the match. */
  readonly hasEvidence: boolean;
}

export interface ApplyBranchRuleContext<TInstitution extends Institution> {
  readonly institutionById: ReadonlyMap<string, TInstitution>;
  /** Weight added when an evidenced match fires the rule. */
  readonly bonus: number;
  /** The matched pattern's identifier or subject matched. */
  readonly hasPatternEvidence: boolean;
}

/**
 * Applies the matched pattern's branch rule, which may reroute the institution or replace the kind.
 * A non-fallback rule condition is evidence on its own; a fallback branch is not.
 */
export function applyBranchRule<TInstitution extends Institution>(
  digits: string,
  pattern: AccountPattern,
  institution: TInstitution,
  context: ApplyBranchRuleContext<TInstitution>,
): BranchRuleOutcome<TInstitution> {
  const adjustment = pattern.branchRule?.evaluate(digits) ?? null;
  if (adjustment === null) {
    return {
      institution,
      kind: pattern.kind,
      virtualOverride: null,
      bonus: 0,
      hasEvidence: context.hasPatternEvidence,
    };
  }

  const routedInstitution =
    adjustment.institutionId === undefined
      ? institution
      : (context.institutionById.get(adjustment.institutionId) ?? institution);
  const hasEvidence = context.hasPatternEvidence || adjustment.isFallback !== true;

  return {
    institution: routedInstitution,
    kind: adjustment.kindOverride ?? pattern.kind,
    virtualOverride: adjustment.virtualOverride ?? null,
    bonus: hasEvidence ? context.bonus : 0,
    hasEvidence,
  };
}
