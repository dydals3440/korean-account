import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";
import { isHanaForeignLegacy14 } from "./hana-foreign-legacy";

export const hana = /* @__PURE__ */ defineInstitution({
  id: "hana",
  code: "005",
  // The KFTC standard bank code is 081 (after the KEB merger the standard
  // namespace keeps Hana's representative code).
  // In the CMS namespace, 081 is occupied by hanaSecuritiesCma — a separate institution.
  commonCode: "081",
  // 081 is excluded from CMS aliasCodes to avoid a code clash with hanaSecuritiesCma.
  aliasCodes: ["025", "033", "080", "082"],
  nameKo: "하나은행",
  nameEn: "Hana Bank",
  category: "bank",
  aliases: ["하나", "KEB하나", "하나은행", "외환은행"],
  priority: 80,
  successorOf: ["keb-foreign-exchange"],
  patterns: [
    {
      template: T("XXX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "13", category: "ordinary" }),
        defineSubject({ code: "33", category: "ordinary" }),
        defineSubject({ code: "18", category: "savings" }),
        defineSubject({ code: "38", category: "savings" }),
        defineSubject({ code: "19", category: "free-savings" }),
        defineSubject({ code: "39", category: "free-savings" }),
        defineSubject({ code: "26", category: "household-current" }),
        defineSubject({ code: "11", category: "current" }),
        defineSubject({ code: "22", category: "corporate-free" }),
        // Deposit-only (withdrawal transfers cannot be registered)
        ...["15", "23", "24", "29", "70", "73", "74", "75", "77"].map((code) =>
          defineSubject({
            code,
            category: "other",
            label: "입금전용",
            allowsWithdrawal: false,
          }),
        ),
      ],
      note: "평생계좌 자동이체 등록 불가",
    },
    {
      template: T("XXX-XXXXXX-XXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["611", "620", "600", "601", "630", "621", "631", "610"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "611", category: "ordinary" }),
        defineSubject({ code: "610", category: "treasury" }),
        defineSubject({ code: "620", category: "savings" }),
        defineSubject({ code: "600", category: "household-current" }),
        defineSubject({ code: "601", category: "current" }),
        defineSubject({ code: "630", category: "corporate-free" }),
        defineSubject({ code: "621", category: "yes" }),
        defineSubject({ code: "631", category: "yes" }),
      ],
      effectiveFrom: "2009-06-15",
    },
    {
      template: T("XXX-XXXXXX-XXXXX"),
      kind: "merged-legacy",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["117", "158", "161", "162", "210", "379", "600", "655"],
      // Score boost on prefix match — avoids ties with weaker matches like hana-securities-cma.
      additionalRules: [isHanaForeignLegacy14],
      note: "구 외환 통합 신상품 prefix",
    },
  ],
});
