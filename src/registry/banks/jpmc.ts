import { defineInstitution } from "../../core/define/define-institution";
import { patternTemplate as T } from "../../core/define/pattern-template";

export const jpmc = defineInstitution({
  id: "jpmc",
  code: "057",
  nameKo: "JP모간체이스은행",
  nameEn: "JPMorgan Chase Bank",
  category: "bank",
  aliases: ["JPM", "JP모간", "JPMorgan", "체이스"],
  userBaseMillions: 0.01,
  patterns: [{ template: T("XXXXXXXXXX"), kind: "new" }],
});
