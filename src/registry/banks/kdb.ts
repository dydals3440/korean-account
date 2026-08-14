import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const kdb = /* @__PURE__ */ defineInstitution({
  id: "kdb",
  code: "002",
  nameKo: "KDB산업은행",
  nameEn: "Korea Development Bank",
  category: "bank",
  aliases: ["산업은행", "KDB", "산은"],
  userBaseMillions: 0.5,
  patterns: [
    {
      template: T("XXX-XX-XXXXX-X"),
      kind: "old",
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
      template: T("XXX-XXXXXXX-X-XXX"),
      kind: "new",
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
    // PDF p.1: the 010 row is ×○○○ (withdrawal transfer available); only
    // 036 (정기적금) is deposit-only per the 비고.
    {
      template: T("XXX-XXXXXXXX-XXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["010", "036"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "010", category: "treasury" }),
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
