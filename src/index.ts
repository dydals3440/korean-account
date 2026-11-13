export { detect, detectBest } from "./builtin/detect";
export { getInstitution } from "./builtin/get-institution";
export { pickPattern, type PickPatternFilter } from "./builtin/pick-pattern";
export { searchInstitutions, type SearchInstitutionsFilter } from "./builtin/search-institutions";

export { createDetector } from "./core/detector/create-detector";
export { prevalence } from "./core/detector/prevalence";
export { toDetectionPayload } from "./core/detector/to-detection-payload";

export {
  cmsServices,
  defineBranchRule,
  defineInstitution,
  defineSubject,
  patternTemplate,
} from "./core/define";

export { extractIdentifier } from "./core/account/extract-identifier";
export { extractSubject } from "./core/account/extract-subject";
export { formatAccount } from "./core/account/format-account";
export { normalizeAccount } from "./core/account/normalize-account";

export { accountKindLabels, subjectCategoryLabels } from "./core/labels";

export {
  ACCOUNT_KINDS,
  CONFIDENCE_LEVELS,
  INSTITUTION_CATEGORIES,
  SUBJECT_CATEGORIES,
} from "./constants";

export * from "./registry";

export {
  kb11FirstDigit,
  kbank10First9,
  kbank14First79,
  normalizeSubject,
  scoreToConfidence,
  suhyup11BranchToCoop,
  suhyup12BranchToCoop,
  suhyup14BranchToCoop,
  suhyupCoop12BranchToBank,
  toss12First1719,
} from "./deprecated";

export type * from "./types";
