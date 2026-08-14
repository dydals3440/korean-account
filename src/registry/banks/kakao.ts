import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const kakao = /* @__PURE__ */ defineInstitution({
  id: "kakao",
  code: "090",
  nameKo: "카카오뱅크",
  nameEn: "KakaoBank",
  category: "bank",
  aliases: ["카카오", "카카오뱅크", "kakaobank"],
  priority: 90,
  patterns: [
    // PDF: `business(1)-product(3)-serial(9)` = 13d. Identifying prefixes are
    // not enumerated.
    {
      template: T("XXXX-XX-XXXXXXX"),
      kind: "new",
    },
  ],
});
