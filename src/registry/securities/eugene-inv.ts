import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const eugeneInv = /* @__PURE__ */ defineInstitution({
  id: "eugene-inv",
  code: "280",
  nameKo: "유진투자증권",
  nameEn: "Eugene Investment & Securities",
  category: "securities",
  aliases: ["유진투자", "유진투자증권"],
  userBaseMillions: 2.2,
  patterns: [{ template: T("XXXXXXXXXXX"), kind: "new" }],
});
