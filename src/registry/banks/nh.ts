import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import type { Subject } from "../../types";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

const nhBankSubjectsOld: Subject[] = [
  defineSubject({ code: "01", category: "ordinary" }),
  defineSubject({ code: "02", category: "savings" }),
  defineSubject({ code: "12", category: "free-savings" }),
  defineSubject({
    code: "06",
    category: "household-current",
    label: "가계종합",
  }),
  defineSubject({ code: "05", category: "current" }),
  defineSubject({ code: "17", category: "corporate-free" }),
  /** p.4 비고 "입금만 가능과목": 적금·신탁. */
  ...["04", "10", "14", "21", "24", "34", "45", "47", "49", "59", "80"].map((code) =>
    defineSubject({ code, category: "installment", allowsWithdrawal: false }),
  ),
  ...["28", "31", "43", "46", "79", "81", "86", "87", "88"].map((code) =>
    defineSubject({ code, category: "trust", allowsWithdrawal: false }),
  ),
];

/** p.4: a 13-digit account belongs to NH Bank only when its last digit (계좌구분) is 1 or 2. */
const nh13AccountClass = (digits: string): boolean => digits[12] === "1" || digits[12] === "2";

export const nh = defineInstitution({
  id: "nh",
  code: "011",
  aliasCodes: ["010", "016"],
  nameKo: "NH농협은행",
  nameEn: "NongHyup Bank",
  category: "bank",
  aliases: ["농협", "NH", "NH농협", "농협은행"],
  userBaseMillions: 25,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      subjects: nhBankSubjectsOld,
    },
    {
      template: patternTemplate("XXXX-XX-XXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 4, length: 2 },
      subjects: nhBankSubjectsOld,
    },
    {
      template: patternTemplate("XXX-XXXX-XXXX-XX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2009-01-28",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["301", "302", "312", "306", "305", "317"],
      additionalRules: [nh13AccountClass],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "301", category: "ordinary" }),
        defineSubject({ code: "302", category: "savings" }),
        defineSubject({ code: "312", category: "free-savings" }),
        defineSubject({ code: "306", category: "household-current" }),
        defineSubject({ code: "305", category: "current" }),
        defineSubject({ code: "317", category: "corporate-free" }),
      ],
    },
    {
      template: patternTemplate("XXX-XXXX-XXXX-XX"),
      kind: "incoming-only",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2009-01-28",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["304", "310", "314", "321", "324", "334", "345", "347", "349", "359", "380"],
      additionalRules: [nh13AccountClass],
      subjectPosition: { start: 0, length: 3 },
      subjects: ["304", "310", "314", "321", "324", "334", "345", "347", "349", "359", "380"].map(
        (code) =>
          defineSubject({
            code,
            category: "installment",
            allowsWithdrawal: false,
          }),
      ),
    },
    {
      template: patternTemplate("XXX-XXXX-XXXX-XX"),
      kind: "incoming-only",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2009-01-28",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["028", "031", "043", "046", "079", "081", "086", "087", "088"],
      additionalRules: [nh13AccountClass],
      subjectPosition: { start: 0, length: 3 },
      subjects: ["028", "031", "043", "046", "079", "081", "086", "087", "088"].map((code) =>
        defineSubject({ code, category: "trust", allowsWithdrawal: false }),
      ),
    },
    {
      template: patternTemplate("XXXXXX-XX-XXXXX-X"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directDebit"),
      subjectPosition: { start: 6, length: 2 },
      subjects: [
        defineSubject({ code: "64", category: "ordinary", virtual: true }),
        defineSubject({ code: "65", category: "ordinary", virtual: true }),
      ],
      effectiveFrom: "2007-11-27",
      note: "구가상계좌, HMC·삼성·미래에셋·현대·NH·한화 증권 한정",
    },
    {
      template: patternTemplate("XXX-XXXX-XXXX-XX-X"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directDebit"),
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["790", "791"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "790", category: "ordinary", virtual: true }),
        defineSubject({ code: "791", category: "ordinary", virtual: true }),
      ],
      effectiveFrom: "2009-01-28",
      note: "신가상계좌",
    },
  ],
});
