import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const savingsBank = /* @__PURE__ */ defineInstitution({
  id: "savings-bank",
  code: "050",
  nameKo: "상호저축은행",
  nameEn: "Mutual Savings Bank",
  category: "non-bank",
  aliases: ["저축은행", "상호저축은행", "SBI저축", "OK저축", "웰컴저축"],
  userBaseMillions: 6,
  patterns: [
    {
      template: T("XXX-XX-XX-XXXXXX-X"),
      kind: "new",
      subjectPosition: { start: 5, length: 2 },
      subjects: [
        defineSubject({ code: "13", category: "ordinary" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "22", category: "free-savings" }),
        defineSubject({ code: "23", category: "corporate-free" }),
      ],
    },
  ],
});
