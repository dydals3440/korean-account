import { defineInstitution, patternTemplate } from "../../core/define";

export const skSec = defineInstitution({
  id: "sk-sec",
  code: "266",
  nameKo: "SK증권",
  nameEn: "SK Securities",
  category: "securities",
  aliases: ["SK증권"],
  userBaseMillions: 3.8,
  patterns: [
    { template: patternTemplate("XXXXXXXXXXX"), kind: "new" },
    { template: patternTemplate("XXXXXXXXX"), kind: "new" },
  ],
});
