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
  userBaseMillions: 18,
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
        // Deposit-only 3-digit codes (PDF p.2 비고) — 3-digit twins of the
        // 2-digit deposit-only set (15/23/24/29/70/73/74/75/77) on the 11d pattern.
        defineSubject({
          code: "810",
          category: "installment",
          label: "정기적금",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "811",
          category: "installment",
          label: "자유적립식적금",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "817",
          category: "installment",
          label: "부금",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "818",
          category: "installment",
          label: "부금",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "814",
          category: "savings",
          label: "근로자우대저축",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "815",
          category: "savings",
          label: "장기주택마련저축",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "704",
          category: "trust",
          label: "기업금전신탁",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "705",
          category: "trust",
          label: "가계금전신탁",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "707",
          category: "trust",
          label: "노후연금신탁",
          allowsWithdrawal: false,
        }),
        ...["700", "703", "710", "711", "712", "713", "714", "715", "716"].map((code) =>
          defineSubject({
            code,
            category: "trust",
            label: "신탁기타",
            allowsWithdrawal: false,
          }),
        ),
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
