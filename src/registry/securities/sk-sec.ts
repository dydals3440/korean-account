import { defineInstitution } from "../../core/define/define-institution";
import { patternTemplate as T } from "../../core/define/pattern-template";

export const skSec = defineInstitution({
  id: "sk-sec",
  code: "266",
  nameKo: "SK증권",
  nameEn: "SK Securities",
  category: "securities",
  aliases: ["SK증권"],
  userBaseMillions: 3.8,
  patterns: [
    { template: T("XXXXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXX"), kind: "new" },
  ],
});
