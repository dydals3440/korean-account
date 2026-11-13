import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const kis = defineInstitution({
  id: "kis",
  code: "243",
  nameKo: "한국투자증권",
  nameEn: "Korea Investment & Securities",
  category: "securities",
  aliases: ["한국투자증권", "한투", "KIS"],
  userBaseMillions: 11,
  patterns: [
    { template: patternTemplate("XXXXXXXX-XX"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
    { template: patternTemplate("XXXXXXXX-XXXX"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
    {
      template: patternTemplate("XXXXXXXX-XX-XXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
    },
  ],
});
