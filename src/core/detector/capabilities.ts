import type {
  AccountKind,
  AccountPattern,
  CheckDigitVerifier,
  DetectionCapabilities,
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

export interface CapabilityInput {
  readonly kind: AccountKind;
  readonly subject: NormalizedSubject | undefined;
  readonly virtualOverride: boolean | null;
  readonly validatedCheckDigit: boolean | null;
}

/** Derives the static capabilities of a match. */
export function resolveCapabilities(input: CapabilityInput): DetectionCapabilities {
  const isVirtual =
    input.virtualOverride ?? (input.subject?.virtual === true || input.kind === "virtual");
  const subjectAllowsWithdrawal = input.subject?.allowsWithdrawal ?? true;
  const allowsWithdrawal = subjectAllowsWithdrawal && isDebitableKind(input.kind) && !isVirtual;
  return { allowsWithdrawal, virtual: isVirtual, validatedCheckDigit: input.validatedCheckDigit };
}
