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
  userBaseMillions: 3.6,
  successorOf: ["im-investment-sec"],
  patterns: [
    {
      template: T("XXXX-XXXX-XX"),
      kind: "old",
      subjectPosition: { start: 8, length: 2 },
      // PDF p.18: only 15/16 allow withdrawal transfer (×○○○); every other
      // era-1 code is deposit-only (××○○) or fully service-excluded (××××).
      subjects: [
        defineSubject({ code: "11", category: "ordinary", allowsWithdrawal: false }),
        defineSubject({ code: "15", category: "savings" }),
        defineSubject({ code: "16", category: "savings" }),
        defineSubject({ code: "21", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "22", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "23", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "31", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "61", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "62", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "63", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "64", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "65", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "66", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "41", category: "household-current", allowsWithdrawal: false }),
        defineSubject({ code: "42", category: "household-current", allowsWithdrawal: false }),
        defineSubject({ code: "71", category: "current", allowsWithdrawal: false }),
        defineSubject({ code: "99", category: "corporate-free", allowsWithdrawal: false }),
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
