import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import type { Subject } from "../../types";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";
import { isNotHanaForeignLegacy14 } from "./hana-foreign-legacy";

/** p.7 비고 "입금만 가능과목": 2-digit codes and their 3-digit `5xx` twins. */
const DEPOSIT_ONLY_PRODUCTS = [
  { code: "19", category: "installment", label: "근로자우대저축" },
  { code: "20", category: "savings", label: "비과세가계장기저축" },
  { code: "21", category: "installment", label: "가계우대정기적금" },
  { code: "25", category: "installment", label: "상호부금" },
  { code: "27", category: "savings", label: "평생저축" },
  { code: "28", category: "installment", label: "장기주택마련저축" },
] as const;

const depositOnlyCodes = (prefix: "" | "5"): readonly string[] =>
  DEPOSIT_ONLY_PRODUCTS.map(({ code }) => `${prefix}${code}`);

const depositOnlySubjects = (prefix: "" | "5"): readonly Subject[] =>
  DEPOSIT_ONLY_PRODUCTS.map(({ code, category, label }) =>
    defineSubject({ code: `${prefix}${code}`, category, label, allowsWithdrawal: false }),
  );

export const imBank = defineInstitution({
  id: "im-bank",
  code: "031",
  nameKo: "iM뱅크",
  nameEn: "iM Bank",
  category: "bank",
  aliases: ["대구은행", "iM뱅크", "iM", "DGB", "iM bank"],
  userBaseMillions: 3,
  patterns: [
    {
      template: patternTemplate("XX-XXXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 2 },
      identifiers: ["91", "92", "93", "94", "96"],
      subjectPosition: { start: 0, length: 2 },
      subjects: [
        defineSubject({ code: "91", category: "ordinary" }),
        defineSubject({ code: "92", category: "ordinary" }),
        defineSubject({ code: "93", category: "ordinary" }),
        defineSubject({ code: "94", category: "ordinary" }),
        defineSubject({ code: "96", category: "ordinary" }),
      ],
    },
    { template: patternTemplate("XXXXXXX"), kind: "old", services: REGULAR_ACCOUNT_SERVICES },
    { template: patternTemplate("XXXXXXXX"), kind: "old", services: REGULAR_ACCOUNT_SERVICES },
    { template: patternTemplate("XXXXXXXXX"), kind: "old", services: REGULAR_ACCOUNT_SERVICES },
    { template: patternTemplate("XXXXXXXXXX"), kind: "old", services: REGULAR_ACCOUNT_SERVICES },
    { template: patternTemplate("XXXXXXXXXXX"), kind: "old", services: REGULAR_ACCOUNT_SERVICES },
    {
      template: patternTemplate("XXX-XX-XXXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "05", category: "ordinary" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
        ...depositOnlySubjects(""),
      ],
    },
    {
      template: patternTemplate("XXX-XX-XXXXXX-X"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["505", "508", "502", "501", "504", ...depositOnlyCodes("5"), "524"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "505", category: "ordinary" }),
        defineSubject({ code: "508", category: "savings" }),
        defineSubject({ code: "502", category: "household-current" }),
        defineSubject({ code: "501", category: "current" }),
        defineSubject({ code: "504", category: "corporate-free" }),
        ...depositOnlySubjects("5"),
        defineSubject({
          code: "524",
          category: "savings",
          label: "재형저축",
          allowsWithdrawal: false,
        }),
      ],
    },
    /** p.7 14자리 점번호형: branch ranges are unpublished, so only subjects identify it. */
    {
      template: patternTemplate("XXX-XX-XXXXXX-XXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      additionalRules: [isNotHanaForeignLegacy14],
      subjects: [
        defineSubject({ code: "05", category: "ordinary" }),
        defineSubject({ code: "91", category: "ordinary" }),
        defineSubject({ code: "92", category: "ordinary" }),
        defineSubject({ code: "93", category: "ordinary" }),
        defineSubject({ code: "94", category: "ordinary" }),
        defineSubject({ code: "96", category: "ordinary" }),
        defineSubject({ code: "06", category: "savings" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
        ...depositOnlySubjects(""),
      ],
    },
    {
      template: patternTemplate("XXX-XXXXXXXXXX-X"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directCredit"),
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["937", "938", "999"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({
          code: "937",
          category: "ordinary",
          virtual: true,
          allowsWithdrawal: false,
          effectiveFrom: "2023-08-01",
        }),
        defineSubject({
          code: "938",
          category: "ordinary",
          virtual: true,
          allowsWithdrawal: false,
          effectiveFrom: "2026-05-08",
        }),
        defineSubject({
          code: "999",
          label: "모임통장용 가상계좌",
          category: "ordinary",
          virtual: true,
          allowsWithdrawal: false,
          effectiveFrom: "2026-03-24",
        }),
      ],
    },
  ],
});
