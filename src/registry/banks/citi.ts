import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import type { Subject } from "../../types";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";
import { expandTwoDigitRange } from "../expand-range";

/** Subjects of the integrated Citi 13-digit and former KorAm 11-digit formats (PDF p.6). */
const integratedCitiSubjects: readonly Subject[] = [
  defineSubject({ code: "01", category: "ordinary" }),
  defineSubject({ code: "11", category: "ordinary" }),
  defineSubject({ code: "21", category: "ordinary" }),
  defineSubject({ code: "25", category: "ordinary" }),
  defineSubject({ code: "31", category: "ordinary" }),
  defineSubject({ code: "42", category: "ordinary" }),
  defineSubject({ code: "51", category: "ordinary" }),
  defineSubject({ code: "71", category: "ordinary" }),
  defineSubject({ code: "81", category: "ordinary" }),
  defineSubject({ code: "23", category: "treasury" }),
  defineSubject({ code: "05", category: "savings" }),
  defineSubject({ code: "06", category: "savings" }),
  defineSubject({ code: "15", category: "savings" }),
  defineSubject({ code: "26", category: "savings" }),
  defineSubject({ code: "29", category: "savings" }),
  defineSubject({ code: "07", category: "free-savings" }),
  defineSubject({ code: "27", category: "free-savings" }),
  defineSubject({ code: "55", category: "free-savings" }),
  defineSubject({ code: "03", category: "current" }),
  defineSubject({ code: "13", category: "current" }),
  defineSubject({ code: "33", category: "current" }),
  defineSubject({ code: "41", category: "current" }),
  defineSubject({ code: "43", category: "current" }),
  defineSubject({ code: "53", category: "current" }),
  defineSubject({ code: "63", category: "current" }),
  defineSubject({ code: "24", category: "corporate-free" }),
  defineSubject({
    code: "99",
    category: "household-current",
    label: "가계종합예금",
  }),
  ...["91", "92"].map((code) =>
    defineSubject({
      code,
      category: "linked",
      virtual: true,
      allowsWithdrawal: false,
      services: { directDebit: false, additionalServices: false },
    }),
  ),
];

/**
 * (053) former Citibank 10-digit subject set. Expands the PDF's wide code
 * spec into per-category ranges.
 *
 * - ordinary: 20·21·32·34·36~38·42·46·70·71·73~78·80·81·83·84~88·91~96·99
 * - savings: 30·33·35·41·43~45·50~58·63·64
 * - free-savings: 60~69
 * - current: 00~19
 * - corporate-free: 59
 * - household-current: 40, 48
 */
const formerCitiSubjects: readonly Subject[] = [
  ...["20", "21", "32", "34", "36", "37", "38", "42", "46", "70", "71"].map((code) =>
    defineSubject({ code, category: "ordinary" }),
  ),
  ...expandTwoDigitRange(73, 78).map((code) => defineSubject({ code, category: "ordinary" })),
  ...["80", "81", "83"].map((code) => defineSubject({ code, category: "ordinary" })),
  ...expandTwoDigitRange(84, 88).map((code) => defineSubject({ code, category: "ordinary" })),
  ...expandTwoDigitRange(91, 96).map((code) => defineSubject({ code, category: "ordinary" })),
  defineSubject({ code: "99", category: "ordinary" }),
  ...["30", "33", "35", "41"].map((code) => defineSubject({ code, category: "savings" })),
  ...expandTwoDigitRange(43, 45).map((code) => defineSubject({ code, category: "savings" })),
  ...expandTwoDigitRange(50, 58).map((code) => defineSubject({ code, category: "savings" })),
  ...["63", "64"].map((code) => defineSubject({ code, category: "savings" })),
  // 63·64 appear under both 저축 and 자유저축 in the PDF; they are kept as savings.
  ...["60", "61", "62", "65", "66", "67", "68", "69"].map((code) =>
    defineSubject({ code, category: "free-savings" }),
  ),
  // p.6 부가서비스 ○(00불가)
  defineSubject({ code: "00", category: "current", services: { additionalServices: false } }),
  ...expandTwoDigitRange(1, 19).map((code) => defineSubject({ code, category: "current" })),
  defineSubject({ code: "59", category: "corporate-free" }),
  defineSubject({
    code: "40",
    category: "household-current",
    label: "가계종합예금",
  }),
  defineSubject({
    code: "48",
    category: "household-current",
    label: "가계종합예금",
  }),
];

export const citi = defineInstitution({
  id: "citi",
  code: "027",
  aliasCodes: ["036", "053"],
  nameKo: "한국씨티은행",
  nameEn: "Citibank Korea",
  category: "bank",
  aliases: ["씨티", "Citi", "씨티은행"],
  userBaseMillions: 0.5,
  patterns: [
    {
      template: patternTemplate("X-XXXXXX-XX-X"),
      kind: "merged-legacy",
      services: cmsServices("directDebit", "directCredit"),
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["5", "0"],
      subjectPosition: { start: 0, length: 1 },
      subjects: [
        defineSubject({ code: "5", services: { additionalServices: false }, category: "ordinary" }),
        defineSubject({
          code: "0",
          category: "household-current",
          label: "가계종합예금",
        }),
      ],
    },
    {
      template: patternTemplate("X-XXXXXX-X-XX-XX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 8, length: 2 },
      subjects: [
        defineSubject({ code: "25", category: "ordinary" }),
        defineSubject({ code: "41", category: "current" }),
        defineSubject({ code: "24", category: "corporate-free" }),
        defineSubject({
          code: "18",
          category: "installment",
          label: "기업금융 적금",
        }),
      ],
      effectiveFrom: "2008-10-06",
    },
    {
      template: patternTemplate("XXX-XXXXX-XX-X-XX"),
      kind: "new",
      services: cmsServices("virtualAccount", "directDebit", "directCredit", "additionalServices"),
      subjectPosition: { start: 8, length: 2 },
      subjects: integratedCitiSubjects,
      effectiveFrom: "2006-07-18",
    },
    {
      template: patternTemplate("XXX-XXXXX-XX-X"),
      kind: "merged-legacy",
      services: cmsServices("virtualAccount", "directDebit", "directCredit", "additionalServices"),
      subjectPosition: { start: 8, length: 2 },
      subjects: integratedCitiSubjects,
      note: "(구)한미은행",
    },
    {
      template: patternTemplate("XX-XX-XXXXX-X"),
      kind: "merged-legacy",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 2, length: 2 },
      subjects: formerCitiSubjects,
      note: "(구) 053 씨티은행",
    },
  ],
});
