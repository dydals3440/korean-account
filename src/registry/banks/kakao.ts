import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const kakao = /* @__PURE__ */ defineInstitution({
  id: "kakao",
  code: "090",
  nameKo: "카카오뱅크",
  nameEn: "KakaoBank",
  category: "bank",
  aliases: ["카카오", "카카오뱅크", "kakaobank"],
  userBaseMillions: 26.7,
  patterns: [
    // PDF: `business(1)-product(3)-serial(9)` = 13d. The PDF does not
    // enumerate prefixes; 3333 (personal) and 7979 (group account) are
    // real-world signals promoted from the augmentation catalog because every
    // consumer KakaoBank account carries them and no other 13-digit pattern
    // collides.
    {
      template: T("XXXX-XX-XXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["3333", "7979"],
      note: "3333·7979 프리픽스는 PDF 미열거 실세계 신호",
    },
  ],
});
