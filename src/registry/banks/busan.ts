import { defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const busan = defineInstitution({
  id: "busan",
  code: "032",
  nameKo: "부산은행",
  nameEn: "Busan Bank",
  category: "bank",
  aliases: ["부산", "BNK부산"],
  userBaseMillions: 3.3,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({
          code: "11",
          category: "savings",
          label: "국민주청약 저축예금",
        }),
        defineSubject({ code: "12", category: "free-savings" }),
        defineSubject({ code: "03", category: "household-current" }),
        defineSubject({ code: "09", category: "current" }),
        defineSubject({ code: "13", category: "corporate-free" }),
      ],
    },
    {
      template: patternTemplate("XXX-XXXX-XXXXX-X"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["101", "102", "112", "103", "109", "113"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "101", category: "ordinary" }),
        defineSubject({ code: "102", category: "savings" }),
        defineSubject({ code: "112", category: "free-savings" }),
        defineSubject({ code: "103", category: "household-current" }),
        defineSubject({ code: "109", category: "current" }),
        defineSubject({ code: "113", category: "corporate-free" }),
      ],
      effectiveFrom: "2012-01-25",
    },
  ],
});
