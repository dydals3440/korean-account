import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const kfcc = /* @__PURE__ */ defineInstitution({
  id: "kfcc",
  code: "045",
  aliasCodes: ["046", "085", "086", "087"],
  nameKo: "새마을금고중앙회",
  nameEn: "Korean Federation of Community Credit Cooperatives",
  category: "non-bank",
  aliases: ["새마을금고", "새마을", "MG", "MG새마을금고"],
  userBaseMillions: 17,
  patterns: [
    {
      template: T("XXXX-XX-XXXXXX-X"),
      kind: "old",
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({ code: "09", category: "ordinary" }),
        defineSubject({ code: "10", category: "ordinary" }),
        defineSubject({ code: "13", category: "ordinary" }),
      ],
    },
    {
      template: T("XXXX-XX-XXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 4 },
      // PDF p.9: "9" + 과목(3) with 002~004, 005, plus virtual account 037 —
      // no 001 row exists.
      identifiers: ["9002", "9003", "9004", "9005", "9037"],
      subjectPosition: { start: 1, length: 3 },
      subjects: [
        defineSubject({ code: "002", category: "ordinary" }),
        defineSubject({ code: "003", category: "ordinary" }),
        defineSubject({ code: "004", category: "ordinary" }),
        defineSubject({ code: "005", category: "corporate-free" }),
        defineSubject({
          code: "037",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2009-09-21",
        }),
      ],
    },
    // 13d new savings (incoming only) — PDF marks X (no withdrawal transfer).
    {
      template: T("XXXX-XX-XXXXXXX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["9206", "9207", "9210"],
      subjectPosition: { start: 1, length: 3 },
      subjects: ["206", "207", "210"].map((code) =>
        defineSubject({ code, category: "savings", allowsWithdrawal: false }),
      ),
    },
    // 13d new installment savings (incoming only) — PDF: other, deposit only.
    {
      template: T("XXXX-XX-XXXXXXX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["9200", "9202", "9205", "9208", "9209", "9212"],
      subjectPosition: { start: 1, length: 3 },
      subjects: ["200", "202", "205", "208", "209", "212"].map((code) =>
        defineSubject({
          code,
          category: "installment",
          allowsWithdrawal: false,
        }),
      ),
    },
  ],
});
