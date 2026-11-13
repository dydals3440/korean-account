import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const skSec = defineInstitution({
  id: "sk-sec",
  code: "266",
  nameKo: "SK증권",
  nameEn: "SK Securities",
  category: "securities",
  aliases: ["SK증권"],
  userBaseMillions: 3.8,
  patterns: [
    { template: patternTemplate("XXXXXXXXXXX"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
    { template: patternTemplate("XXXXXXXXX"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
  ],
});
