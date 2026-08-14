import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const imSec = /* @__PURE__ */ defineInstitution({
  id: "im-sec",
  code: "262",
  nameKo: "아이엠증권",
  nameEn: "iM Securities",
  category: "securities",
  aliases: ["아이엠증권", "iM증권", "IBK투자증권", "하이투자증권"],
  userBaseMillions: 2.8,
  successorOf: ["hi-investment-sec"],
  patterns: [
    {
      // PDF p.16: 일련번호(7)-검증번호(1)-과목코드(2) — the subject code sits
      // at the tail with the full 01~99 range and no per-code categories.
      template: T("XXXXXXX-X-XX"),
      kind: "new",
      // PDF p.16 puts 과목코드(2) 01~99 at the tail, but a full-range code
      // matches every input and carries zero selectivity — deliberately not
      // modeled as an identifier signal.
      note: "과목코드 01~99 (전 범위 — 식별 신호로 미사용)",
    },
  ],
});
