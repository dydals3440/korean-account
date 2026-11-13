import { defineInstitution } from "../../core/define/define-institution";
import { patternTemplate as T } from "../../core/define/pattern-template";

export const eugeneInv = defineInstitution({
  id: "eugene-inv",
  code: "280",
  nameKo: "유진투자증권",
  nameEn: "Eugene Investment & Securities",
  category: "securities",
  aliases: ["유진투자", "유진투자증권"],
  userBaseMillions: 2.2,
  patterns: [{ template: T("XXXXXXXXXXX"), kind: "new" }],
});
