import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import type { Subject } from "../../types";
import { defineInstitution } from "../../core/define-institution";
import { expandTwoDigitRange } from "../expand-range";

/**
 * Subject set shared by the integrated Citi 13-digit ('06.7.18) pattern and
 * the former KorAm 11-digit pattern. The PDF states "(former KorAm) — same as
 * integrated Citi".
 */
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
    label: "가계종합",
  }),
  defineSubject({ code: "91", category: "linked" }),
  defineSubject({ code: "92", category: "linked" }),
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
  // free-savings: 63·64 within 60~69 are excluded — classified as savings (duplicated in the PDF).
  ...["60", "61", "62", "65", "66", "67", "68", "69"].map((code) =>
    defineSubject({ code, category: "free-savings" }),
  ),
  ...expandTwoDigitRange(0, 19).map((code) => defineSubject({ code, category: "current" })),
  defineSubject({ code: "59", category: "corporate-free" }),
  defineSubject({
    code: "40",
    category: "household-current",
    label: "가계종합",
  }),
  defineSubject({
    code: "48",
    category: "household-current",
    label: "가계종합",
  }),
];

export const citi = /* @__PURE__ */ defineInstitution({
  id: "citi",
  code: "027",
  aliasCodes: ["036", "053"],
  nameKo: "한국씨티은행",
  nameEn: "Citibank Korea",
  category: "bank",
  aliases: ["씨티", "Citi", "씨티은행"],
  priority: 15,
  patterns: [
    {
      template: T("X-XXXXXX-XX-X"),
      kind: "new",
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["5", "0"],
      subjectPosition: { start: 0, length: 1 },
      subjects: [
        defineSubject({ code: "5", category: "ordinary" }),
        defineSubject({
          code: "0",
          category: "household-current",
          label: "가계종합",
        }),
      ],
    },
    {
      template: T("X-XXXXXX-X-XX-XX"),
      kind: "new",
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
      template: T("XXX-XXXXX-XX-X-XX"),
      kind: "new",
      subjectPosition: { start: 8, length: 2 },
      subjects: integratedCitiSubjects,
      effectiveFrom: "2006-07-18",
    },
    // Subject set identical to integrated Citi 13d (PDF: "(former KorAm) — same as integrated Citi").
    {
      template: T("XXX-XXXXX-XX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 8, length: 2 },
      subjects: integratedCitiSubjects,
      note: "(구)한미은행",
    },
    {
      template: T("XX-XX-XXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 2, length: 2 },
      subjects: formerCitiSubjects,
      note: "(구) 053 씨티은행",
    },
  ],
});
