import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";
import { isNotHanaForeignLegacy14 } from "./hana-foreign-legacy";

// Uses bank code 081 in the CMS participant namespace — registered in the
// bank section. A separate institution from 270 Hana Securities (securities
// category).

export const hanaSecuritiesCma = /* @__PURE__ */ defineInstitution({
  id: "hana-securities-cma",
  code: "081",
  nameKo: "하나증권 CMA",
  nameEn: "Hana Securities CMA",
  category: "bank",
  aliases: ["하나증권 CMA", "하나증권CMA"],
  priority: 25,
  patterns: [
    // An identifier here would absorb valid Hana foreign-exchange 14d inputs
    // and break their match, so two additionalRules instead: (1) serial's
    // first digit fixed to "9" (per the PDF), (2) branch number not in Hana's
    // merged foreign-exchange prefix set → hana-cma score 8 vs
    // foreign-exchange score 7 → foreign-exchange wins.
    {
      template: T("XXX-XXXXXXXX-X-XX"),
      kind: "new",
      additionalRules: [(d) => d.length === 14 && d[3] === "9", isNotHanaForeignLegacy14],
      subjectPosition: { start: 12, length: 2 },
      subjects: [
        defineSubject({ code: "05", category: "ordinary" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
        defineSubject({
          code: "94",
          category: "ordinary",
          virtual: true,
          label: "증권가상",
        }),
        defineSubject({
          code: "37",
          category: "ordinary",
          virtual: true,
          label: "일반가상",
        }),
        defineSubject({ code: "60", category: "isa" }),
      ],
      note: "CMA 계좌만 가능, 평생계좌 자동이체 등록 불가",
    },
  ],
});
