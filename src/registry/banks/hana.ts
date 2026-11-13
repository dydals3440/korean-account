import { defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import type { Subject, SubjectCategory } from "../../types";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";
import { isHanaForeignLegacy14 } from "./hana-foreign-legacy";

/** p.2 비고 "입금만 가능한 계좌": each product's 2-digit (11자리) and 3-digit (12자리) codes. */
const DEPOSIT_ONLY_PRODUCTS = [
  { label: "정기적금", category: "installment", elevenDigit: ["15"], twelveDigit: ["810"] },
  { label: "자유적립식적금", category: "installment", elevenDigit: [], twelveDigit: ["811"] },
  { label: "부금", category: "installment", elevenDigit: ["23"], twelveDigit: ["817", "818"] },
  { label: "근로자우대저축", category: "savings", elevenDigit: ["24"], twelveDigit: ["814"] },
  { label: "장기주택마련저축", category: "savings", elevenDigit: ["29"], twelveDigit: ["815"] },
  { label: "연금신탁", category: "trust", elevenDigit: ["70"], twelveDigit: [] },
  { label: "적립식목적신탁", category: "trust", elevenDigit: ["73"], twelveDigit: [] },
  { label: "기업금전신탁", category: "trust", elevenDigit: ["74"], twelveDigit: ["704"] },
  { label: "가계금전신탁", category: "trust", elevenDigit: ["75"], twelveDigit: ["705"] },
  { label: "노후연금신탁", category: "trust", elevenDigit: ["77"], twelveDigit: ["707"] },
  {
    label: "신탁기타",
    category: "trust",
    elevenDigit: [],
    twelveDigit: ["700", "703", "710", "711", "712", "713", "714", "715", "716"],
  },
] as const satisfies readonly {
  label: string;
  category: SubjectCategory;
  elevenDigit: readonly string[];
  twelveDigit: readonly string[];
}[];

type AccountWidth = "elevenDigit" | "twelveDigit";

const depositOnlyCodes = (width: AccountWidth): readonly string[] =>
  DEPOSIT_ONLY_PRODUCTS.flatMap((product) => product[width]);

const depositOnlySubjects = (width: AccountWidth): readonly Subject[] =>
  DEPOSIT_ONLY_PRODUCTS.flatMap(({ label, category, ...codes }) =>
    codes[width].map((code) => defineSubject({ code, category, label, allowsWithdrawal: false })),
  );

const TWELVE_DIGIT_REGULAR_CODES = ["611", "620", "600", "601", "630", "621", "631", "610"];

export const hana = defineInstitution({
  id: "hana",
  code: "005",
  // Historical library codes are preserved; the current PDF lists Hana Bank as 081.
  commonCode: "081",
  // 081 is excluded from aliasCodes to avoid a code clash with hanaSecuritiesCma.
  aliasCodes: ["025", "033", "080", "082"],
  nameKo: "하나은행",
  nameEn: "Hana Bank",
  category: "bank",
  aliases: ["하나", "KEB하나", "하나은행", "외환은행"],
  userBaseMillions: 18,
  successorOf: ["keb-foreign-exchange"],
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "13", category: "ordinary" }),
        defineSubject({ code: "33", category: "ordinary" }),
        defineSubject({ code: "18", category: "savings" }),
        defineSubject({ code: "38", category: "savings" }),
        defineSubject({ code: "19", category: "free-savings" }),
        defineSubject({ code: "39", category: "free-savings" }),
        defineSubject({ code: "26", category: "household-current" }),
        defineSubject({ code: "11", category: "current" }),
        defineSubject({ code: "22", category: "corporate-free" }),
        ...depositOnlySubjects("elevenDigit"),
      ],
      note: "평생계좌 자동이체 등록 불가",
    },
    {
      template: patternTemplate("XXX-XXXXXX-XXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 3 },
      identifiers: [...TWELVE_DIGIT_REGULAR_CODES, ...depositOnlyCodes("twelveDigit")],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "611", category: "ordinary" }),
        defineSubject({ code: "610", category: "treasury", effectiveFrom: "2009-06-15" }),
        defineSubject({ code: "620", category: "savings" }),
        defineSubject({ code: "600", category: "household-current" }),
        defineSubject({ code: "601", category: "current" }),
        defineSubject({ code: "630", category: "corporate-free" }),
        defineSubject({ code: "621", category: "yes" }),
        defineSubject({ code: "631", category: "yes" }),
        ...depositOnlySubjects("twelveDigit"),
      ],
      note: "평생계좌 자동이체 등록 불가",
    },
    {
      template: patternTemplate("XXX-XXXXXX-XXXXX"),
      kind: "merged-legacy",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["117", "158", "161", "162", "210", "379", "600", "655"],
      additionalRules: [isHanaForeignLegacy14],
      note: "구 외환 통합 신상품 prefix",
    },
  ],
});
