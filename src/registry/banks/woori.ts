import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const woori = /* @__PURE__ */ defineInstitution({
  id: "woori",
  code: "020",
  aliasCodes: ["022", "024", "083", "084"],
  nameKo: "우리은행",
  nameEn: "Woori Bank",
  category: "bank",
  aliases: ["우리"],
  userBaseMillions: 19,
  successorOf: ["sangup", "hanil", "pyunghwa"],
  patterns: [
    {
      template: T("XXXX-XXX-XXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["1002", "1005", "1006"],
      subjectPosition: { start: 1, length: 3 },
      subjects: [
        defineSubject({ code: "006", category: "ordinary" }),
        defineSubject({ code: "007", category: "treasury" }),
        defineSubject({ code: "002", category: "savings" }),
        defineSubject({ code: "004", category: "household-current" }),
        defineSubject({ code: "003", category: "current" }),
        defineSubject({ code: "005", category: "corporate-free" }),
      ],
    },
    // PDF p.5: 14 digits = branch(3)-customer(5)-check1(1)-subject(2)-serial(2)-check2(1).
    // The printed box glyphs omit the check1 box; the digit-count column (14) is authoritative.
    {
      template: T("XXX-XXXXX-X-XX-XX-X"),
      kind: "new",
      subjectPosition: { start: 9, length: 2 },
      subjects: [
        defineSubject({ code: "18", category: "linked", virtual: true }),
        defineSubject({ code: "92", category: "linked", virtual: true }),
      ],
    },
    {
      template: T("XXX-XX-XXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "05", category: "ordinary" }),
        defineSubject({ code: "06", category: "savings" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
      ],
      note: "(구)상업",
    },
    {
      template: T("XXX-XXXXXX-XX-XX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 9, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "15", category: "treasury" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "12", category: "free-savings" }),
        defineSubject({ code: "04", category: "household-current" }),
        defineSubject({ code: "03", category: "current" }),
        defineSubject({ code: "13", category: "corporate-free" }),
      ],
      note: "(구)한일은행",
    },
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "24", category: "free-savings" }),
        defineSubject({ code: "05", category: "household-current" }),
        defineSubject({ code: "04", category: "current" }),
        defineSubject({ code: "25", category: "corporate-free" }),
        defineSubject({
          code: "09",
          category: "linked",
          allowsWithdrawal: false,
          note: "신규 신청 불가",
        }),
      ],
      note: "(구)평화은행",
    },
  ],
});
