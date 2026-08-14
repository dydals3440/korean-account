import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const miraeAsset = /* @__PURE__ */ defineInstitution({
  id: "mirae-asset",
  code: "238",
  aliasCodes: ["230"],
  nameKo: "미래에셋증권",
  nameEn: "Mirae Asset Securities",
  category: "securities",
  aliases: ["미래에셋", "미래에셋대우"],
  priority: 60,
  patterns: [
    { template: T("XXXXXXXX-XX"), kind: "new" },
    { template: T("XXXXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXXXX"), kind: "new", effectiveFrom: "2017-01-01" },
    { template: T("XXXXXXXXXXXXXX"), kind: "new" },
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "99", category: "ordinary" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "44", category: "savings" }),
        defineSubject({
          code: "46",
          category: "savings",
          allowsWithdrawal: false,
          note: "일부 출금이체 제외",
        }),
        defineSubject({ code: "51", category: "savings" }),
        defineSubject({ code: "77", category: "savings" }),
      ],
    },
  ],
});
