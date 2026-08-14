import { patternTemplate as T } from "../../core/pattern-template";
import { suhyupCoop12BranchToBank } from "../rules";
import { defineInstitution } from "../../core/define-institution";

export const suhyupCoop = /* @__PURE__ */ defineInstitution({
  id: "suhyup-coop",
  code: "030",
  aliasCodes: ["069", "070"],
  nameKo: "수협중앙회",
  nameEn: "Suhyup Central",
  category: "non-bank",
  aliases: ["수협중앙회", "단위수협"],
  priority: 25,
  patterns: [
    // branchRule: first digit 2/7/9 stays with the central coop; otherwise routes to 007 Suhyup Bank.
    {
      template: T("X-XXXXXXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["2", "7", "9"],
      branchRule: suhyupCoop12BranchToBank,
      validatesCheckDigit: false,
      effectiveFrom: "2025-11-10",
    },
  ],
});
