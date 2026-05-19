/**
 * 패턴 템플릿 토큰. 자릿수는 `X`, 시각 그루핑은 `-` 만 사용한다.
 *
 * @example
 * "XXX-XX-XXXXXX"   // 11자리, 3-2-6 그루핑
 */
export type PatternToken = "X";

/** 패턴 템플릿 브랜드. 반드시 `createPatternTemplate`으로 생성. */
export type PatternTemplate = string & { readonly __brand: "PatternTemplate" };

/** 0-indexed digit 범위. */
export interface Position {
  readonly start: number;
  /** 자릿수 (1 이상). */
  readonly length: number;
}

/** 금융기관 카테고리. */
export type InstitutionCategory = "bank" | "non-bank" | "securities" | "clearing";

/** 점수 → 신뢰도 매핑. */
export type Confidence = "high" | "medium" | "low";

/**
 * 계좌의 종류.
 *
 * - `new` — 차세대(신) 계좌
 * - `old` — 구 계좌
 * - `virtual` — 가상계좌 (입금 전용인 경우가 많음)
 * - `lifetime` — 평생계좌 / 고객지정 / 핸드폰번호 연결
 * - `incoming-only` — 입금 전용 (적금·신탁·연계 등 자동이체 출금 불가)
 * - `merged-legacy` — 합병 전 구 시스템 계좌 (외환·조흥·한일·평화 등)
 */
export type AccountKind =
  | "new"
  | "old"
  | "virtual"
  | "lifetime"
  | "incoming-only"
  | "merged-legacy";

/**
 * 계정과목 카테고리.
 *
 * CMS PDF 표준 10종 (보통/국고/저축/자유저축/가계당좌/당좌/기업자유/YES/연계/기타)
 * + 입금전용 상품 분류용 확장 (`installment`/`trust`/`isa`).
 */
export type SubjectCategory =
  | "ordinary"
  | "treasury"
  | "savings"
  | "free-savings"
  | "household-current"
  | "current"
  | "corporate-free"
  | "yes"
  | "linked"
  | "installment"
  | "trust"
  | "isa"
  | "other";

/** 계정과목 코드 정의. */
export interface Subject {
  /** 자릿수에 맞춰 zero-padded 코드 ("01", "611", "301" 등). */
  readonly code: string;
  readonly category: SubjectCategory;
  /** 표시명 ("정기적금" 등). 없으면 카테고리 라벨 사용. */
  readonly label?: string;
  /** 자동이체 출금 가능 여부. 기본 true. */
  readonly allowsWithdrawal?: boolean;
  /** 가상계좌 (입금 전용으로 동작). */
  readonly virtual?: boolean;
  readonly effectiveFrom?: string;
  readonly note?: string;
}

export type AdditionalRule = (digits: string) => boolean;

/** Detector 레벨 전역 룰. 패턴이 적중한 institution에 대해서만 평가. */
export type GlobalRule = (digits: string, institution: Institution) => boolean;

/**
 * 체크디지트 검증 함수. 정규화된 digits 를 받아 통과 여부를 반환.
 *
 * PDF 는 알고리즘을 비공개하므로 라이브러리 기본은 미구현이다. 컨슈머가
 * 은행 공개 자료 / 시중 자료로 알고리즘을 확보해 `createDetector` 의
 * `checkDigitVerifiers` 옵션에 institution id 별로 등록할 수 있다.
 *
 * 결과 `capabilities.validatedCheckDigit` 는:
 * - verifier 등록 + 통과 → `true`
 * - verifier 등록 + 실패 → `false`
 * - verifier 미등록 또는 패턴이 `validatesCheckDigit: false` → `null`
 */
export type CheckDigitVerifier = (digits: string) => boolean;

/**
 * 분기 규칙 — digits를 받아 결과를 보정한다.
 *
 * - `institutionId` 가 반환되면 결과 institution이 그 id로 교체된다 (수협 분기 등).
 * - `kindOverride` 가 반환되면 결과 kind가 교체된다 (K뱅크 / 토스 prefix 등).
 * - `virtualOverride` 가 반환되면 capabilities.virtual 이 교체된다.
 * - `null` 반환 시 변경 없음.
 */
export interface BranchRule {
  readonly describe: string;
  readonly evaluate: (digits: string) => BranchRuleResult | null;
}
export interface BranchRuleResult {
  readonly institutionId?: string;
  readonly kindOverride?: AccountKind;
  readonly virtualOverride?: boolean;
}

/** 단일 institution의 계좌번호 패턴 한 variant. */
export interface AccountPattern {
  readonly template: PatternTemplate;
  readonly kind: AccountKind;
  readonly identifierPosition?: Position;
  readonly identifiers?: readonly string[];
  readonly identifierRange?: { readonly from: number; readonly to: number };
  readonly subjectPosition?: Position;
  readonly subjects?: readonly Subject[];
  readonly checkDigitPosition?: Position;
  /** `false` 면 명시적 미검증. 기본 `undefined` = 알고리즘 미구현. */
  readonly validatesCheckDigit?: boolean;
  readonly branchRule?: BranchRule;
  /**
   * 패턴 매칭의 *통과 검증 + 점수 가산* 룰. 자릿수가 일치하는 입력에서 하나라도
   * false 면 패턴이 매칭되지 않으며, 모두 통과해야 룰 개수만큼 가산된다. PDF·실
   * 세계 도메인 제약 (예: `d[3]==="9"` 외환 14d 신호, prefix 충돌 회피) 을 패턴
   * 매칭 조건과 함께 표현할 때 사용.
   */
  readonly additionalRules?: readonly AdditionalRule[];
  readonly effectiveFrom?: string;
  readonly note?: string;
}

/**
 * 금융기관.
 *
 * Generic 파라미터는 literal narrow 보존용:
 * - `Id` — `"kdb"` 같은 institution id literal
 * - `Code` — `"002"` 같은 CMS 표준 코드 literal
 * - `Category` — `"bank"` 같은 카테고리 literal
 *
 * `defineInstitution` 헬퍼를 거치면 세 generic 이 자동 추론된다.
 */
export interface Institution<
  Id extends string = string,
  Code extends string = string,
  Category extends InstitutionCategory = InstitutionCategory,
> {
  readonly id: Id;
  readonly code: Code;
  /**
   * 금융공동망 표준은행코드 (KFTC 공동코드). CMS namespace `code` 와 다른 경우만
   * 지정. 같은 KFTC 가 운영하는 별개 namespace 라 한쪽으로 통일 불가 — 합병·분리
   * 이력에 따라 두 체계의 대표코드가 달라지는 경우가 있음.
   *
   * 예시: `hana` 는 `code: "005"` (CMS — 외환·하나 통합 후 외환 대표코드 승계),
   * `commonCode: "081"` (표준 — 하나은행 대표코드 유지). 컨슈머가 표준은행코드
   * 기반 서버를 쓴다면 `institution.commonCode ?? institution.code` 로 접근.
   *
   * 미지정 시 `code` 와 동일하다고 간주.
   */
  readonly commonCode?: string;
  readonly aliasCodes?: readonly string[];
  readonly nameKo: string;
  readonly nameEn?: string;
  readonly category: Category;
  readonly aliases: readonly string[];
  readonly priority?: number;
  readonly patterns: readonly AccountPattern[];
  readonly successorOf?: readonly string[];
  readonly notes?: string;
}

/** detect 결과 케이퍼빌리티 메타. */
export interface DetectionCapabilities {
  /** 자동이체 출금이 가능한지 (입금전용/평생계좌/가상계좌 등은 false). */
  readonly allowsWithdrawal: boolean;
  /** 가상계좌 여부. */
  readonly virtual: boolean;
  /**
   * 체크디지트 검증 결과.
   * - `true` — 검증 완료 & 통과
   * - `false` — 검증 완료 & 실패
   * - `null` — 검증 미수행 (알고리즘 미구현 또는 pattern.validatesCheckDigit=false)
   */
  readonly validatedCheckDigit: boolean | null;
}

/** detect 결과 단일 항목. */
export interface DetectionResult<I extends Institution = Institution> {
  readonly institution: I;
  readonly matchedPattern: AccountPattern;
  readonly kind: AccountKind;
  readonly subject?: Subject;
  readonly formatted: string;
  readonly score: number;
  readonly confidence: Confidence;
  readonly capabilities: DetectionCapabilities;
}

/**
 * autocomplete-with-widening 패턴 — `Id` 가 literal union 으로 들어오면 IDE 가
 * 후보를 띄워주되, 임의 string 도 그대로 받아준다 (외부 institution 확장 대응).
 */
export type InstitutionIdInput<Id extends string = string> = Id | (string & Record<never, never>);

export interface DetectOptions<Id extends string = string> {
  readonly categories?: readonly InstitutionCategory[];
  readonly kinds?: readonly AccountKind[];
  readonly include?: readonly InstitutionIdInput<Id>[];
  readonly exclude?: readonly InstitutionIdInput<Id>[];
  readonly limit?: number;
  readonly minScore?: number;
}

/**
 * Detector 가 패턴 매칭 시 부여하는 점수 가중치. 미지정 키는 `DEFAULT_WEIGHTS`
 * (lengthExact:3 / lengthNear:1 / identifierMatch:4 / subjectMatch:3 /
 * additionalRule:1 / globalRule:1 / kindNewBonus:0) 가 적용된다.
 *
 * 일반 은행 앱과 동일한 추천 흐름을 따르려면 기본값을 그대로 쓰면 된다 —
 * "자릿수가 맞고(+3) prefix 가 맞으면(+4) 카테고리도 맞으면(+3) high(10)" 과
 * 같은 직관적 가중치다.
 */
export interface ScoringWeights {
  /** 자릿수가 패턴 template 과 정확히 일치할 때 가산점 (기본 +3). */
  readonly lengthExact?: number;
  /** 자릿수가 template ±1 일 때 (사용자가 입력 중) 가산점 (기본 +1). */
  readonly lengthNear?: number;
  /** identifier 가 정확히 매칭될 때 가산점 (기본 +4). 부분 입력은 절반 적용. */
  readonly identifierMatch?: number;
  /** subject (계정과목) 가 매칭될 때 가산점 (기본 +3). 부분 입력은 절반 적용. */
  readonly subjectMatch?: number;
  /**
   * 패턴의 `additionalRules` 가 통과될 때 통과 1건당 가산점 (기본 +1).
   *
   * `additionalRules` 는 *통과 검증 + 점수 가산* 두 역할을 한다. 자릿수가
   * 일치하는 입력 (lengthExact / lengthNear) 에서 하나라도 false 면 패턴은
   * 후보에서 제외되며, 모두 통과해야 룰 개수만큼 가산된다.
   */
  readonly additionalRule?: number;
  /** detector 의 `globalRules` 가 통과될 때 통과 1건당 가산점 (기본 +1). */
  readonly globalRule?: number;
  /**
   * 패턴의 `branchRule` 이 결과를 돌려준 경우 (kind/institution/virtual override
   * 발생) 가산점 (기본 +2). PDF 가 명시한 분기 규칙은 *추가적인 강한 식별 신호* —
   * 동일 prefix 가 여러 기관에 enumerate 된 모호한 경우 (예: 토스 12d 가상 17/19
   * vs 신협 12d 적금 170~178), 분기 규칙이 매칭하면 그 institution 이 우선되게.
   */
  readonly branchRuleMatch?: number;
  /** 매칭된 패턴 kind 가 "new" 일 때 부여하는 보너스 (기본 0, 옵트인). */
  readonly kindNewBonus?: number;
}

/**
 * Detector 인스턴스 — immutable, `.extend` / `.remove` 로 새 인스턴스를 만든다.
 *
 * generic `I` 는 등록된 institution union. `defaultDetector` 는
 * `Detector<RegisteredInstitution>` 으로 추론되어 `detect()` 결과의
 * `institution.id` 가 literal union 으로 좁혀진다.
 */
export interface Detector<I extends Institution = Institution> {
  readonly institutions: readonly I[];
  detect(input: string, options?: DetectOptions<I["id"]>): readonly DetectionResult<I>[];
  extend<E extends Institution>(extra: {
    readonly institutions?: readonly E[];
    readonly globalRules?: readonly GlobalRule[];
  }): Detector<I | E>;
  /** id 또는 술어로 institution 을 제거한 새 detector 를 반환. */
  remove(target: string | ((i: Institution) => boolean)): Detector<I>;
}
