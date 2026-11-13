import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const sc = defineInstitution({
  id: "sc",
  code: "023",
  nameKo: "SC제일은행",
  nameEn: "SC First Bank",
  category: "bank",
  aliases: ["SC", "제일은행", "SC제일", "스탠다드차타드"],
  userBaseMillions: 2,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "10", category: "ordinary" }),
        defineSubject({ code: "20", category: "savings" }),
        defineSubject({ code: "30", category: "household-current" }),
      ],
    },
    {
      template: patternTemplate("XXX-XX-XXXXX-X"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directCredit", "additionalServices"),
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({
          code: "15",
          category: "ordinary",
          virtual: true,
          allowsWithdrawal: false,
          effectiveFrom: "2010-12-27",
          note: "수납전용",
        }),
      ],
    },
    {
      template: patternTemplate("XXX-XX-XXXXXXXXX"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directCredit", "additionalServices"),
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({
          code: "16",
          category: "ordinary",
          virtual: true,
          allowsWithdrawal: false,
          effectiveFrom: "2010-12-27",
          note: "비실명 가능",
        }),
      ],
    },
  ],
});
