import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const jeju = /* @__PURE__ */ defineInstitution({
  id: "jeju",
  code: "035",
  nameKo: "제주은행",
  nameEn: "Jeju Bank",
  category: "bank",
  aliases: ["제주"],
  userBaseMillions: 0.4,
  patterns: [
    {
      template: T("XX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 2, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "03", category: "free-savings" }),
        defineSubject({ code: "04", category: "household-current" }),
        defineSubject({ code: "05", category: "current" }),
        defineSubject({ code: "13", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXX-XXXXXX-XXX"),
      kind: "new",
      identifierRange: { from: 700, to: 779 },
      identifierPosition: { start: 0, length: 3 },
      subjectPosition: { start: 0, length: 3 },
      // PDF p.8 full enumeration: 700~706 / 770~779 / 769 / 711,712 / 713,714 / 707~709.
      subjects: [
        ...["700", "701", "702", "703", "704", "705", "706"].map((code) =>
          defineSubject({ code, category: "ordinary" }),
        ),
        ...["770", "771", "772", "773", "774", "775", "776", "777", "778", "779"].map((code) =>
          defineSubject({ code, category: "savings" }),
        ),
        defineSubject({ code: "769", category: "free-savings" }),
        defineSubject({ code: "711", category: "household-current" }),
        defineSubject({ code: "712", category: "household-current" }),
        defineSubject({ code: "713", category: "current" }),
        defineSubject({ code: "714", category: "current" }),
        defineSubject({ code: "707", category: "corporate-free" }),
        defineSubject({ code: "708", category: "corporate-free" }),
        defineSubject({ code: "709", category: "corporate-free" }),
      ],
      effectiveFrom: "2021-07-27",
    },
  ],
});
