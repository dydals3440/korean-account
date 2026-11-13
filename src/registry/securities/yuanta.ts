import { defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const yuanta = defineInstitution({
  id: "yuanta",
  code: "209",
  nameKo: "유안타증권",
  nameEn: "Yuanta Securities",
  category: "securities",
  aliases: ["유안타", "동양증권"],
  userBaseMillions: 5,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXXX"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
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
      template: patternTemplate("XXXX-XXXX-XXX-X"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2011-01-03",
    },
  ],
});
