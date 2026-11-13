import { cmsServices, defineInstitution, patternTemplate } from "../../core/define";

export const kakao = defineInstitution({
  id: "kakao",
  code: "090",
  nameKo: "카카오뱅크",
  nameEn: "KakaoBank",
  category: "bank",
  aliases: ["카카오", "카카오뱅크", "kakaobank"],
  userBaseMillions: 26.7,
  patterns: [
    /** p.13 lists no product codes; 3333 (personal) and 7979 (모임통장) are documented augmentations. */
    {
      template: patternTemplate("XXXX-XX-XXXXXXX"),
      kind: "new",
      services: cmsServices("virtualAccount", "directDebit", "directCredit", "additionalServices"),
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["3333", "7979"],
      note: "3333·7979 프리픽스는 PDF 미열거 실세계 신호",
    },
  ],
});
