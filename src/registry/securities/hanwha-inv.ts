import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const hanwhaInv = /* @__PURE__ */ defineInstitution({
  id: "hanwha-inv",
  code: "269",
  nameKo: "한화투자증권",
  nameEn: "Hanwha Investment & Securities",
  category: "securities",
  aliases: ["한화투자증권", "한화투자"],
  userBaseMillions: 2.4,
  patterns: [
    { template: T("XXXXXXXXXX"), kind: "new", effectiveFrom: "2012-09-03" },
    { template: T("XXXXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXXXXXX"), kind: "new" },
  ],
});
