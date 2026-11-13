import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const dbSec = defineInstitution({
  id: "db-sec",
  code: "279",
  nameKo: "DB증권",
  nameEn: "DB Securities",
  category: "securities",
  aliases: ["DB증권", "DB금융투자", "동부증권"],
  userBaseMillions: 2,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2011-02-07",
    },
    {
      template: patternTemplate("XXX-XX-XXXX-XX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
    },
  ],
});
