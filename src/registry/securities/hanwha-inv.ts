import { defineInstitution, patternTemplate } from "../../core/define";

export const hanwhaInv = defineInstitution({
  id: "hanwha-inv",
  code: "269",
  nameKo: "한화투자증권",
  nameEn: "Hanwha Investment & Securities",
  category: "securities",
  aliases: ["한화투자증권", "한화투자"],
  userBaseMillions: 2.4,
  patterns: [
    { template: patternTemplate("XXXXXXXXXX"), kind: "new", effectiveFrom: "2012-09-03" },
    { template: patternTemplate("XXXXXXXXXXX"), kind: "new" },
    { template: patternTemplate("XXXXXXXXXXXXX"), kind: "new" },
    { template: patternTemplate("XXXXXXXXXXXXXX"), kind: "new" },
  ],
});
