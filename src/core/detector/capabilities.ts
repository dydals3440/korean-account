import type {
  AccountKind,
  AccountPattern,
  CheckDigitVerifier,
  CmsServices,
  DetectionCapabilities,
  Subject,
} from "../../types";
import { isDebitableKind } from "./normalize-subject";

/** Builds a verifier lookup, dropping ids whose verifier is `undefined`. */
export function toVerifierMap(
  verifiers: Readonly<Partial<Record<string, CheckDigitVerifier>>> | undefined,
): ReadonlyMap<string, CheckDigitVerifier> {
  const entries = Object.entries(verifiers ?? {}).filter(
    (entry): entry is [string, CheckDigitVerifier] => entry[1] !== undefined,
  );
  return new Map(entries);
}

/** Runs the institution's check-digit verifier; `null` when none applies. */
export function verifyCheckDigit(
  digits: string,
  pattern: AccountPattern,
  institutionId: string,
  verifiers: ReadonlyMap<string, CheckDigitVerifier>,
): boolean | null {
  if (pattern.validatesCheckDigit === false) {
    return null;
  }
  const verifier = verifiers.get(institutionId);
  return verifier === undefined ? null : verifier(digits);
}

/** The pattern's PDF services with the matched subject's per-code exceptions applied. */
export function resolveServices(
  pattern: AccountPattern,
  subject: Subject | null,
): CmsServices | null {
  if (pattern.services === undefined) {
    return null;
  }
  return { ...pattern.services, ...subject?.services };
}

export interface CapabilityInput {
  readonly kind: AccountKind;
  /** The matched subject as declared, or `null`. */
  readonly subject: Subject | null;
  /** The pattern's services with the subject's exceptions applied, or `null`. */
  readonly services: CmsServices | null;
  readonly virtualOverride: boolean | null;
  readonly validatedCheckDigit: boolean | null;
}

/**
 * Derives the static capabilities of a match. `allowsWithdrawal` is computed here once and
 * reused for `DetectionResult.subject`, so the two never disagree.
 */
export function resolveCapabilities(input: CapabilityInput): DetectionCapabilities {
  const isVirtual =
    input.virtualOverride ?? (input.subject?.virtual === true || input.kind === "virtual");
  return {
    allowsWithdrawal: resolveWithdrawal(input, isVirtual),
    virtual: isVirtual,
    validatedCheckDigit: input.validatedCheckDigit,
    services: input.services,
  };
}

/**
 * With PDF `services`, the subject's own value wins, then the 출금이체 column (subject exceptions
 * already applied). Without them, the subject may only narrow the kind rule: a virtual,
 * lifetime or deposit-only account never debits.
 */
function resolveWithdrawal(input: CapabilityInput, isVirtual: boolean): boolean {
  const declared = input.subject?.allowsWithdrawal;
  if (input.services !== null) {
    return declared ?? input.services.directDebit;
  }
  const isDebitable = isDebitableKind(input.kind) && !isVirtual;
  return (declared ?? input.subject?.services?.directDebit ?? true) && isDebitable;
}
