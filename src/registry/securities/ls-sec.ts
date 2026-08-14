import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const lsSec = /* @__PURE__ */ defineInstitution({
  id: "ls-sec",
  code: "265",
  nameKo: "엘에스투자증권",
  nameEn: "LS Securities",
  category: "securities",
  aliases: ["엘에스투자증권", "LS투자증권", "이베스트투자증권", "이베스트"],
  priority: 25,
  successorOf: ["ebest-legacy"],
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "45", category: "savings" }),
        defineSubject({ code: "51", category: "savings" }),
        defineSubject({ code: "55", category: "savings" }),
        defineSubject({ code: "56", category: "savings" }),
        // Deposit-only: no withdrawal transfers
        ...["65", "77", "78"].map((code) =>
          defineSubject({
            code,
            category: "savings",
            allowsWithdrawal: false,
          }),
        ),
      ],
    },
    { template: T("XXXXXXXXX"), kind: "new", effectiveFrom: "2012-07-09" },
    { template: T("XXXXXXXXXXX"), kind: "new" },
  ],
});
