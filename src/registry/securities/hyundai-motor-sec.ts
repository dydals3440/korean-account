import { defineInstitution, patternTemplate } from "../../core/define";

export const hyundaiMotorSec = defineInstitution({
  id: "hyundai-motor-sec",
  code: "263",
  nameKo: "현대차증권",
  nameEn: "Hyundai Motor Securities",
  category: "securities",
  aliases: ["현대차증권", "HMC투자증권"],
  userBaseMillions: 2.6,
  patterns: [{ template: patternTemplate("XXXXXXXX"), kind: "new" }],
});
