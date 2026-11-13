import { defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const forest = defineInstitution({
  id: "forest",
  code: "064",
  nameKo: "산림조합중앙회",
  nameEn: "Forestry Cooperatives Central",
  category: "non-bank",
  aliases: ["산림조합", "산림"],
  userBaseMillions: 0.6,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2009-11-09",
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
      template: patternTemplate("XXXXX-XX-XXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
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
