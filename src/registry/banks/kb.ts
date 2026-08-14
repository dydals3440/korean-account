import { patternTemplate as T } from "../../core/pattern-template";
import { kb11FirstDigit } from "../rules";
import { defineSubject } from "../../core/subjects";
import type { Subject } from "../../types";
import { defineInstitution } from "../../core/define-institution";

const kbSubjectsOld12: Subject[] = [
  defineSubject({ code: "01", category: "ordinary" }),
  defineSubject({ code: "21", category: "savings" }),
  defineSubject({ code: "24", category: "free-savings" }),
  defineSubject({ code: "05", category: "household-current" }),
  defineSubject({ code: "04", category: "current" }),
  defineSubject({ code: "25", category: "corporate-free" }),
  defineSubject({ code: "26", category: "yes" }),
];

export const kb = /* @__PURE__ */ defineInstitution({
  id: "kb",
  code: "004",
  aliasCodes: ["006", "019", "029", "078", "079"],
  nameKo: "KB국민은행",
  nameEn: "KB Kookmin Bank",
  category: "bank",
  aliases: ["국민", "국민은행", "KB", "KB국민"],
  userBaseMillions: 32,
  patterns: [
    {
      template: T("XXX-XXX-XXXX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["0"],
      note: "고객지정/핸드폰 입금 전용",
    },
    // 11d: branchRule forks the kind by first digit (0 = incoming-only, 9 = lifetime).
    {
      template: T("XXX-XXXX-XXXX"),
      kind: "new",
      branchRule: kb11FirstDigit,
      additionalRules: [(d) => d.length === 11 && (d[0] === "0" || d[0] === "9")],
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["0", "9"],
      note: "11자리: 0=입금전용, 9=평생계좌",
    },
    {
      template: T("XXX-XX-XXXX-XX-X"),
      kind: "old",
      identifierPosition: { start: 3, length: 2 },
      identifiers: ["01", "21", "24", "05", "04", "25", "26"],
      subjectPosition: { start: 3, length: 2 },
      subjects: kbSubjectsOld12,
    },
    {
      template: T("XXXX-XX-XXXXXXX-X"),
      kind: "virtual",
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({
          code: "92",
          category: "ordinary",
          virtual: true,
          allowsWithdrawal: false,
          effectiveFrom: "2010-08-26",
          note: "수납전용 비실명 가상계좌",
        }),
      ],
    },
    {
      template: T("XXXX-XX-XXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({ code: "06", category: "household-current" }),
        defineSubject({ code: "18", category: "current" }),
      ],
      note: "(구)주택 12자리, 연계예금(90) CMS 계약 업체만",
    },
    {
      template: T("XXXX-XX-XXXXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "25", category: "free-savings" }),
        defineSubject({ code: "37", category: "corporate-free" }),
        defineSubject({
          code: "90",
          category: "linked",
          allowsWithdrawal: false,
        }),
      ],
      note: "(구)주택 14자리",
    },
  ],
});
