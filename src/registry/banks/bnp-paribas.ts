import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const bnpParibas = /* @__PURE__ */ defineInstitution({
  id: "bnp-paribas",
  code: "061",
  nameKo: "비엔피파리바은행",
  nameEn: "BNP Paribas",
  category: "bank",
  aliases: ["BNP", "BNP파리바"],
  priority: 5,
  patterns: [
    {
      template: T("XXXXX-XXXXXX-XXX"),
      kind: "new",
      effectiveFrom: "2019-01-21",
      note: "서비스 미참가",
    },
  ],
});
