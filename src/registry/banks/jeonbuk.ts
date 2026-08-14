import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const jeonbuk = /* @__PURE__ */ defineInstitution({
  id: "jeonbuk",
  code: "037",
  nameKo: "전북은행",
  nameEn: "Jeonbuk Bank",
  category: "bank",
  aliases: ["전북", "JB전북"],
  priority: 20,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "02", category: "ordinary" }),
        defineSubject({ code: "13", category: "ordinary" }),
        defineSubject({ code: "15", category: "treasury" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "22", category: "savings" }),
        defineSubject({ code: "35", category: "savings" }),
        defineSubject({ code: "37", category: "savings" }),
        defineSubject({ code: "03", category: "household-current" }),
        defineSubject({ code: "12", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "11", category: "current" }),
        defineSubject({ code: "23", category: "corporate-free" }),
        defineSubject({ code: "36", category: "corporate-free" }),
      ],
    },
    {
      template: T("X-XXX-XX-XXXXXX-X"),
      kind: "new",
      identifierPosition: { start: 1, length: 3 },
      identifiers: ["013", "021", "012", "011", "023"],
      subjectPosition: { start: 1, length: 3 },
      subjects: [
        defineSubject({ code: "013", category: "ordinary" }),
        defineSubject({ code: "021", category: "savings" }),
        defineSubject({ code: "012", category: "household-current" }),
        defineSubject({ code: "011", category: "current" }),
        defineSubject({ code: "023", category: "corporate-free" }),
      ],
      effectiveFrom: "2013-09-16",
    },
  ],
});
