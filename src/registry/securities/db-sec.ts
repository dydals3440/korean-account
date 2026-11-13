import { defineInstitution } from "../../core/define/define-institution";
import { patternTemplate as T } from "../../core/define/pattern-template";

export const dbSec = defineInstitution({
  id: "db-sec",
  code: "279",
  nameKo: "DB증권",
  nameEn: "DB Securities",
  category: "securities",
  aliases: ["DB증권", "DB금융투자", "동부증권"],
  userBaseMillions: 2,
  patterns: [
    { template: T("XXX-XX-XXXX"), kind: "new" },
    {
      template: T("XXX-XX-XXXX-XX"),
      kind: "new",
      // No `subjects`, so no score bonus — but `matchedPattern` is public output,
      // and dropping this would change what consumers observe. Kept as in the PDF table.
      subjectPosition: { start: 3, length: 2 },
    },
  ],
});
