import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const deutsche = /* @__PURE__ */ defineInstitution({
  id: "deutsche",
  code: "055",
  nameKo: "도이치은행",
  nameEn: "Deutsche Bank",
  category: "bank",
  aliases: ["도이치"],
  priority: 5,
  patterns: [{ template: T("XXXXXXXXXX"), kind: "new" }],
});
