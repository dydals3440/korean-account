import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const ibk = /* @__PURE__ */ defineInstitution({
  id: "ibk",
  code: "003",
  aliasCodes: ["043"],
  nameKo: "IBK기업은행",
  nameEn: "Industrial Bank of Korea",
  category: "bank",
  aliases: ["IBK", "기업은행", "기업"],
  priority: 60,
  patterns: [
    {
      template: T("XXXXXXXX-XX"),
      kind: "lifetime",
      note: "자동이체 신규등록 중단 (2012.11.12)",
    },
    {
      template: T("XXX-XXXXXXXX"),
      kind: "lifetime",
    },
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "03", category: "savings" }),
        defineSubject({ code: "13", category: "savings" }),
        defineSubject({ code: "07", category: "household-current" }),
        defineSubject({ code: "06", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
      ],
    },
    // The 14d subject set is identical to the 12d legacy set.
    {
      template: T("XXX-XXXXXX-XX-XX-X"),
      kind: "new",
      identifierPosition: { start: 9, length: 2 },
      identifiers: ["01", "02", "03", "04", "06", "07", "13"],
      subjectPosition: { start: 9, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "03", category: "savings" }),
        defineSubject({ code: "13", category: "savings" }),
        defineSubject({ code: "07", category: "household-current" }),
        defineSubject({ code: "06", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
      ],
    },
  ],
});
