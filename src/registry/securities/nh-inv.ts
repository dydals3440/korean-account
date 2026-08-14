import { patternTemplate as T } from "../../core/pattern-template";
import { defineInstitution } from "../../core/define-institution";

export const nhInv = /* @__PURE__ */ defineInstitution({
  id: "nh-inv",
  code: "247",
  aliasCodes: ["289"],
  nameKo: "NH투자증권",
  nameEn: "NH Investment & Securities",
  category: "securities",
  aliases: ["NH투자", "NH투자증권", "우리투자증권"],
  priority: 55,
  successorOf: ["wooriinvest-legacy", "nh-nonghyup-sec"],
  patterns: [{ template: T("XXXXXXXXXXX"), kind: "new", effectiveFrom: "2009-08-04" }],
});
