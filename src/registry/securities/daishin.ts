import { defineInstitution, patternTemplate } from "../../core/define";

export const daishin = defineInstitution({
  id: "daishin",
  code: "267",
  nameKo: "대신증권",
  nameEn: "Daishin Securities",
  category: "securities",
  aliases: ["대신", "대신증권"],
  userBaseMillions: 4.6,
  patterns: [
    { template: patternTemplate("XXX-XXXXXX"), kind: "new" },
    { template: patternTemplate("XXX-XXXXXX-XX"), kind: "new" },
  ],
});
