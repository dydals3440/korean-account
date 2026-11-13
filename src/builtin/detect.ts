import { createDetector } from "../core/detector/create-detector";
import type { InstitutionId } from "../registry/institution-ids";
import { institutions, type RegisteredInstitution } from "../registry/institutions";
import type { DetectionResult, DetectOptions } from "../types";

const builtinDetector = createDetector(institutions);

/**
 * Returns the built-in institutions an account number may belong to, ranked best first.
 *
 * Input goes through {@link normalizeAccount}, so hyphens, spaces and full-width digits are
 * accepted as typed or pasted. An institution is scored only when one of its patterns is within
 * one digit of the input length, so candidates appear once the number is nearly complete.
 * Candidates are ordered by score, then by the {@link prevalence} prior, then by account kind.
 *
 * Results are hints, not proof that an account exists. `confidence` is `"high"` at score ≥ 7,
 * `"medium"` at ≥ 4 and `"low"` otherwise, and always `"low"` when no identifier, subject code
 * or non-fallback branch rule backs the match; when the top candidate is high or medium, low
 * candidates are dropped. `ambiguous` is `true` when another institution sits in the same band.
 * Show the candidates, let the user confirm the institution, then verify the account with a
 * paid account-holder lookup API.
 *
 * This imports the whole registry. To keep bundles small, build a detector from the institutions
 * you need instead: `createDetector([kb, shinhan]).detect(input)`.
 *
 * @param input - Account number as entered, e.g. `"110-436-387740"`.
 * @param options - Filters and limits; omitted or `undefined` fields use the defaults.
 *   `categories`, `kinds`, `include` and `exclude` apply to the institution and kind after
 *   branch routing; `exclude` wins over `include`, and an empty array matches nothing.
 *   `limit` (default 5) caps the result count; `minScore` (default 1) drops weaker candidates.
 *   `ambiguous` is decided after filtering but before `limit`.
 * @returns The candidates, or an empty array when the input has no digits or nothing matches.
 * @throws {RangeError} When `options.limit` is not a non-negative integer or `Infinity`, or
 *   `options.minScore` is `NaN` (not checked for input without digits).
 * @example
 * detect("110-436-387740").map((result) => result.institution.id);
 * // => ["shinhan", "post", "shinhyup"] (equal scores, all "high" and ambiguous)
 *
 * detect("3333-12-3456789", { categories: ["bank"], limit: 3 });
 * // => [{ institution: { id: "kakao", ... }, confidence: "high", ambiguous: false, ... }]
 *
 * detect("no digits"); // => []
 * @see {@link detectBest} for only the top candidate.
 * @see {@link createDetector} for a subset of institutions or custom scoring.
 */
export function detect(
  input: string,
  options?: DetectOptions<InstitutionId>,
): readonly DetectionResult<RegisteredInstitution>[] {
  return builtinDetector.detect(input, options);
}

/**
 * Returns the top-ranked candidate from {@link detect}, or `null` when nothing matches.
 *
 * The top candidate is a hint, not proof that the account exists, and not necessarily the right
 * institution. Check `ambiguous` (another institution sits in the same confidence band, so ask
 * the user to choose) and `confidence` before relying on it, and verify the account with a paid
 * account-holder lookup API once the user has confirmed the institution. Use {@link detect} to
 * list the alternatives.
 *
 * This imports the whole registry; `createDetector([kb, shinhan]).detect(input)[0]` keeps
 * bundles small when only some institutions are supported.
 *
 * @param input - Account number as entered; hyphens, spaces and full-width digits are accepted.
 * @param options - Same as {@link detect}. `ambiguous` still accounts for candidates past
 *   `limit`, and `limit: 0` always yields `null`.
 * @returns The best candidate, or `null` when the input has no digits, no pattern matches, or
 *   every candidate is filtered out.
 * @throws {RangeError} Under the same conditions as {@link detect}.
 * @example
 * const best = detectBest("110-436-387740");
 * // => { institution: { id: "shinhan", ... }, confidence: "high", ambiguous: true, ... }
 * if (best === null || best.ambiguous) {
 *   // Ask the user to pick from detect(): "post" and "shinhyup" score the same.
 * }
 *
 * detectBest("301-0123-4567-11")?.institution.id; // => "nh" (NongHyup Bank)
 * detectBest("352-0123-4567-13")?.institution.id; // => "nh-coop" (regional NongHyup coops)
 * detectBest("12"); // => null
 */
export function detectBest(
  input: string,
  options?: DetectOptions<InstitutionId>,
): DetectionResult<RegisteredInstitution> | null {
  return builtinDetector.detect(input, options)[0] ?? null;
}
