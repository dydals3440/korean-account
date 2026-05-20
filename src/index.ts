export {
  defineBranchRule,
  kb11FirstDigit,
  kbank10First9,
  kbank14First79,
  suhyup11BranchToCoop,
  suhyup12BranchToCoop,
  suhyup14BranchToCoop,
  suhyupCoop12BranchToBank,
  toss12First1719,
} from "./_internal/branchRules";

export { scoreToConfidence } from "./_internal/confidence";
export {
  accountKindLabels,
  defineSubject,
  normalizeSubject,
  subjectCategoryLabels,
} from "./_internal/subjects";

export type { CreateDetectorInput } from "./createDetector";
export { createDetector } from "./createDetector";
export { createPatternTemplate } from "./createPatternTemplate";

export {
  defineInstitution,
  type InstitutionCode,
  type InstitutionId,
  type InstitutionIdByCategory,
  institutionByCode,
  institutionById,
  institutions,
  type RegisteredInstitution,
} from "./data";

export { defaultDetector, detectAccount } from "./detectAccount";
export { detectBest } from "./detectBest";

export { extractIdentifier } from "./extractIdentifier";
export { extractSubject } from "./extractSubject";
export { formatAccount } from "./formatAccount";
export { normalize } from "./normalize";

export type { PickInstitutionsFilter } from "./pickInstitutions";
export { pickInstitutions, pickInstitutionsByIds } from "./pickInstitutions";
export type { PickPatternFilter } from "./pickPattern";
export { pickPattern } from "./pickPattern";

export type {
  AccountKind,
  AccountPattern,
  AdditionalRule,
  BranchRule,
  BranchRuleResult,
  CheckDigitVerifier,
  Confidence,
  DetectionCapabilities,
  DetectionResult,
  DetectOptions,
  Detector,
  GlobalRule,
  Institution,
  InstitutionCategory,
  InstitutionIdInput,
  PatternTemplate,
  PatternToken,
  Position,
  ScoringWeights,
  Subject,
  SubjectCategory,
} from "./types";
