import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";
import { expandTwoDigitRange } from "../expand-range";

export const kyoboSec = /* @__PURE__ */ defineInstitution({
  id: "kyobo-sec",
  code: "261",
  nameKo: "교보증권",
  nameEn: "Kyobo Securities",
  category: "securities",
  aliases: ["교보증권"],
  priority: 25,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "35", category: "savings" }),
        defineSubject({ code: "51", category: "savings" }),
        defineSubject({ code: "53", category: "savings" }),
        defineSubject({ code: "54", category: "savings" }),
        ...expandTwoDigitRange(60, 69).map((code) => defineSubject({ code, category: "savings" })),
        defineSubject({ code: "71", category: "savings" }),
        defineSubject({ code: "80", category: "savings" }),
      ],
    },
    {
      template: T("XXXX-XXXX-X-X"),
      kind: "new",
      effectiveFrom: "2012-01-25",
    },
  ],
});
