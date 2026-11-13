import { defineInstitution, patternTemplate } from "../../core/define";

export const shinyoungSec = defineInstitution({
  id: "shinyoung-sec",
  code: "291",
  nameKo: "신영증권",
  nameEn: "Shinyoung Securities",
  category: "securities",
  aliases: ["신영증권"],
  userBaseMillions: 1.5,
  patterns: [
    { template: patternTemplate("XXXXXXXXX"), kind: "new" },
    { template: patternTemplate("XXXXXXXXXXXX"), kind: "new" },
  ],
});
