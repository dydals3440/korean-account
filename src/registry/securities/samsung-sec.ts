import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const samsungSec = defineInstitution({
  id: "samsung-sec",
  code: "240",
  nameKo: "삼성증권",
  nameEn: "Samsung Securities",
  category: "securities",
  aliases: ["삼성증권"],
  userBaseMillions: 12.5,
  patterns: [
    { template: patternTemplate("XXXXXXXX"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
    {
      template: patternTemplate("XXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2013-05-20",
    },
    {
      template: patternTemplate("XXXXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2013-05-20",
    },
    {
      template: patternTemplate("X-XXXXX-XXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2010-12-13",
    },
  ],
});
