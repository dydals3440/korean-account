import { cmsServices, defineInstitution, patternTemplate } from "../../core/define";

export const deutsche = defineInstitution({
  id: "deutsche",
  code: "055",
  nameKo: "도이치은행",
  nameEn: "Deutsche Bank",
  category: "bank",
  aliases: ["도이치"],
  userBaseMillions: 0.01,
  patterns: [
    {
      template: patternTemplate("XXXXXXXXXX"),
      kind: "new",
      services: cmsServices("virtualAccount", "directDebit", "directCredit"),
      effectiveFrom: "2017-03-20",
      note: "과목코드 삭제, 일련번호(가상계좌 포함)",
    },
  ],
});
