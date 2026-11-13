import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { isNotHanaForeignLegacy14 } from "./hana-foreign-legacy";

// CMS lists this CMA under bank code 081, separate from Hana Securities (270).

export const hanaSecuritiesCma = defineInstitution({
  id: "hana-securities-cma",
  code: "081",
  nameKo: "하나증권 CMA",
  nameEn: "Hana Securities CMA",
  category: "bank",
  aliases: ["하나증권 CMA", "하나증권CMA"],
  userBaseMillions: 1,
  patterns: [
    /** Rules instead of identifiers keep Hana's merged foreign-exchange 14d prefixes winning. */
    {
      template: patternTemplate("XXX-XXXXXXXX-X-XX"),
      kind: "new",
      services: cmsServices("virtualAccount", "directDebit", "directCredit", "additionalServices"),
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
          category: "linked",
          virtual: true,
          label: "증권가상",
        }),
        defineSubject({
          code: "37",
          services: { directDebit: false, additionalServices: false },
          category: "ordinary",
          virtual: true,
          allowsWithdrawal: false,
          label: "일반가상",
        }),
        defineSubject({
          code: "60",
          services: { directDebit: false },
          category: "isa",
          allowsWithdrawal: false,
        }),
      ],
      note: "CMA 계좌만 가능, 평생계좌 자동이체 등록 불가",
    },
  ],
});
