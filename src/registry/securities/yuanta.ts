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
  priority: 35,
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
      template: T("XXXX-XXXX-XXX"),
      kind: "new",
      effectiveFrom: "2011-01-03",
    },
  ],
});
