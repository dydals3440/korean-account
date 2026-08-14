import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";
import { isNotHanaForeignLegacy14 } from "./hana-foreign-legacy";

export const imBank = /* @__PURE__ */ defineInstitution({
  id: "im-bank",
  code: "031",
  nameKo: "iM뱅크",
  nameEn: "iM Bank",
  category: "bank",
  aliases: ["대구은행", "iM뱅크", "iM", "DGB", "iM bank"],
  priority: 40,
  patterns: [
    {
      template: T("XX-XXXXXXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 2 },
      identifiers: ["91", "92", "93", "94", "96"],
      subjectPosition: { start: 0, length: 2 },
      subjects: [
        defineSubject({ code: "91", category: "ordinary" }),
        defineSubject({ code: "92", category: "ordinary" }),
        defineSubject({ code: "93", category: "ordinary" }),
        defineSubject({ code: "94", category: "ordinary" }),
        defineSubject({ code: "96", category: "ordinary" }),
      ],
    },
    // Deposit-only 3-digit prefixes such as 524 (재형) cannot map onto this
    // pattern's 2-digit subject position.
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "05", category: "ordinary" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
        // Deposit-only (withdrawal transfers cannot be registered)
        defineSubject({
          code: "19",
          category: "installment",
          label: "근로자우대",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "20",
          category: "savings",
          label: "비과세장기",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "21",
          category: "installment",
          label: "가계우대정기적금",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "25",
          category: "installment",
          label: "상호부금",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "27",
          category: "savings",
          label: "평생저축",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "28",
          category: "installment",
          label: "장기주택마련",
          allowsWithdrawal: false,
        }),
      ],
    },
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["505", "508", "502", "501", "504"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "505", category: "ordinary" }),
        defineSubject({ code: "508", category: "savings" }),
        defineSubject({ code: "502", category: "household-current" }),
        defineSubject({ code: "501", category: "current" }),
        defineSubject({ code: "504", category: "corporate-free" }),
      ],
    },
    // Branch-number ranges are unpublished, so no identifiers; subject matching
    // alone keeps confidence at medium.
    // Avoids prefix collisions with Hana's merged foreign-exchange 14d —
    // HANA_FOREIGN_LEGACY_PREFIXES excluded.
    {
      template: T("XXX-XX-XXXXXX-XXX"),
      kind: "new",
      subjectPosition: { start: 3, length: 2 },
      additionalRules: [isNotHanaForeignLegacy14],
      subjects: [
        defineSubject({ code: "05", category: "ordinary" }),
        defineSubject({ code: "91", category: "ordinary" }),
        defineSubject({ code: "92", category: "ordinary" }),
        defineSubject({ code: "93", category: "ordinary" }),
        defineSubject({ code: "94", category: "ordinary" }),
        defineSubject({ code: "96", category: "ordinary" }),
        defineSubject({ code: "06", category: "savings" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXX-XXXXXXXXXX-X"),
      kind: "virtual",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["937", "938", "999"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({
          code: "937",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2023-08-01",
        }),
        defineSubject({
          code: "938",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2026-03-24",
        }),
        defineSubject({
          code: "999",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2026-03-24",
        }),
      ],
    },
  ],
});
