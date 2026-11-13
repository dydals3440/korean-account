import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const imSec = defineInstitution({
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
      template: patternTemplate("XXXXXXX-X-XX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      /** p.16 과목코드 01~99 spans every value, so it identifies nothing and is not modeled. */
      note: "과목코드 01~99 (전 범위 — 식별 신호로 미사용)",
    },
  ],
});
