import { defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const shinhanInv = defineInstitution({
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
      template: patternTemplate("XXX-XX-XXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
      ],
      note: "과목 01·11은 2017.09.04 삭제(PDF p.18·20), 과거 계좌 매칭용으로 유지",
    },
  ],
});
