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
  userBaseMillions: 13,
  patterns: [
    // PDF p.15: plain-serial lengths 8-10 and 12-14. New registration was cut
    // to 12 digits only from 2017-01-01, but accounts registered earlier persist.
    { template: T("XXXXXXXX"), kind: "old", note: "2016.12.31 이전 등록분" },
    { template: T("XXXXXXXXX"), kind: "old", note: "2016.12.31 이전 등록분" },
    { template: T("XXXXXXXX-XX"), kind: "new" },
    { template: T("XXXXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXXXX"), kind: "new", effectiveFrom: "2017-01-01" },
    { template: T("XXXXXXXXXXXXX"), kind: "old", note: "2016.12.31 이전 등록분" },
    { template: T("XXXXXXXXXXXXXX"), kind: "new" },
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "99", category: "ordinary" }),
        // PDF p.15 marks 31/44/51 as deposit-only (출금이체 ×).
        defineSubject({ code: "31", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "44", category: "savings", allowsWithdrawal: false }),
        defineSubject({
          code: "46",
          category: "savings",
          note: "장기주택마련저축·연금·개인연금 계좌는 출금이체 제외",
        }),
        defineSubject({ code: "51", category: "savings", allowsWithdrawal: false }),
        defineSubject({ code: "77", category: "savings" }),
      ],
    },
    // PDF p.15: 12d coded legacy 점번호(3)-과목코드(2)-일련번호(7), registration
    // limited to accounts opened by 2016-12-31. Coexists with the plain 12d above.
    {
      template: T("XXX-XX-XXXXXXX"),
      kind: "old",
      note: "2016.12.31 이전 등록에 한함",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        // Withdrawal-allowed group (×○○○).
        ...["20", "21", "22", "33", "39", "51", "58"].map((code) =>
          defineSubject({ code, category: "other" }),
        ),
        // Deposit-only group (××○○).
        ...["05", "15", "34", "37", "60", "62", "63", "90", "91"].map((code) =>
          defineSubject({ code, category: "other", allowsWithdrawal: false }),
        ),
        defineSubject({ code: "92", category: "isa", allowsWithdrawal: false }),
      ],
    },
  ],
});
