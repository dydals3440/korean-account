import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const daishin = /* @__PURE__ */ defineInstitution({
  id: "daishin",
  code: "267",
  nameKo: "대신증권",
  nameEn: "Daishin Securities",
  category: "securities",
  aliases: ["대신", "대신증권"],
  userBaseMillions: 4.6,
  patterns: [
    { template: T("XXX-XXXXXX"), kind: "new" },
    { template: T("XXX-XXXXXX-XX"), kind: "new" },
  ],
});
