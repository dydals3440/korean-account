import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const kbSec = /* @__PURE__ */ defineInstitution({
  id: "kb-sec",
  code: "218",
  aliasCodes: ["226"],
  nameKo: "KB증권",
  nameEn: "KB Securities",
  category: "securities",
  aliases: ["KB증권", "현대증권"],
  priority: 60,
  successorOf: ["hyundai-sec"],
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "06", category: "savings" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "10", category: "savings" }),
        defineSubject({ code: "11", category: "savings" }),
        defineSubject({ code: "12", category: "savings" }),
        defineSubject({ code: "16", category: "savings" }),
        defineSubject({ code: "30", category: "savings" }),
        defineSubject({ code: "40", category: "savings" }),
        defineSubject({ code: "45", category: "savings" }),
        defineSubject({ code: "50", category: "savings" }),
        defineSubject({ code: "55", category: "savings" }),
        defineSubject({ code: "61", category: "savings" }),
        defineSubject({ code: "62", category: "savings" }),
        defineSubject({ code: "63", category: "savings" }),
        defineSubject({ code: "64", category: "savings" }),
        defineSubject({ code: "65", category: "savings" }),
        defineSubject({ code: "66", category: "savings" }),
        defineSubject({ code: "67", category: "savings" }),
        defineSubject({ code: "68", category: "savings" }),
        defineSubject({ code: "69", category: "savings" }),
      ],
    },
    { template: T("XXX-XXX-XX-XX"), kind: "new" },
    { template: T("XXX-XXX-XX"), kind: "new" },
  ],
});
