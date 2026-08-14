import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const sc = /* @__PURE__ */ defineInstitution({
  id: "sc",
  code: "023",
  nameKo: "SC제일은행",
  nameEn: "SC First Bank",
  category: "bank",
  aliases: ["SC", "제일은행", "SC제일", "스탠다드차타드"],
  priority: 25,
  patterns: [
    {
      template: T("XXX-XX-XXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "10", category: "ordinary" }),
        defineSubject({ code: "20", category: "savings" }),
        defineSubject({ code: "30", category: "household-current" }),
      ],
    },
    {
      template: T("XXX-XX-XXXXX"),
      kind: "virtual",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({
          code: "15",
          category: "ordinary",
          virtual: true,
          allowsWithdrawal: false,
          effectiveFrom: "2010-12-27",
          note: "수납전용",
        }),
      ],
    },
    {
      template: T("XXX-XX-XXXXXXXXX"),
      kind: "virtual",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({
          code: "16",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2010-12-27",
          note: "비실명 가능",
        }),
      ],
    },
  ],
});
