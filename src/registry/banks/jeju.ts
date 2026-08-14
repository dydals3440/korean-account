import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const jeju = /* @__PURE__ */ defineInstitution({
  id: "jeju",
  code: "035",
  nameKo: "제주은행",
  nameEn: "Jeju Bank",
  category: "bank",
  aliases: ["제주"],
  priority: 15,
  patterns: [
    {
      template: T("XX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 2, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "03", category: "free-savings" }),
        defineSubject({ code: "04", category: "household-current" }),
        defineSubject({ code: "05", category: "current" }),
        defineSubject({ code: "13", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXX-XXXXXX-XXX"),
      kind: "new",
      identifierRange: { from: 700, to: 779 },
      identifierPosition: { start: 0, length: 3 },
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "700", category: "ordinary" }),
        defineSubject({ code: "701", category: "ordinary" }),
        defineSubject({ code: "702", category: "ordinary" }),
        defineSubject({ code: "770", category: "savings" }),
        defineSubject({ code: "769", category: "free-savings" }),
        defineSubject({ code: "711", category: "household-current" }),
        defineSubject({ code: "713", category: "current" }),
        defineSubject({ code: "707", category: "corporate-free" }),
      ],
      effectiveFrom: "2021-07-27",
    },
  ],
});
