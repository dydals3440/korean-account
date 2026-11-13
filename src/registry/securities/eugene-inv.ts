import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const eugeneInv = defineInstitution({
  id: "eugene-inv",
  code: "280",
  nameKo: "유진투자증권",
  nameEn: "Eugene Investment & Securities",
  category: "securities",
  aliases: ["유진투자", "유진투자증권"],
  userBaseMillions: 2.2,
  patterns: [
    {
      template: patternTemplate("XXXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2014-04-07",
    },
  ],
});
