import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

const nhCoopSubjectsNew = [
  defineSubject({ code: "351", category: "ordinary" }),
  defineSubject({ code: "352", category: "savings" }),
  defineSubject({ code: "356", category: "free-savings" }),
  defineSubject({ code: "355", category: "corporate-free" }),
];

/** p.4: a 13-digit account belongs to the coops only when 계좌구분 is 3–5; it alone splits 028 trusts. */
const ACCOUNT_CLASS_3_TO_5 = (digits: string) =>
  digits[12] === "3" || digits[12] === "4" || digits[12] === "5";

export const nhCoop = defineInstitution({
  id: "nh-coop",
  code: "012",
  aliasCodes: ["013", "014", "015", "017", "018"],
  nameKo: "농협중앙회",
  nameEn: "NongHyup Central",
  category: "non-bank",
  aliases: ["농협중앙회", "지역농협", "단위농협", "농축협", "축협"],
  userBaseMillions: 18,
  patterns: [
    {
      template: patternTemplate("XXX-XXXX-XXXX-XX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["351", "352", "356", "355"],
      subjectPosition: { start: 0, length: 3 },
      subjects: nhCoopSubjectsNew,
      additionalRules: [ACCOUNT_CLASS_3_TO_5],
      effectiveFrom: "2009-01-28",
    },
    {
      template: patternTemplate("XXX-XXXX-XXXX-XX"),
      kind: "incoming-only",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2009-01-28",
      additionalRules: [ACCOUNT_CLASS_3_TO_5],
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["354", "360", "384", "394", "398"],
      subjectPosition: { start: 0, length: 3 },
      subjects: ["354", "360", "384", "394", "398"].map((code) =>
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
      additionalRules: [ACCOUNT_CLASS_3_TO_5],
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["028"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({
          code: "028",
          category: "trust",
          allowsWithdrawal: false,
        }),
      ],
    },
    {
      template: patternTemplate("XXXXXX-XX-XXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 6, length: 2 },
      subjects: [
        defineSubject({ code: "51", category: "ordinary" }),
        defineSubject({ code: "52", category: "savings" }),
        defineSubject({ code: "56", category: "free-savings" }),
        defineSubject({ code: "55", category: "corporate-free" }),
      ],
    },
    {
      template: patternTemplate("XXXXXX-XX-XXXXX-X"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directDebit"),
      subjectPosition: { start: 6, length: 2 },
      subjects: [
        defineSubject({ code: "66", category: "ordinary", virtual: true }),
        defineSubject({ code: "67", category: "ordinary", virtual: true }),
      ],
      effectiveFrom: "2007-11-27",
      note: "구가상계좌",
    },
    {
      template: patternTemplate("XXX-XXXX-XXXX-XX-X"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directDebit"),
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["792"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({
          code: "792",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2009-01-28",
        }),
      ],
    },
  ],
});
