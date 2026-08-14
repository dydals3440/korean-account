import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const kis = /* @__PURE__ */ defineInstitution({
  id: "kis",
  code: "243",
  nameKo: "한국투자증권",
  nameEn: "Korea Investment & Securities",
  category: "securities",
  aliases: ["한국투자증권", "한투", "KIS"],
  priority: 55,
  patterns: [
    { template: T("XXXXXXXX-XX"), kind: "new" },
    { template: T("XXXXXXXX-XXXX"), kind: "new" },
    { template: T("XXXXXXXX-XX-XXXX"), kind: "new" },
  ],
});
