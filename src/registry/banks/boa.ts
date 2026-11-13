import { defineInstitution, patternTemplate } from "../../core/define";

export const boa = defineInstitution({
  id: "boa",
  code: "060",
  nameKo: "BOA은행",
  nameEn: "Bank of America",
  category: "bank",
  aliases: ["BOA", "Bank of America"],
  userBaseMillions: 0.01,
  patterns: [
    {
      template: patternTemplate("XXXX-XXXXX-XX-X"),
      kind: "new",
      effectiveFrom: "2012-07-16",
    },
    {
      template: patternTemplate("XXXX-XXXXXXXXXX"),
      kind: "incoming-only",
      note: "조회·입금 전용 (PDF: 출금이체 ×)",
    },
  ],
});
