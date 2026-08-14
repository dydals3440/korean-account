import { expectTypeOf, test } from "vitest";
import type {
  AccountKind,
  AccountPattern,
  AdditionalRule,
  BranchRule,
  BranchRuleResult,
  CheckDigitVerifier,
  Confidence,
  CreateDetectorOptions,
  DetectionCapabilities,
  DetectionResult,
  DetectOptions,
  Detector,
  GlobalRule,
  Institution,
  InstitutionCategory,
  InstitutionCode,
  InstitutionId,
  InstitutionIdByCategory,
  InstitutionIdInput,
  PatternTemplate,
  PatternToken,
  SearchInstitutionsFilter,
  PickPatternFilter,
  DigitSpan,
  RegisteredInstitution,
  ScoringWeights,
  Subject,
  SubjectCategory,
} from "./index";
import type { DetectionPayload } from "./adapters/zod";

// Removing or renaming a type export breaks compilation of this file. Value
// exports are guarded by the snapshot in `index.spec.ts`; together they cover
// the whole public surface.
type PublicTypeSurface = [
  AccountKind,
  AccountPattern,
  AdditionalRule,
  BranchRule,
  BranchRuleResult,
  CheckDigitVerifier,
  Confidence,
  CreateDetectorOptions,
  DetectOptions,
  DetectionCapabilities,
  DetectionResult,
  Detector,
  GlobalRule,
  Institution,
  InstitutionCategory,
  InstitutionCode,
  InstitutionId,
  // The only generic without a default type argument.
  InstitutionIdByCategory<"bank">,
  InstitutionIdInput,
  PatternTemplate,
  PatternToken,
  SearchInstitutionsFilter,
  PickPatternFilter,
  DigitSpan,
  RegisteredInstitution,
  ScoringWeights,
  Subject,
  SubjectCategory,
  DetectionPayload,
];

test("공개 타입 export 29개가 모두 존재한다", () => {
  expectTypeOf<PublicTypeSurface["length"]>().toEqualTypeOf<29>();
});
