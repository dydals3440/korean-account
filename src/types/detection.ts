import type { CONFIDENCE_LEVELS } from "../constants";
import type { Institution, InstitutionCategory, InstitutionIdInput } from "./institution";
import type {
  AccountKind,
  AccountPattern,
  CmsServices,
  ResolvedSubject,
  SubjectCategory,
} from "./pattern";

/**
 * How strongly the evidence supports a result: `"high"`, `"medium"` or `"low"`.
 *
 * Derived from the score with fixed thresholds: `"high"` at 7 or more, `"medium"` at 4 or more,
 * otherwise `"low"`. A match backed only by length and rules, with no identifier, subject code
 * or non-fallback branch rule, is always `"low"`. The thresholds are calibrated for the default
 * {@link ScoringWeights}, so custom weights move matches between bands.
 */
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

/**
 * Detector-wide scoring rule, registered with `CreateDetectorOptions.globalRules`.
 *
 * Called for each institution that has a matching pattern, with the normalized digits and that
 * institution before any branch rule reroutes it. Each `true` adds `ScoringWeights.globalRule`;
 * `false` adds nothing and never removes the match.
 *
 * @example Favour banks over other institutions
 * const detector = createDetector(institutions, {
 *   globalRules: [(digits, institution) => institution.category === "bank"],
 * });
 */
export type GlobalRule = (digits: string, institution: Institution) => boolean;

/**
 * Check-digit algorithm for one institution, registered with
 * `CreateDetectorOptions.checkDigitVerifiers`. KFTC does not publish these algorithms, so none
 * are built in.
 *
 * Receives the normalized digits of the whole input, including partial input, and returns
 * whether they pass. The outcome is reported as `capabilities.validatedCheckDigit` and does not
 * change the score or the ranking.
 *
 * @example
 * const detector = createDetector(institutions, {
 *   checkDigitVerifiers: {
 *     shinhan: (digits) => digits.length === 12 && myShinhanChecksum(digits),
 *   },
 * });
 */
export type CheckDigitVerifier = (digits: string) => boolean;

/**
 * What the KFTC CMS table says the matched account format supports.
 *
 * The values are static rules from the table: they do not confirm that the account exists or
 * that its bank will accept a particular transfer.
 *
 * @example
 * const capabilities = detectBest("1712-3456-7890")?.capabilities; // Toss virtual account
 * capabilities?.virtual; // true
 * capabilities?.allowsWithdrawal; // false
 * capabilities?.services?.virtualAccount; // true
 */
export interface DetectionCapabilities {
  /**
   * Whether CMS direct debit (출금이체) can be registered against the account. With PDF
   * `services` on the pattern: the subject's own `allowsWithdrawal`, else the 출금이체 column with
   * the subject's `services` exceptions applied. Without them: virtual accounts and the
   * `incoming-only` and `lifetime` kinds are always `false`, and the subject can only narrow
   * the rest. `DetectionResult.subject.allowsWithdrawal` always holds the same value.
   */
  readonly allowsWithdrawal: boolean;
  /**
   * Whether the account itself is a virtual account (가상계좌): the branch rule's
   * `virtualOverride` when set, otherwise `subject.virtual` or a `"virtual"` kind. Compare
   * `services.virtualAccount`, which says whether the format can be issued as one.
   */
  readonly virtual: boolean;
  /**
   * Outcome of the `CheckDigitVerifier` registered for `institution.id`; `null` when none is
   * registered or the pattern sets `validatesCheckDigit: false`.
   */
  readonly validatedCheckDigit: boolean | null;
  /**
   * The PDF service columns of the matched format with the subject's per-code exceptions
   * applied; `null` when the pattern declares no `services`.
   */
  readonly services: CmsServices | null;
}

/**
 * One candidate institution for an account number, as returned by `detect` (best first).
 *
 * A result is a hint inferred from the KFTC numbering rules, not proof that the account exists.
 * Confirm the institution with the user or a verification API before moving money.
 *
 * @typeParam TInstitution - Institutions of the detector; narrows `institution.id`.
 * @example
 * const best = detectBest("110-436-387740");
 * best?.institution.id; // "shinhan"
 * best?.subject?.label; // "저축예금"
 * best?.confidence; // "high"
 * best?.ambiguous; // true: Korea Post and Shinhyup also score "high"
 */
export interface DetectionResult<TInstitution extends Institution = Institution> {
  /**
   * Institution the account is attributed to. A branch rule can reroute it, so it does not
   * always own `matchedPattern`.
   */
  readonly institution: TInstitution;
  /** Best-scoring pattern of the matching institution; the first declared pattern wins ties. */
  readonly matchedPattern: AccountPattern;
  /** The branch rule's `kindOverride` when set, otherwise `matchedPattern.kind`. */
  readonly kind: AccountKind;
  /**
   * Ledger subject (계정과목) whose code sits at `matchedPattern.subjectPosition`, with `label`,
   * `allowsWithdrawal` and `virtual` filled in. Omitted when no subject code matches.
   */
  readonly subject?: ResolvedSubject;
  /**
   * Input digits grouped by `matchedPattern.template`, e.g. `"110-436-387740"`. Partial input
   * stops at the last digit; digits beyond the template are appended ungrouped.
   */
  readonly formatted: string;
  /**
   * Sum of the {@link ScoringWeights} the match earned; at least `DetectOptions.minScore`.
   * Unnormalized, so compare it only with results of the same detector.
   */
  readonly score: number;
  /**
   * `"high"` for a score of 7 or more, `"medium"` for 4 or more, otherwise `"low"`. Always
   * `"low"` unless an identifier, subject code or non-fallback branch rule backs the match.
   * When the top result is `"high"` or `"medium"`, `"low"` results are dropped from the list.
   */
  readonly confidence: Confidence;
  /**
   * `true` when another institution matches the input with the same `confidence`, so the user
   * should confirm. Institutions hidden by `DetectOptions` filters or `limit` still count.
   */
  readonly ambiguous: boolean;
  /** Static capabilities of the matched format. */
  readonly capabilities: DetectionCapabilities;
}

/**
 * JSON-safe summary of a `DetectionResult`, with the institution reduced to its id and the
 * pattern left out. Produced by `toDetectionPayload` and validated by every adapter's
 * `detectionSchema`, e.g. to check a detection a client sends to a server.
 *
 * @typeParam TId - Accepted institution ids; the built-in schemas use `InstitutionId`.
 * @example
 * import { detectionSchema } from "korean-account/zod";
 *
 * const best = detectBest("110-436-387740");
 * const payload = best && toDetectionPayload(best);
 * payload?.institutionId; // "shinhan"
 * detectionSchema.parse(JSON.parse(JSON.stringify(payload))); // passes
 */
export interface DetectionPayload<TId extends string = string> {
  /** `institution.id` of the result. */
  readonly institutionId: TId;
  /** `DetectionResult.kind`. */
  readonly kind: AccountKind;
  /** The result's subject; omitted when the result has none. */
  readonly subject?:
    | {
        /** Zero-padded subject code, e.g. `"110"`. */
        readonly code: string;
        /** Subject category. */
        readonly category: SubjectCategory;
        /** Display label; always set by `toDetectionPayload`. */
        readonly label?: string | undefined;
      }
    | undefined;
  /** `DetectionResult.score`; schemas accept any finite number ≥ 0. */
  readonly score: number;
  /** `DetectionResult.confidence`. */
  readonly confidence: Confidence;
  /**
   * `DetectionResult.ambiguous`. Always set by `toDetectionPayload`; optional so that payloads
   * built without it still validate.
   */
  readonly ambiguous?: boolean | undefined;
  /** `DetectionResult.formatted`. */
  readonly formatted: string;
  /** Copy of `DetectionResult.capabilities`. */
  readonly capabilities: {
    /** See `DetectionCapabilities.allowsWithdrawal`. */
    readonly allowsWithdrawal: boolean;
    /** See `DetectionCapabilities.virtual`. */
    readonly virtual: boolean;
    /** See `DetectionCapabilities.validatedCheckDigit`. */
    readonly validatedCheckDigit: boolean | null;
    /**
     * See `DetectionCapabilities.services`. Always set by `toDetectionPayload`; optional so that
     * payloads built without it still validate.
     */
    readonly services?: CmsServices | null | undefined;
  };
}

/**
 * Filters and limits for one `detect` call.
 *
 * Filters apply to the final result, after a branch rule reroutes the institution or replaces
 * the kind. They never change `ambiguous`, which looks at every match. A filter left
 * `undefined` keeps every result; an empty `categories`, `kinds` or `include` array keeps none.
 *
 * @typeParam TId - Institution ids that `include` and `exclude` autocomplete.
 * @example
 * detect("110-436-387740"); // shinhan, post and shinhyup, each ambiguous
 * detect("110-436-387740", { categories: ["bank"] }); // shinhan only, still ambiguous
 */
export interface DetectOptions<TId extends string = string> {
  /** Keeps results whose institution is in one of these categories. */
  readonly categories?: readonly InstitutionCategory[] | undefined;
  /** Keeps results whose `kind` is one of these. */
  readonly kinds?: readonly AccountKind[] | undefined;
  /** Keeps only results for these institution ids. */
  readonly include?: readonly InstitutionIdInput<TId>[] | undefined;
  /** Drops results for these institution ids; wins over `include`. */
  readonly exclude?: readonly InstitutionIdInput<TId>[] | undefined;
  /**
   * Maximum number of results, applied after ranking. A non-negative integer or `Infinity`;
   * any other value makes `detect` throw a `RangeError`.
   *
   * @default 5
   */
  readonly limit?: number | undefined;
  /**
   * Drops results scoring below this value. `NaN` makes `detect` throw a `RangeError`.
   *
   * @default 1
   */
  readonly minScore?: number | undefined;
}

/**
 * Points a detector awards per matching signal, passed as `CreateDetectorOptions.scoring`.
 *
 * Omitted or `undefined` keys keep their defaults. Each weight must be a finite number ≥ 0,
 * otherwise `createDetector` throws a `RangeError`. Identifier and subject matches also earn one
 * point per code digit beyond the first (none when the weight is 0), and input shorter than the
 * template earns half of each, rounded down. When the identifier and subject spans overlap, the
 * shared digits count once: only the larger of the two scores is added. The {@link Confidence}
 * thresholds stay fixed, so heavier weights move matches into higher bands.
 *
 * @example
 * createDetector(institutions, { scoring: { identifierMatch: 6, kindNewBonus: 1 } });
 */
export interface ScoringWeights {
  /** Digit count equals the template's. @default 3 */
  readonly lengthExact?: number | undefined;
  /** Digit count is one more or one less than the template's. @default 1 */
  readonly lengthNear?: number | undefined;
  /**
   * The fully typed digits at `identifierPosition` are in `identifiers` or `identifierRange`.
   *
   * @default 4
   */
  readonly identifierMatch?: number | undefined;
  /** The fully typed digits at `subjectPosition` equal a declared `Subject.code`. @default 3 */
  readonly subjectMatch?: number | undefined;
  /** Per `additionalRules` entry, for input within one digit of the template length. @default 1 */
  readonly additionalRule?: number | undefined;
  /** Per detector-level `GlobalRule` that returns `true`. @default 1 */
  readonly globalRule?: number | undefined;
  /**
   * The matched pattern's `branchRule` returned an adjustment and the match has evidence: an
   * identifier or subject match, or a branch that is not a fallback
   * (see `BranchRuleResult.isFallback`).
   *
   * @default 2
   */
  readonly branchRuleMatch?: number | undefined;
  /**
   * Added to each matching pattern of kind `"new"` before the institution's best pattern is
   * chosen; a branch `kindOverride` does not affect it.
   *
   * @default 0
   */
  readonly kindNewBonus?: number | undefined;
}

/**
 * Options for `createDetector`. Every field is optional; `undefined` means none or the default.
 *
 * @typeParam TInstitution - Institutions of the detector; keys `checkDigitVerifiers` by id.
 */
export interface CreateDetectorOptions<TInstitution extends Institution = Institution> {
  /** Detector-wide rules; each passing rule adds `ScoringWeights.globalRule`. @default [] */
  readonly globalRules?: readonly GlobalRule[] | undefined;
  /** Weight overrides, merged key by key over the defaults. @default {} */
  readonly scoring?: ScoringWeights | undefined;
  /**
   * Check-digit verifiers keyed by institution id, looked up with the result's institution after
   * any branch reroute. `undefined` entries are ignored.
   *
   * @default {}
   */
  readonly checkDigitVerifiers?:
    | Readonly<Partial<Record<TInstitution["id"], CheckDigitVerifier>>>
    | undefined;
}

/**
 * Options for `Detector.extend`, which returns a new detector and leaves the original intact.
 *
 * `institutions` are added or replaced by id, `globalRules` are appended, and `scoring` and
 * `checkDigitVerifiers` merge key by key over the current detector's values.
 *
 * @typeParam TInstitution - Institutions already in the detector.
 * @typeParam TExtra - Institutions being added; results narrow to `TInstitution | TExtra`.
 * @example
 * const detector = createDetector(institutions).extend({
 *   institutions: [myBank],
 *   scoring: { identifierMatch: 6 },
 * });
 */
export interface ExtendDetectorOptions<
  TInstitution extends Institution = Institution,
  TExtra extends Institution = Institution,
> extends CreateDetectorOptions<TInstitution | TExtra> {
  /** Institutions to add; one whose id is already registered replaces the existing entry. */
  readonly institutions?: readonly TExtra[] | undefined;
}

/**
 * Immutable detector over a fixed institution list, created by `createDetector`. `extend` and
 * `remove` return new detectors that keep the weights, rules and verifiers.
 *
 * @typeParam TInstitution - Registered institutions; narrows result types and accepted ids.
 * @example
 * const detector = createDetector([kb, shinhan, toss]);
 * detector.detect("110-436-387740")[0]?.institution.id; // "shinhan"
 */
export interface Detector<TInstitution extends Institution = Institution> {
  /** Institutions the detector scores; `extend` appends added and replacing entries. */
  readonly institutions: readonly TInstitution[];
  /**
   * Ranks the institutions whose account formats fit `input`, best first.
   *
   * Characters other than digits are ignored and full-width digits count, so
   * `"110-436-387740"` and `"110 436 387740"` are equivalent. Each institution contributes its
   * best pattern, though a branch reroute can list one institution twice. Results are ordered
   * by confidence band, then score, then the `prevalence` prior, then kind.
   *
   * @returns Up to `options.limit` results; empty when nothing matches or `input` has no digits.
   * @throws {RangeError} When `options.limit` or `options.minScore` is invalid.
   */
  detect(
    input: string,
    options?: DetectOptions<TInstitution["id"]>,
  ): readonly DetectionResult<TInstitution>[];
  /**
   * Returns a new detector with institutions added or replaced and rules, weights or verifiers
   * merged in key by key (an `undefined` weight or verifier keeps the current one); see
   * {@link ExtendDetectorOptions}. Without `institutions`, result ids keep this detector's union.
   *
   * @throws {RangeError} When a merged `scoring` weight is not a finite number ≥ 0.
   */
  extend<TExtra extends Institution = never>(
    options: ExtendDetectorOptions<TInstitution, TExtra>,
  ): Detector<TInstitution | TExtra>;
  /**
   * Returns a new detector without the institution that has this id, or without every
   * institution the predicate accepts. An unknown id removes nothing.
   */
  remove(
    target: InstitutionIdInput<TInstitution["id"]> | ((institution: TInstitution) => boolean),
  ): Detector<TInstitution>;
}
