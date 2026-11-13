import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const hyundaiMotorSec = defineInstitution({
  id: "hyundai-motor-sec",
  code: "263",
  nameKo: "현대차증권",
  nameEn: "Hyundai Motor Securities",
  category: "securities",
  aliases: ["현대차증권", "HMC투자증권", "현대차투자증권"],
  userBaseMillions: 2.6,
  patterns: [
    { template: patternTemplate("XXXXXXXX"), kind: "new", services: REGULAR_ACCOUNT_SERVICES },
  ],
});
