import { expectTypeOf, test } from "vitest";

import type {
  AccountKind,
  AccountPattern,
  AdditionalRule,
  BranchRule,
  BranchRuleResult,
  CheckDigitVerifier,
  CmsService,
  CmsServices,
  Confidence,
  CreateDetectorOptions,
  DetectionCapabilities,
  DetectionResult,
  DetectOptions,
  Detector,
  ExtendDetectorOptions,
  GlobalRule,
  Institution,
  ResolvedSubject,
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
  CmsService,
  CmsServices,
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
  ResolvedSubject,
];

test("공개 타입 export 33개가 모두 존재한다", () => {
  // Given
  type Surface = PublicTypeSurface;

  // When
  type ExportCount = Surface["length"];

  // Then
  expectTypeOf<ExportCount>().toEqualTypeOf<33>();
});

test("DetectionResult.subject 는 기본값이 채워진 ResolvedSubject 다", () => {
  // Given
  type DetectedSubject = NonNullable<DetectionResult["subject"]>;

  // When
  type Label = DetectedSubject["label"];
  type AllowsWithdrawal = DetectedSubject["allowsWithdrawal"];

  // Then
  expectTypeOf<DetectedSubject>().toEqualTypeOf<ResolvedSubject>();
  expectTypeOf<Label>().toEqualTypeOf<string>();
  expectTypeOf<AllowsWithdrawal>().toEqualTypeOf<boolean>();
});
