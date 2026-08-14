import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const forest = /* @__PURE__ */ defineInstitution({
  id: "forest",
  code: "064",
  nameKo: "산림조합중앙회",
  nameEn: "Forestry Cooperatives Central",
  category: "non-bank",
  aliases: ["산림조합", "산림"],
  priority: 10,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "12", category: "savings" }),
        defineSubject({ code: "13", category: "savings" }),
        defineSubject({ code: "14", category: "free-savings" }),
        defineSubject({ code: "15", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXXXX-XX-XXXXXX"),
      kind: "new",
      subjectPosition: { start: 5, length: 2 },
      subjects: [
        defineSubject({ code: "21", category: "ordinary" }),
        defineSubject({ code: "22", category: "savings" }),
        defineSubject({ code: "30", category: "savings" }),
        defineSubject({ code: "27", category: "free-savings" }),
        defineSubject({ code: "32", category: "corporate-free" }),
      ],
      effectiveFrom: "2009-11-09",
    },
  ],
});
