import { defineInstitution, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const wooriInv = defineInstitution({
  id: "woori-inv",
  code: "294",
  nameKo: "우리투자증권",
  nameEn: "Woori Investment & Securities",
  category: "securities",
  aliases: ["우리투자증권", "우리투자", "한국포스증권"],
  userBaseMillions: 4,
  successorOf: ["korea-fos-sec"],
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      effectiveFrom: "2019-12-20",
    },
  ],
});
