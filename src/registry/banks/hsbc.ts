import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const hsbc = /* @__PURE__ */ defineInstitution({
  id: "hsbc",
  code: "054",
  nameKo: "HSBC은행",
  nameEn: "HSBC",
  category: "bank",
  aliases: ["HSBC"],
  priority: 5,
  patterns: [
    {
      template: T("XXX-XXXXX-X-XXX"),
      kind: "new",
      // No `subjects`, so no score bonus — but `matchedPattern` is public
      // output, so removing this would change what consumers observe. Keeps
      // the subject position from the PDF table as-is.
      subjectPosition: { start: 9, length: 3 },
      note: "서비스 미참가 — 메타데이터 only",
    },
  ],
});
