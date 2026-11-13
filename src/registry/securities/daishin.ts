import { defineInstitution } from "../../core/define-institution";
import { patternTemplate as T } from "../../core/pattern-template";

export const daishin = defineInstitution({
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
