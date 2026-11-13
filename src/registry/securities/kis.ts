import { defineInstitution, patternTemplate } from "../../core/define";

export const kis = defineInstitution({
  id: "kis",
  code: "243",
  nameKo: "한국투자증권",
  nameEn: "Korea Investment & Securities",
  category: "securities",
  aliases: ["한국투자증권", "한투", "KIS"],
  userBaseMillions: 11,
  patterns: [
    { template: patternTemplate("XXXXXXXX-XX"), kind: "new" },
    { template: patternTemplate("XXXXXXXX-XXXX"), kind: "new" },
    { template: patternTemplate("XXXXXXXX-XX-XXXX"), kind: "new" },
  ],
});
