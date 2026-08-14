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
  userBaseMillions: 12,
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
    // PDF p.14: 일련번호(8)-검증번호(1)-일련번호(2) = 11 digits; the printed
    // boxes omit the check-digit between the two serial runs.
    { template: T("XXX-XXX-XX-X-XX"), kind: "new" },
    // PDF p.14: 일련번호(8)-검증번호(1) = 9 digits; the printed boxes omit
    // the trailing check-digit.
    { template: T("XXX-XXX-XX-X"), kind: "new" },
  ],
});
