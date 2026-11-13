import { cmsServices, defineInstitution, patternTemplate } from "../../core/define";
import { suhyup11BranchToCoop, suhyup12BranchToCoop, suhyup14BranchToCoop } from "../branch-rules";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const suhyup = defineInstitution({
  id: "suhyup",
  code: "007",
  aliasCodes: ["009"],
  nameKo: "수협은행",
  nameEn: "Suhyup Bank",
  category: "bank",
  aliases: ["수협"],
  userBaseMillions: 1.5,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXXX"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      branchRule: suhyup11BranchToCoop,
      validatesCheckDigit: false,
      note: "수협 분리 이후 과목코드/체크디지트 검증 안함",
    },
    {
      template: patternTemplate("XXX-XXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      /** Kept for `extractIdentifier`; p.3 enumerates no codes, so it never scores. */
      identifierPosition: { start: 0, length: 3 },
      branchRule: suhyup12BranchToCoop,
      validatesCheckDigit: false,
      note: "수협 분리 시행, 체크디지트 검증 안함",
    },
    {
      template: patternTemplate("XXX-XXXXXXXXXXX"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directCredit"),
      branchRule: suhyup14BranchToCoop,
      validatesCheckDigit: false,
    },
  ],
});
