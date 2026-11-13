import { defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const hanaSec = defineInstitution({
  id: "hana-sec",
  code: "270",
  nameKo: "하나증권",
  nameEn: "Hana Securities",
  category: "securities",
  aliases: ["하나증권", "하나금융투자"],
  userBaseMillions: 4.8,
  successorOf: ["hana-fin-invest"],
  patterns: [
    { template: patternTemplate("XXXXXXX-X"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
    {
      template: patternTemplate("XXXXXXX-X-XX"),
      kind: "merged-legacy",
      services: REGULAR_ACCOUNT_SERVICES,
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
      template: patternTemplate("XXXXXXXX-XXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2016-11-21",
    },
    {
      template: patternTemplate("XXXXXXXX-XXX-XXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2016-11-21",
    },
  ],
});
