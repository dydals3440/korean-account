import { createDetector } from "./detector";
import { type InstitutionId, institutions, type RegisteredInstitution } from "../registry";
import type { DetectionResult, DetectOptions } from "../types";

/**
 * Detector over the full built-in registry, shared by {@link detect} and
 * {@link detectBest}.
 *
 * The pure annotation is load-bearing: without it bundlers cannot drop the
 * registry for consumers that never call the default-registry helpers.
 */
const defaultDetector = /* @__PURE__ */ createDetector(institutions);

/**
 * Analyzes an account number against the full built-in registry and returns
 * ranked candidates with institution / kind / subject / capabilities.
 *
 * `options.include` / `options.exclude` autocomplete registered
 * `InstitutionId` literals (arbitrary strings are also accepted for
 * user-extended registries).
 *
 * Importing this pulls the entire registry into your bundle. If you only care
 * about specific institutions, build a scoped detector instead:
 * `createDetector([kb, shinhan])`.
 *
 * @example
 * detect("110-436-387740");
 * detect("3333-12-3456789", { categories: ["bank"] });
 * detect("110-436-387740", { include: ["shinhan", "kb", "hana"] });
 */
export function detect(input: string, options?: DetectOptions<InstitutionId>) {
  return defaultDetector.detect(input, options);
}

/**
 * Returns only the top candidate, or `null` when nothing matches.
 *
 * Shorthand for `detect(input)[0] ?? null` — useful for form validation and
 * direct-debit guards where a single answer is needed.
 *
 * @example
 * const top = detectBest("110-436-387740");
 * if (top) console.log(top.institution.id, top.kind);
 *
 * @example With filters
 * const top = detectBest("110-436-387740", { categories: ["bank"] });
 */
export function detectBest(
  input: string,
  options?: DetectOptions<InstitutionId>,
): DetectionResult<RegisteredInstitution> | null {
  return defaultDetector.detect(input, options)[0] ?? null;
}
