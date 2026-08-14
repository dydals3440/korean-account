import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const shinyoungSec = /* @__PURE__ */ defineInstitution({
  id: "shinyoung-sec",
  code: "291",
  nameKo: "신영증권",
  nameEn: "Shinyoung Securities",
  category: "securities",
  aliases: ["신영증권"],
  priority: 20,
  patterns: [
    { template: T("XXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXXXX"), kind: "new" },
  ],
});
