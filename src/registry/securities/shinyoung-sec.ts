import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const shinyoungSec = defineInstitution({
  id: "shinyoung-sec",
  code: "291",
  nameKo: "신영증권",
  nameEn: "Shinyoung Securities",
  category: "securities",
  aliases: ["신영증권"],
  userBaseMillions: 1.5,
  patterns: [
    { template: patternTemplate("XXXXXXXXX"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
    { template: patternTemplate("XXXXXXXXXXXX"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
  ],
});
