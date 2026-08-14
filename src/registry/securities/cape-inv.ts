import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const capeInv = /* @__PURE__ */ defineInstitution({
  id: "cape-inv",
  code: "292",
  nameKo: "케이프투자증권",
  nameEn: "Cape Investment & Securities",
  category: "securities",
  aliases: ["케이프투자증권", "케이프", "LIG투자증권"],
  userBaseMillions: 0.8,
  successorOf: ["lig-investment"],
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "new",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
        // PDF p.21 changelog: 2021.12.27 중개형 ISA (24) added.
        defineSubject({
          code: "24",
          category: "isa",
          label: "중개형 ISA",
          effectiveFrom: "2021-12-27",
        }),
        defineSubject({ code: "33", category: "savings" }),
        defineSubject({ code: "55", category: "savings" }),
        defineSubject({ code: "75", category: "savings" }),
        defineSubject({ code: "76", category: "savings" }),
        defineSubject({ code: "77", category: "savings" }),
        defineSubject({ code: "78", category: "savings" }),
        defineSubject({ code: "88", category: "savings" }),
      ],
    },
    {
      template: T("XXX-XX-XXXXXX-XXX"),
      kind: "new",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({
          code: "87",
          category: "savings",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "88",
          category: "savings",
          allowsWithdrawal: false,
        }),
      ],
    },
  ],
});
