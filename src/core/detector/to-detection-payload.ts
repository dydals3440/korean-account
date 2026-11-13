import type { DetectionPayload, DetectionResult, Institution } from "../../types";

/**
 * Converts a detection result into the JSON-safe payload that every adapter's
 * `detectionSchema` validates, e.g. before sending it to a server.
 *
 * @example
 * const [top] = detect("110-436-387740");
 * if (top) await fetch("/accounts", { method: "POST", body: JSON.stringify(toDetectionPayload(top)) });
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
