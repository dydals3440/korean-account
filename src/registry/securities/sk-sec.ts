import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const skSec = /* @__PURE__ */ defineInstitution({
  id: "sk-sec",
  code: "266",
  nameKo: "SK증권",
  nameEn: "SK Securities",
  category: "securities",
  aliases: ["SK증권"],
  priority: 30,
  patterns: [
    { template: T("XXXXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXX"), kind: "new" },
  ],
});
