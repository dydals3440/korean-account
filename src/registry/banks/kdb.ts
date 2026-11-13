import { defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const kdb = defineInstitution({
  id: "kdb",
  code: "002",
  nameKo: "KDB산업은행",
  nameEn: "Korea Development Bank",
  category: "bank",
  aliases: ["산업은행", "KDB", "산은"],
  userBaseMillions: 0.5,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "13", category: "ordinary" }),
        defineSubject({ code: "20", category: "savings" }),
        defineSubject({ code: "19", category: "free-savings" }),
        defineSubject({ code: "11", category: "current" }),
        defineSubject({ code: "22", category: "corporate-free" }),
      ],
    },
    {
      template: patternTemplate("XXX-XXXXXXX-X-XXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["013", "020", "019", "011", "022"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "013", category: "ordinary" }),
        defineSubject({ code: "020", category: "savings" }),
        defineSubject({ code: "019", category: "free-savings" }),
        defineSubject({ code: "011", category: "current" }),
        defineSubject({ code: "022", category: "corporate-free" }),
      ],
    },
    {
      template: patternTemplate("XXX-XXXXXXXX-XXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["010", "036"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "010", category: "savings" }),
        defineSubject({
          code: "036",
          category: "installment",
          label: "정기적금",
          allowsWithdrawal: false,
        }),
      ],
    },
  ],
});
