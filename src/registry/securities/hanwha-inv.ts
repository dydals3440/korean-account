import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const hanwhaInv = defineInstitution({
  id: "hanwha-inv",
  code: "269",
  nameKo: "한화투자증권",
  nameEn: "Hanwha Investment & Securities",
  category: "securities",
  aliases: ["한화투자증권", "한화투자"],
  userBaseMillions: 2.4,
  patterns: [
    {
      template: patternTemplate("XXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2012-09-03",
    },
    {
      template: patternTemplate("XXXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2012-09-03",
    },
    {
      template: patternTemplate("XXXXXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2012-09-03",
    },
    {
      template: patternTemplate("XXXXXXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2012-09-03",
    },
  ],
});
