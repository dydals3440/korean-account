import { defineInstitution } from "../../core/define/define-institution";
import { patternTemplate as T } from "../../core/define/pattern-template";

export const kakaopaySec = defineInstitution({
  id: "kakaopay-sec",
  code: "288",
  nameKo: "카카오페이증권",
  nameEn: "KakaoPay Securities",
  category: "securities",
  aliases: ["카카오페이증권", "카카오페이"],
  userBaseMillions: 8.6,
  patterns: [{ template: T("XXXXXXXXXXX"), kind: "new", effectiveFrom: "2021-12-16" }],
});
