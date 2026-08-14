import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const bookookSec = /* @__PURE__ */ defineInstitution({
  id: "bookook-sec",
  code: "290",
  nameKo: "부국증권",
  nameEn: "Bookook Securities",
  category: "securities",
  aliases: ["부국증권"],
  priority: 15,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "new",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "30", category: "savings" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "46", category: "savings" }),
        defineSubject({
          code: "33",
          category: "savings",
          allowsWithdrawal: false,
        }),
      ],
    },
  ],
});
