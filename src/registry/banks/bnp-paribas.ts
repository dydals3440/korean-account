import { cmsServices, defineInstitution, patternTemplate } from "../../core/define";

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
      template: patternTemplate("XXXXX-XXXXXX-XXX"),
      kind: "new",
      services: cmsServices("directDebit", "directCredit"),
      effectiveFrom: "2019-01-21",
      note: "서비스 미참가",
    },
  ],
});
