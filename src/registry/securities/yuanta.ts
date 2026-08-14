import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const yuanta = /* @__PURE__ */ defineInstitution({
  id: "yuanta",
  code: "209",
  nameKo: "유안타증권",
  nameEn: "Yuanta Securities",
  category: "securities",
  aliases: ["유안타", "동양증권"],
  userBaseMillions: 5,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "06", category: "savings" }),
        defineSubject({ code: "53", category: "savings" }),
        defineSubject({ code: "71", category: "savings" }),
        defineSubject({ code: "76", category: "savings" }),
      ],
    },
    {
      // PDF p.14: 고객지정번호(8)-랜덤부여(3)-검증번호(1) = 12 digits; the
      // printed boxes omit the trailing check-digit.
      template: T("XXXX-XXXX-XXX-X"),
      kind: "new",
      effectiveFrom: "2011-01-03",
    },
  ],
});
