import { cmsServices, defineInstitution, patternTemplate } from "../../core/define";

export const jpmc = defineInstitution({
  id: "jpmc",
  code: "057",
  nameKo: "JP모간체이스은행",
  nameEn: "JPMorgan Chase Bank",
  category: "bank",
  aliases: ["JPM", "JP모간", "JPMorgan", "체이스"],
  userBaseMillions: 0.01,
  patterns: [
    {
      template: patternTemplate("XXXXXXXXXX"),
      kind: "new",
      services: cmsServices("directDebit", "directCredit"),
      effectiveFrom: "2009-06-29",
    },
  ],
});
