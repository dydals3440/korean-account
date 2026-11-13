import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const capeInv = defineInstitution({
  id: "cape-inv",
  code: "292",
  nameKo: "케이프투자증권",
  nameEn: "Cape Investment & Securities",
  category: "securities",
  aliases: ["케이프투자증권", "케이프", "LIG투자증권"],
  userBaseMillions: 0.8,
  successorOf: ["lig-investment"],
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({
          code: "24",
          category: "isa",
          label: "중개형 ISA",
          effectiveFrom: "2021-12-27",
        }),
        defineSubject({ code: "33", category: "savings" }),
        defineSubject({ code: "55", category: "savings" }),
        defineSubject({ code: "75", category: "savings" }),
        defineSubject({ code: "76", category: "savings" }),
        defineSubject({ code: "77", category: "savings" }),
        defineSubject({ code: "78", category: "savings" }),
        defineSubject({ code: "88", category: "savings" }),
      ],
    },
    {
      template: patternTemplate("XXX-XX-XXXXXX-XXX"),
      kind: "new",
      services: cmsServices("directCredit", "additionalServices"),
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({
          code: "87",
          category: "savings",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "88",
          category: "savings",
          allowsWithdrawal: false,
        }),
      ],
    },
  ],
});
