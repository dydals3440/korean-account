import type {
  AccountKind,
  AccountPattern,
  CheckDigitVerifier,
  CmsServices,
  DetectionCapabilities,
  Subject,
} from "../../types";
import { isDebitableKind, type NormalizedSubject } from "./normalize-subject";

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
  readonly subject: NormalizedSubject | undefined;
  readonly services: CmsServices | null;
  readonly virtualOverride: boolean | null;
  readonly validatedCheckDigit: boolean | null;
}

/**
 * Derives the static capabilities of a match. With PDF `services`, withdrawal follows the
 * subject and the 출금이체 column; without them, virtual and deposit-only kinds never debit.
 */
export function resolveCapabilities(input: CapabilityInput): DetectionCapabilities {
  const isVirtual =
    input.virtualOverride ?? (input.subject?.virtual === true || input.kind === "virtual");
  const allowsWithdrawal =
    input.services === null
      ? (input.subject?.allowsWithdrawal ?? true) && isDebitableKind(input.kind) && !isVirtual
      : (input.subject?.allowsWithdrawal ?? input.services.directDebit);

  return {
    allowsWithdrawal,
    virtual: isVirtual,
    validatedCheckDigit: input.validatedCheckDigit,
    services: input.services,
  };
}
