import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const hanaSec = /* @__PURE__ */ defineInstitution({
  id: "hana-sec",
  code: "270",
  nameKo: "하나증권",
  nameEn: "Hana Securities",
  category: "securities",
  aliases: ["하나증권", "하나금융투자"],
  userBaseMillions: 4.8,
  successorOf: ["hana-fin-invest"],
  patterns: [
    { template: T("XXXXXXX-X"), kind: "new" },
    {
      template: T("XXXXXXX-X-XX"),
      kind: "merged-legacy",
      subjectPosition: { start: 8, length: 2 },
      subjects: [
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "22", category: "savings" }),
        defineSubject({ code: "23", category: "savings" }),
        defineSubject({ code: "26", category: "savings" }),
        defineSubject({ code: "30", category: "savings" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "51", category: "savings" }),
        defineSubject({ code: "61", category: "savings" }),
        defineSubject({ code: "69", category: "savings" }),
        defineSubject({ code: "80", category: "savings" }),
      ],
    },
    {
      template: T("XXXXXXXX-XXX"),
      kind: "new",
      effectiveFrom: "2016-11-21",
    },
    {
      template: T("XXXXXXXX-XXX-XXX"),
      kind: "new",
      effectiveFrom: "2016-11-21",
    },
  ],
});
