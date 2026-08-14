import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const busan = /* @__PURE__ */ defineInstitution({
  id: "busan",
  code: "032",
  nameKo: "부산은행",
  nameEn: "Busan Bank",
  category: "bank",
  aliases: ["부산", "BNK부산"],
  priority: 40,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "old",
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
      // The PDF row header says 13 digits but draws only 12 boxes (check digit
      // omitted) — normalized to 13 digits.
      template: T("XXX-XXXX-XXXXX-X"),
      kind: "new",
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
