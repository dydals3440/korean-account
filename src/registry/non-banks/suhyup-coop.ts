import { defineInstitution, patternTemplate } from "../../core/define";
import { suhyupCoop12BranchToBank } from "../branch-rules";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const suhyupCoop = defineInstitution({
  id: "suhyup-coop",
  code: "030",
  aliasCodes: ["069", "070"],
  nameKo: "수협중앙회",
  nameEn: "Suhyup Central",
  category: "non-bank",
  aliases: ["수협중앙회", "단위수협"],
  priority: 25,
  patterns: [
    {
      template: patternTemplate("X-XXXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["2", "7", "9"],
      branchRule: suhyupCoop12BranchToBank,
      validatesCheckDigit: false,
      effectiveFrom: "2025-11-10",
    },
  ],
});
