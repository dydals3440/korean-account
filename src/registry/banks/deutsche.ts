import { defineInstitution } from "../../core/define-institution";
import { patternTemplate as T } from "../../core/pattern-template";

export const deutsche = defineInstitution({
  id: "deutsche",
  code: "055",
  nameKo: "도이치은행",
  nameEn: "Deutsche Bank",
  category: "bank",
  aliases: ["도이치"],
  userBaseMillions: 0.01,
  patterns: [{ template: T("XXXXXXXXXX"), kind: "new" }],
});
