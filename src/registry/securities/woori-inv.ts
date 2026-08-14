import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const wooriInv = /* @__PURE__ */ defineInstitution({
  id: "woori-inv",
  code: "294",
  nameKo: "우리투자증권",
  nameEn: "Woori Investment & Securities",
  category: "securities",
  aliases: ["우리투자증권", "우리투자", "한국포스증권"],
  priority: 30,
  successorOf: ["korea-fos-sec"],
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "new",
      // No `subjects`, so no score bonus — but `matchedPattern` is public output,
      // and dropping this would change what consumers observe. Kept as in the PDF table.
      subjectPosition: { start: 3, length: 2 },
      effectiveFrom: "2019-12-20",
    },
  ],
});
