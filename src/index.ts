// 분기 규칙
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

// confidence / subjects helpers
export { scoreToConfidence } from "./_internal/confidence";
export {
  accountKindLabels,
  defineSubject,
  normalizeSubject,
  subjectCategoryLabels,
} from "./_internal/subjects";

// Detector
export type { CreateDetectorInput } from "./createDetector";
export { createDetector } from "./createDetector";
export { createPatternTemplate } from "./createPatternTemplate";

// 데이터 레지스트리
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

// 결과
export { defaultDetector, detectAccount } from "./detectAccount";
export { detectBest } from "./detectBest";

// 저수준 유틸
export { extractIdentifier } from "./extractIdentifier";
export { extractSubject } from "./extractSubject";
export { formatAccount } from "./formatAccount";
export { normalize } from "./normalize";

// 선택자
export type { PickInstitutionsFilter } from "./pickInstitutions";
export {
  pickInstitutions,
  pickInstitutionsByIds,
} from "./pickInstitutions";
export type { PickPatternFilter } from "./pickPattern";
export { pickPattern } from "./pickPattern";

// 타입
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
