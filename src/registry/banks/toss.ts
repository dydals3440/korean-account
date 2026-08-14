import { patternTemplate as T } from "../../core/pattern-template";
import { toss12First1719 } from "../rules";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const toss = /* @__PURE__ */ defineInstitution({
  id: "toss",
  code: "092",
  nameKo: "토스뱅크",
  nameEn: "Toss Bank",
  category: "bank",
  aliases: ["토스", "토스뱅크"],
  priority: 75,
  patterns: [
    // PDF: `subject(3)-serial(8)-check(1)`. ordinary: 100 / corporate-free: 150.
    {
      template: T("XXXX-XXXX-XXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["100", "150"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "100", category: "ordinary" }),
        defineSubject({ code: "150", category: "corporate-free" }),
      ],
      effectiveFrom: "2021-10-05",
    },
    // PDF: "17 or 19 + serial(10)" virtual accounts. The prefix overlaps
    // Shinhyup's 12d installment (170~178), so subjects are enumerated too to
    // force a score tie, letting priority (Toss 75 > Shinhyup 40) rank Toss
    // first.
    {
      template: T("XXXX-XXXX-XXXX"),
      kind: "virtual",
      identifierPosition: { start: 0, length: 2 },
      identifiers: ["17", "19"],
      subjectPosition: { start: 0, length: 2 },
      subjects: [
        defineSubject({ code: "17", category: "ordinary", virtual: true }),
        defineSubject({ code: "19", category: "ordinary", virtual: true }),
      ],
      branchRule: toss12First1719,
      effectiveFrom: "2023-08-01",
    },
  ],
});
