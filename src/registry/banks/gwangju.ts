import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const gwangju = /* @__PURE__ */ defineInstitution({
  id: "gwangju",
  code: "034",
  nameKo: "광주은행",
  nameEn: "Gwangju Bank",
  category: "bank",
  aliases: ["광주", "광주은행", "JB광주"],
  priority: 25,
  patterns: [
    {
      template: T("XXX-XXX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 3 },
      subjects: [
        defineSubject({ code: "107", category: "ordinary" }),
        defineSubject({ code: "108", category: "ordinary" }),
        defineSubject({ code: "109", category: "treasury" }),
        defineSubject({ code: "121", category: "savings" }),
        defineSubject({ code: "123", category: "savings" }),
        defineSubject({ code: "124", category: "savings" }),
        defineSubject({ code: "122", category: "free-savings" }),
        defineSubject({ code: "103", category: "household-current" }),
        defineSubject({ code: "101", category: "current" }),
        defineSubject({ code: "127", category: "corporate-free" }),
        defineSubject({
          code: "716",
          category: "isa",
          label: "ISA",
          allowsWithdrawal: false,
          note: "출금이체 불가",
        }),
      ],
    },
    {
      template: T("XXX-XXX-XXXXXX"),
      kind: "old",
      identifierPosition: { start: 3, length: 3 },
      identifiers: ["731"],
      subjectPosition: { start: 3, length: 3 },
      subjects: [
        defineSubject({
          code: "731",
          category: "linked",
          effectiveFrom: "2012-03-23",
        }),
      ],
      validatesCheckDigit: false,
      note: "체크디지트 검증 X",
    },
    {
      template: T("X-XXX-XXXXXXXX-X"),
      kind: "new",
      subjectPosition: { start: 1, length: 3 },
      subjects: [
        defineSubject({ code: "107", category: "ordinary" }),
        defineSubject({ code: "109", category: "ordinary" }),
        defineSubject({ code: "121", category: "savings" }),
        defineSubject({ code: "103", category: "household-current" }),
        defineSubject({ code: "101", category: "current" }),
        defineSubject({ code: "127", category: "corporate-free" }),
      ],
      effectiveFrom: "2016-11-07",
    },
  ],
});
