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
  ExtendDetectorOptions,
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
} from ".";
import type { DetectionPayload } from "./adapters/zod";

// Removing or renaming a type export breaks compilation here; value exports are guarded by `index.spec.ts`.
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
  ExtendDetectorOptions,
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

test("공개 타입 export 30개가 모두 존재한다", () => {
  // Given
  type Surface = PublicTypeSurface;

  // When
  type ExportCount = Surface["length"];

  // Then
  expectTypeOf<ExportCount>().toEqualTypeOf<30>();
});
