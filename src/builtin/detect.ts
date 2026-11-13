import { createDetector } from "../core/detector/create-detector";
import type { InstitutionId } from "../registry/institution-ids";
import { institutions, type RegisteredInstitution } from "../registry/institutions";
import type { DetectionResult, DetectOptions } from "../types";

const builtinDetector = createDetector(institutions);

/**
 * Detects candidates against the full built-in registry, best first.
 * Bundles every institution; prefer `createDetector([kb, shinhan])` for a subset.
 *
 * @example
 * detect("110-436-387740");
 * detect("3333-12-3456789", { categories: ["bank"], limit: 3 });
 */
export function detect(
  input: string,
  options?: DetectOptions<InstitutionId>,
): readonly DetectionResult<RegisteredInstitution>[] {
  return builtinDetector.detect(input, options);
}

/**
 * Returns the top candidate from {@link detect}, or `null` when nothing matches.
 *
 * @example
 * detectBest("110-436-387740")?.institution.id; // "shinhan"
 */
export function detectBest(
  input: string,
  options?: DetectOptions<InstitutionId>,
): DetectionResult<RegisteredInstitution> | null {
  return builtinDetector.detect(input, options)[0] ?? null;
}
