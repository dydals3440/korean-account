import { defineInstitution, patternTemplate } from "../../core/define";

export const samsungSec = defineInstitution({
  id: "samsung-sec",
  code: "240",
  nameKo: "삼성증권",
  nameEn: "Samsung Securities",
  category: "securities",
  aliases: ["삼성증권"],
  userBaseMillions: 12.5,
  patterns: [
    { template: patternTemplate("XXXXXXXX"), kind: "new" },
    { template: patternTemplate("XXXXXXXXXX"), kind: "new", effectiveFrom: "2013-05-20" },
    { template: patternTemplate("XXXXXXXXXXXX"), kind: "new", effectiveFrom: "2013-05-20" },
    {
      template: patternTemplate("X-XXXXX-XXXXXXXX"),
      kind: "new",
      effectiveFrom: "2010-12-13",
    },
  ],
});
