import { scoreToConfidence as scoreToConfidenceImpl } from "./core/detector/confidence";
import { normalizeSubject as normalizeSubjectImpl } from "./core/detector/normalize-subject";
import * as branchRules from "./registry/branch-rules";

/** @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0. */
export const kb11FirstDigit = branchRules.kb11FirstDigit;
/** @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0. */
export const kbank10First9 = branchRules.kbank10First9;
/** @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0. */
export const kbank14First79 = branchRules.kbank14First79;
/** @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0. */
export const suhyup11BranchToCoop = branchRules.suhyup11BranchToCoop;
/** @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0. */
export const suhyup12BranchToCoop = branchRules.suhyup12BranchToCoop;
/** @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0. */
export const suhyup14BranchToCoop = branchRules.suhyup14BranchToCoop;
/** @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0. */
export const suhyupCoop12BranchToBank = branchRules.suhyupCoop12BranchToBank;
/** @deprecated Registry internal; read `pattern.branchRule` instead. Removed in 1.0. */
export const toss12First1719 = branchRules.toss12First1719;

/** @deprecated Every `DetectionResult` already carries `confidence`. Removed in 1.0. */
export const scoreToConfidence = scoreToConfidenceImpl;

/** @deprecated `DetectionResult.subject` is already normalized. Removed in 1.0. */
export const normalizeSubject = normalizeSubjectImpl;
