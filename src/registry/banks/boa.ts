import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const boa = /* @__PURE__ */ defineInstitution({
  id: "boa",
  code: "060",
  nameKo: "BOA은행",
  nameEn: "Bank of America",
  category: "bank",
  aliases: ["BOA", "Bank of America"],
  userBaseMillions: 0.01,
  patterns: [
    {
      template: T("XXXX-XXXXX-XX-X"),
      kind: "new",
      effectiveFrom: "2012-07-16",
    },
    {
      template: T("XXXX-XXXXXXXXXX"),
      kind: "incoming-only",
      note: "조회·입금 전용 (PDF: 출금이체 ×)",
    },
  ],
});
