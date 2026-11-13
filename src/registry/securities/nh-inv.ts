import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const nhInv = defineInstitution({
  id: "nh-inv",
  code: "247",
  aliasCodes: ["289"],
  nameKo: "NH투자증권",
  nameEn: "NH Investment & Securities",
  category: "securities",
  aliases: ["NH투자", "NH투자증권", "우리투자증권"],
  userBaseMillions: 10.5,
  successorOf: ["wooriinvest-legacy", "nh-nonghyup-sec"],
  patterns: [
    {
      template: patternTemplate("XXXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2009-08-04",
    },
  ],
});
