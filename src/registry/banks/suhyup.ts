import { patternTemplate as T } from "../../core/pattern-template";
import { suhyup11BranchToCoop, suhyup12BranchToCoop, suhyup14BranchToCoop } from "../rules";
import { defineInstitution } from "../../core/define-institution";

export const suhyup = /* @__PURE__ */ defineInstitution({
  id: "suhyup",
  code: "007",
  aliasCodes: ["009"],
  nameKo: "수협은행",
  nameEn: "Suhyup Bank",
  category: "bank",
  aliases: ["수협"],
  priority: 30,
  patterns: [
    // branchRule: routes to 030 Suhyup federation when digits 4-5 are a branch code
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      branchRule: suhyup11BranchToCoop,
      validatesCheckDigit: false,
      note: "수협 분리 이후 과목코드/체크디지트 검증 안함",
    },
    // branchRule: routes to 030 Suhyup federation when the first digit is 2/7/9
    {
      template: T("XXX-XXXXXXXXX"),
      kind: "new",
      // No `identifiers`, so no score bonus. Still required — the public API
      // `extractIdentifier(digits, pattern)` reads this position.
      identifierPosition: { start: 0, length: 3 },
      branchRule: suhyup12BranchToCoop,
      validatesCheckDigit: false,
      effectiveFrom: "2025-11-10",
      note: "수협 분리 시행, 체크디지트 검증 안함",
    },
    // branchRule: routes to 030 Suhyup federation when digits 1-3 are 481~489/493
    {
      template: T("XXX-XXXXXXXXXXX"),
      kind: "virtual",
      branchRule: suhyup14BranchToCoop,
      validatesCheckDigit: false,
    },
  ],
});
