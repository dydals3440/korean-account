import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const imSec = /* @__PURE__ */ defineInstitution({
  id: "im-sec",
  code: "262",
  nameKo: "아이엠증권",
  nameEn: "iM Securities",
  category: "securities",
  aliases: ["아이엠증권", "iM증권", "IBK투자증권", "하이투자증권"],
  priority: 25,
  successorOf: ["hi-investment-sec"],
  patterns: [
    {
      template: T("XXXXXXX-X-XX"),
      kind: "new",
      subjectPosition: { start: 8, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "99", category: "ordinary" }),
      ],
    },
  ],
});
