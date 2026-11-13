import { scoreToConfidence as scoreToConfidenceImpl } from "./core/detector/confidence";
import { normalizeSubject as normalizeSubjectImpl } from "./core/detector/normalize-subject";
import * as branchRules from "./registry/branch-rules";

/**
 * @deprecated Registry internal, and no built-in pattern uses it: KB's 11-digit formats are
 * separate `incoming-only` (first digit 0) and `lifetime` (first digit 9) patterns, so read
 * `DetectionResult.kind` instead. Removed in 1.0.
 * @example
 * // Before
 * const kind = kb11FirstDigit.evaluate(digits)?.kindOverride;
 * // After
 * const kind = detectBest(digits, { include: ["kb"] })?.kind;
 */
export const kb11FirstDigit = branchRules.kb11FirstDigit;

/**
 * @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0.
 * @example
 * // Before
 * const rule = kbank10First9;
 * // After
 * const rule = pickPattern("kbank", { length: 10 })?.branchRule;
 */
export const kbank10First9 = branchRules.kbank10First9;

/**
 * @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0.
 * @example
 * // Before
 * const rule = kbank14First79;
 * // After
 * const rule = pickPattern("kbank", { length: 14 })?.branchRule;
 */
export const kbank14First79 = branchRules.kbank14First79;

/**
 * @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0.
 * @example
 * // Before
 * const rule = suhyup11BranchToCoop;
 * // After
 * const rule = pickPattern("suhyup", { length: 11 })?.branchRule;
 */
export const suhyup11BranchToCoop = branchRules.suhyup11BranchToCoop;

/**
 * @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0.
 * @example
 * // Before
 * const rule = suhyup12BranchToCoop;
 * // After
 * const rule = pickPattern("suhyup", { length: 12 })?.branchRule;
 */
export const suhyup12BranchToCoop = branchRules.suhyup12BranchToCoop;

/**
 * @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0.
 * @example
 * // Before
 * const rule = suhyup14BranchToCoop;
 * // After
 * const rule = pickPattern("suhyup", { length: 14 })?.branchRule;
 */
export const suhyup14BranchToCoop = branchRules.suhyup14BranchToCoop;

/**
 * @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0.
 * @example
 * // Before
 * const rule = suhyupCoop12BranchToBank;
 * // After
 * const rule = pickPattern("suhyup-coop", { length: 12 })?.branchRule;
 */
export const suhyupCoop12BranchToBank = branchRules.suhyupCoop12BranchToBank;

/**
 * @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0.
 * @example
 * // Before
 * const rule = toss12First1719;
 * // After
 * const rule = pickPattern("toss", { kind: "virtual" })?.branchRule;
 */
export const toss12First1719 = branchRules.toss12First1719;

/**
 * @deprecated Every `DetectionResult` already carries `confidence`, which is also `"low"` when
 * no identifier, subject code or non-fallback branch rule backs the match. Removed in 1.0.
 * @example
 * // Before
 * const confidence = scoreToConfidence(result.score);
 * // After
 * const confidence = result.confidence;
 */
export const scoreToConfidence = scoreToConfidenceImpl;

/**
 * @deprecated `DetectionResult.subject` is already normalized, with `label`, `allowsWithdrawal`
 * and `virtual` filled in. For a label alone, read `subjectCategoryLabels`. Removed in 1.0.
 * @example
 * // Before
 * const subject = result.subject && normalizeSubject(result.subject, result.kind);
 * // After
 * const subject = result.subject;
 */
export const normalizeSubject = normalizeSubjectImpl;
