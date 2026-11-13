import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const kfcc = defineInstitution({
  id: "kfcc",
  code: "045",
  aliasCodes: ["046", "085", "086", "087"],
  nameKo: "새마을금고중앙회",
  nameEn: "Korean Federation of Community Credit Cooperatives",
  category: "non-bank",
  aliases: ["새마을금고", "새마을", "MG", "MG새마을금고"],
  userBaseMillions: 17,
  patterns: [
    {
      template: patternTemplate("XXXX-XX-XXXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({ code: "09", category: "ordinary" }),
        defineSubject({ code: "10", category: "ordinary" }),
        defineSubject({ code: "13", category: "ordinary" }),
      ],
    },
    {
      template: patternTemplate("XXXX-XX-XXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2009-09-21",
      identifierPosition: { start: 0, length: 4 },
      /** p.9 "9" + 과목(3): 002~005 and virtual 037 (no 001). */
      identifiers: ["9002", "9003", "9004", "9005", "9037"],
      subjectPosition: { start: 1, length: 3 },
      subjects: [
        defineSubject({ code: "002", category: "ordinary" }),
        defineSubject({ code: "003", category: "ordinary" }),
        defineSubject({ code: "004", category: "ordinary" }),
        defineSubject({ code: "005", category: "corporate-free" }),
        defineSubject({
          code: "037",
          services: cmsServices("virtualAccount", "directCredit", "additionalServices"),
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2009-09-21",
        }),
      ],
    },
    {
      template: patternTemplate("XXXX-XX-XXXXXXX"),
      kind: "incoming-only",
      services: cmsServices("directCredit", "additionalServices"),
      effectiveFrom: "2009-09-21",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["9206", "9207", "9210"],
      subjectPosition: { start: 1, length: 3 },
      subjects: ["206", "207", "210"].map((code) =>
        defineSubject({ code, category: "savings", allowsWithdrawal: false }),
      ),
    },
    {
      template: patternTemplate("XXXX-XX-XXXXXXX"),
      kind: "incoming-only",
      services: cmsServices("directCredit", "additionalServices"),
      effectiveFrom: "2009-09-21",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["9200", "9202", "9205", "9208", "9209", "9212"],
      subjectPosition: { start: 1, length: 3 },
      subjects: ["200", "202", "205", "208", "209", "212"].map((code) =>
        defineSubject({
          code,
          category: "installment",
          allowsWithdrawal: false,
        }),
      ),
    },
  ],
});
