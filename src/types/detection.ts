import type { CONFIDENCE_LEVELS } from "../constants";
import type { Institution, InstitutionCategory, InstitutionIdInput } from "./institution";
import type { AccountKind, AccountPattern, Subject } from "./pattern";

/** Confidence band derived from the score. */
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

/** Detector-level rule evaluated for institutions whose pattern matched. Each pass adds the global rule bonus. */
export type GlobalRule = (digits: string, institution: Institution) => boolean;

/**
 * User-supplied check-digit algorithm over normalized digits.
 * KFTC does not publish these algorithms, so none are built in.
 */
export type CheckDigitVerifier = (digits: string) => boolean;

/** Static capabilities of a detected account. They do not prove the account exists. */
export interface DetectionCapabilities {
  /** Whether CMS direct debit (출금이체) is allowed. */
  readonly allowsWithdrawal: boolean;
  readonly virtual: boolean;
  /** Verifier outcome, or `null` when no verifier ran. */
  readonly validatedCheckDigit: boolean | null;
}

/** One ranked detection candidate. */
export interface DetectionResult<TInstitution extends Institution = Institution> {
  readonly institution: TInstitution;
  readonly matchedPattern: AccountPattern;
  readonly kind: AccountKind;
  readonly subject?: Subject;
  /** Input digits grouped by the matched template. */
  readonly formatted: string;
  readonly score: number;
  readonly confidence: Confidence;
  readonly capabilities: DetectionCapabilities;
}

/** Filters and limits for `detect`. Institution filters apply after branch routing; `exclude` wins. */
export interface DetectOptions<TId extends string = string> {
  readonly categories?: readonly InstitutionCategory[];
  readonly kinds?: readonly AccountKind[];
  readonly include?: readonly InstitutionIdInput<TId>[];
  readonly exclude?: readonly InstitutionIdInput<TId>[];
  /** @default 5 */
  readonly limit?: number;
  /** @default 1 */
  readonly minScore?: number;
}

/** Score added per matching signal. Omitted keys keep their defaults. */
export interface ScoringWeights {
  /** Digit count equals the template length. @default 3 */
  readonly lengthExact?: number;
  /** Digit count is one off the template length. @default 1 */
  readonly lengthNear?: number;
  /** Identifier digits match. Partial input earns half. @default 4 */
  readonly identifierMatch?: number;
  /** Subject code matches. Partial input earns half. @default 3 */
  readonly subjectMatch?: number;
  /** Per passing `additionalRules` entry. @default 1 */
  readonly additionalRule?: number;
  /** Per passing detector-level `globalRules` entry. @default 1 */
  readonly globalRule?: number;
  /** The pattern's `branchRule` produced an adjustment. @default 2 */
  readonly branchRuleMatch?: number;
  /** The matched pattern's kind is `"new"`. @default 0 */
  readonly kindNewBonus?: number;
}

/** Options for `createDetector`. */
export interface CreateDetectorOptions<TInstitution extends Institution = Institution> {
  readonly globalRules?: readonly GlobalRule[];
  readonly scoring?: ScoringWeights;
  /** Check-digit verifiers keyed by institution id. */
  readonly checkDigitVerifiers?: Readonly<Partial<Record<TInstitution["id"], CheckDigitVerifier>>>;
}

/** Options for `Detector.extend`. Each field merges over the current detector's value. */
export interface ExtendDetectorOptions<
  TInstitution extends Institution = Institution,
  TExtra extends Institution = Institution,
> extends CreateDetectorOptions<TInstitution | TExtra> {
  /** Institutions to add. An existing id is replaced. */
  readonly institutions?: readonly TExtra[];
}

/**
 * Immutable detector over a fixed institution list.
 * `TInstitution` narrows `detect()` results to the registered ids.
 */
export interface Detector<TInstitution extends Institution = Institution> {
  readonly institutions: readonly TInstitution[];
  detect(
    input: string,
    options?: DetectOptions<TInstitution["id"]>,
  ): readonly DetectionResult<TInstitution>[];
  /** Returns a new detector with extra institutions, rules, weights or verifiers. */
  extend<TExtra extends Institution>(
    options: ExtendDetectorOptions<TInstitution, TExtra>,
  ): Detector<TInstitution | TExtra>;
  /** Returns a new detector without the institutions matching an id or predicate. */
  remove(
    target: InstitutionIdInput<TInstitution["id"]> | ((institution: TInstitution) => boolean),
  ): Detector<TInstitution>;
}
