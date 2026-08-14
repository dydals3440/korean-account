import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const kakaopaySec = /* @__PURE__ */ defineInstitution({
  id: "kakaopay-sec",
  code: "288",
  nameKo: "카카오페이증권",
  nameEn: "KakaoPay Securities",
  category: "securities",
  aliases: ["카카오페이증권", "카카오페이"],
  priority: 50,
  patterns: [{ template: T("XXXXXXXXXXX"), kind: "new", effectiveFrom: "2021-12-16" }],
});
