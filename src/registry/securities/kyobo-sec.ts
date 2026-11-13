import { defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";
import { expandTwoDigitRange } from "../expand-range";

export const kyoboSec = defineInstitution({
  id: "kyobo-sec",
  code: "261",
  nameKo: "교보증권",
  nameEn: "Kyobo Securities",
  category: "securities",
  aliases: ["교보증권"],
  userBaseMillions: 3,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXXX"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      additionalRules: [(digits) => digits[0] === "0"],
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
      /** p.16 일련(4)-일련(4)-검증(1)-일련(2); the last box is drawn once but holds two digits. */
      template: patternTemplate("XXXX-XXXX-X-XX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      additionalRules: [(digits) => digits[0] !== "0"],
      effectiveFrom: "2012-01-25",
    },
  ],
});
