import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const shinhanInv = /* @__PURE__ */ defineInstitution({
  id: "shinhan-inv",
  code: "278",
  nameKo: "신한투자증권",
  nameEn: "Shinhan Securities",
  category: "securities",
  aliases: ["신한투자", "신한투자증권", "신한금융투자"],
  userBaseMillions: 9,
  successorOf: ["shinhan-fin-invest"],
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "new",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
      ],
      note: "01·11 종합계좌는 2017.09.04 이후 신규 발급 중단, 기존 계좌만 매칭",
    },
  ],
});
