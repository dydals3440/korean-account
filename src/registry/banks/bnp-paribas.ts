import { defineInstitution } from "../../core/define/define-institution";
import { patternTemplate as T } from "../../core/define/pattern-template";

export const bnpParibas = defineInstitution({
  id: "bnp-paribas",
  code: "061",
  nameKo: "비엔피파리바은행",
  nameEn: "BNP Paribas",
  category: "bank",
  aliases: ["BNP", "BNP파리바"],
  userBaseMillions: 0.01,
  patterns: [
    {
      template: T("XXXXX-XXXXXX-XXX"),
      kind: "new",
      effectiveFrom: "2019-01-21",
      note: "서비스 미참가",
    },
  ],
});
