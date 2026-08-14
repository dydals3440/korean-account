import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const meritz = /* @__PURE__ */ defineInstitution({
  id: "meritz",
  code: "287",
  aliasCodes: ["268"],
  nameKo: "메리츠증권",
  nameEn: "Meritz Securities",
  category: "securities",
  aliases: ["메리츠", "메리츠증권", "아이엠투자증권"],
  priority: 30,
  successorOf: ["im-investment-sec"],
  patterns: [
    {
      template: T("XXXX-XXXX-XX"),
      kind: "old",
      subjectPosition: { start: 8, length: 2 },
      subjects: [
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "15", category: "savings" }),
        defineSubject({ code: "16", category: "savings" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "22", category: "savings" }),
        defineSubject({ code: "23", category: "savings" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "61", category: "savings" }),
        defineSubject({ code: "62", category: "savings" }),
        defineSubject({ code: "63", category: "savings" }),
        defineSubject({ code: "64", category: "savings" }),
        defineSubject({ code: "65", category: "savings" }),
        defineSubject({ code: "66", category: "savings" }),
        defineSubject({ code: "41", category: "household-current" }),
        defineSubject({ code: "42", category: "household-current" }),
        defineSubject({ code: "71", category: "current" }),
        defineSubject({ code: "99", category: "corporate-free" }),
      ],
      effectiveFrom: "2009-09-24",
    },
    {
      template: T("XXXX-XXXX-XX"),
      kind: "new",
      effectiveFrom: "2012-07-26",
      note: "00 사용 불가",
    },
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "88", category: "savings" }),
        defineSubject({ code: "53", category: "savings" }),
        defineSubject({ code: "54", category: "savings" }),
        defineSubject({
          code: "21",
          category: "savings",
          allowsWithdrawal: false,
        }),
      ],
    },
  ],
});
