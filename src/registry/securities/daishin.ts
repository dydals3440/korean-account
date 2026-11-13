import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const daishin = defineInstitution({
  id: "daishin",
  code: "267",
  nameKo: "대신증권",
  nameEn: "Daishin Securities",
  category: "securities",
  aliases: ["대신", "대신증권"],
  userBaseMillions: 4.6,
  patterns: [
    { template: patternTemplate("XXX-XXXXXX"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
    { template: patternTemplate("XXX-XXXXXX-XX"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
  ],
});
