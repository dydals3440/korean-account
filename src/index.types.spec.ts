import { expectTypeOf, test } from "vitest";
import type {
  AccountKind,
  AccountPattern,
  AdditionalRule,
  BranchRule,
  BranchRuleResult,
  CheckDigitVerifier,
  Confidence,
  CreateDetectorInput,
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
  PickInstitutionsFilter,
  PickPatternFilter,
  Position,
  RegisteredInstitution,
  ScoringWeights,
  Subject,
  SubjectCategory,
} from "./index";
import type { DetectionPayload } from "./schema";

// 타입 export 를 제거하거나 이름을 바꾸면 이 파일이 컴파일되지 않는다.
// 값 export 는 `index.spec.ts` 의 스냅샷이 지킨다. 둘이 합쳐 공개 표면 전체다.
type PublicTypeSurface = [
  AccountKind,
  AccountPattern,
  AdditionalRule,
  BranchRule,
  BranchRuleResult,
  CheckDigitVerifier,
  Confidence,
  CreateDetectorInput,
  DetectOptions,
  DetectionCapabilities,
  DetectionResult,
  Detector,
  GlobalRule,
  Institution,
  InstitutionCategory,
  InstitutionCode,
  InstitutionId,
  // 유일하게 기본 타입 인자가 없는 제네릭이다.
  InstitutionIdByCategory<"bank">,
  InstitutionIdInput,
  PatternTemplate,
  PatternToken,
  PickInstitutionsFilter,
  PickPatternFilter,
  Position,
  RegisteredInstitution,
  ScoringWeights,
  Subject,
  SubjectCategory,
  DetectionPayload,
];

test("공개 타입 export 29개가 모두 존재한다", () => {
  expectTypeOf<PublicTypeSurface["length"]>().toEqualTypeOf<29>();
});
