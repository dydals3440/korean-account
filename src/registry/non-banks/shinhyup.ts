import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const shinhyup = /* @__PURE__ */ defineInstitution({
  id: "shinhyup",
  code: "048",
  aliasCodes: ["047", "049"],
  nameKo: "신협중앙회",
  nameEn: "Credit Union Central",
  category: "non-bank",
  aliases: ["신협", "신용협동조합", "CU"],
  userBaseMillions: 12,
  patterns: [
    { template: T("XXX-XXX-XXXX"), kind: "new" },
    { template: T("XXX-XXXX-XXXX"), kind: "new" },
    {
      template: T("XXX-XXX-XXXXX-X"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: [
        "110",
        "131",
        "132",
        "134",
        "137",
        "138",
        "142",
        "144",
        "145",
        "731",
        "177",
        "133",
        "136",
        "135",
        // Virtual-account prefix in the same 12d scheme (PDF p.9).
        "910",
      ],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "110", category: "ordinary" }),
        defineSubject({ code: "131", category: "ordinary" }),
        defineSubject({ code: "132", category: "ordinary" }),
        defineSubject({ code: "134", category: "ordinary" }),
        defineSubject({ code: "137", category: "ordinary" }),
        defineSubject({
          code: "138",
          category: "ordinary",
          effectiveFrom: "2015-10-05",
        }),
        defineSubject({
          code: "142",
          category: "ordinary",
          effectiveFrom: "2024-12-31",
        }),
        defineSubject({
          code: "144",
          category: "ordinary",
          effectiveFrom: "2025-12-22",
        }),
        defineSubject({
          code: "145",
          category: "ordinary",
          effectiveFrom: "2026-02-23",
        }),
        defineSubject({ code: "731", category: "ordinary" }),
        defineSubject({ code: "177", category: "savings" }),
        defineSubject({ code: "133", category: "free-savings" }),
        defineSubject({ code: "136", category: "free-savings" }),
        defineSubject({ code: "135", category: "corporate-free" }),
        defineSubject({
          code: "910",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2011-02-28",
        }),
      ],
    },
    // 12d installment savings (incoming only) — 6 codes listed in the PDF.
    {
      template: T("XXX-XXX-XXXXX-X"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["170", "171", "172", "173", "174", "178"],
      subjectPosition: { start: 0, length: 3 },
      subjects: ["170", "171", "172", "173", "174", "178"].map((code) =>
        defineSubject({
          code,
          category: "installment",
          allowsWithdrawal: false,
        }),
      ),
    },
    {
      template: T("XXXXX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 5, length: 2 },
      subjects: [
        defineSubject({ code: "12", category: "ordinary" }),
        defineSubject({ code: "13", category: "ordinary" }),
      ],
    },
    {
      template: T("XXXXX-XX-XXXXXX-X"),
      kind: "old",
      subjectPosition: { start: 5, length: 2 },
      // PDF p.9 marks 14 as deposit-only (××○×).
      subjects: [defineSubject({ code: "14", category: "ordinary", allowsWithdrawal: false })],
    },
  ],
});
