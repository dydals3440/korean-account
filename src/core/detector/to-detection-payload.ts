import type { DetectionPayload, DetectionResult, Institution } from "../../types";

/**
 * Returns a JSON-safe summary of a detection result, the shape that every validation adapter's
 * `detectionSchema` accepts.
 *
 * Use it before sending a detection to a server or storing it: `institution` and
 * `matchedPattern`, which can hold functions, are replaced by `institutionId`, and `subject` is
 * reduced to `code`, `category` and `label`. `subject` is omitted when the result has none, and
 * `capabilities.services` stays `null` when the pattern declares no service columns. The default
 * `detectionSchema` accepts built-in ids only; for custom institutions build a schema with the
 * adapter's `createDetectionSchema(ids)`.
 *
 * @typeParam TInstitution - Institution type of the result; narrows `institutionId`.
 * @param result - A candidate from `detect`, `detectBest` or a custom detector. Not modified.
 * @returns A new plain object.
 * @example
 * const best = detectBest("3333-12-3456789");
 * if (best !== null) {
 *   await fetch("/accounts", { method: "POST", body: JSON.stringify(toDetectionPayload(best)) });
 * }
 * // toDetectionPayload(best) => { institutionId: "kakao", kind: "new", score: 10,
 * //   confidence: "high", ambiguous: false, formatted: "3333-12-3456789", capabilities: { ... } }
 */
export function toDetectionPayload<TInstitution extends Institution>(
  result: DetectionResult<TInstitution>,
): DetectionPayload<TInstitution["id"]> {
  const { subject, capabilities } = result;
  return {
    institutionId: result.institution.id,
    kind: result.kind,
    ...(subject && {
      subject: {
        code: subject.code,
        category: subject.category,
        label: subject.label,
      },
    }),
    score: result.score,
    confidence: result.confidence,
    ambiguous: result.ambiguous,
    formatted: result.formatted,
    capabilities: {
      allowsWithdrawal: capabilities.allowsWithdrawal,
      virtual: capabilities.virtual,
      validatedCheckDigit: capabilities.validatedCheckDigit,
      services: capabilities.services,
    },
  };
}
