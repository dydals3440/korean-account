import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const samsungSec = /* @__PURE__ */ defineInstitution({
  id: "samsung-sec",
  code: "240",
  nameKo: "삼성증권",
  nameEn: "Samsung Securities",
  category: "securities",
  aliases: ["삼성증권"],
  priority: 60,
  patterns: [
    { template: T("XXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXX"), kind: "new", effectiveFrom: "2013-05-20" },
    { template: T("XXXXXXXXXXXX"), kind: "new", effectiveFrom: "2013-05-20" },
    {
      template: T("X-XXXXX-XXXXXXXX"),
      kind: "new",
      effectiveFrom: "2010-12-13",
    },
  ],
});
