import { defineInstitution } from "../../core/define/define-institution";
import { patternTemplate as T } from "../../core/define/pattern-template";

export const kis = defineInstitution({
  id: "kis",
  code: "243",
  nameKo: "한국투자증권",
  nameEn: "Korea Investment & Securities",
  category: "securities",
  aliases: ["한국투자증권", "한투", "KIS"],
  userBaseMillions: 11,
  patterns: [
    { template: T("XXXXXXXX-XX"), kind: "new" },
    { template: T("XXXXXXXX-XXXX"), kind: "new" },
    { template: T("XXXXXXXX-XX-XXXX"), kind: "new" },
  ],
});
