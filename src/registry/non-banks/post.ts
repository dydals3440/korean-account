import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";
import { expandTwoDigitRange } from "../expand-range";

export const post = /* @__PURE__ */ defineInstitution({
  id: "post",
  code: "071",
  aliasCodes: ["072", "073", "074", "075"],
  nameKo: "우체국",
  nameEn: "Korea Post",
  category: "non-bank",
  aliases: ["우체국", "Korea Post", "EPOST", "지식경제부 우체국"],
  userBaseMillions: 13,
  patterns: [
    {
      template: T("XXX-XXXXXXXX-X"),
      kind: "old",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["100", "530", "190", "110", "120"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "100", category: "ordinary" }),
        defineSubject({ code: "530", category: "ordinary" }),
        defineSubject({ code: "190", category: "treasury" }),
        defineSubject({ code: "110", category: "savings" }),
        defineSubject({ code: "120", category: "savings" }),
      ],
      // PDF p.21 changelog: added 2023.05.03 with the next-gen system.
      effectiveFrom: "2023-05-03",
    },
    // PDF p.11: regular 13d 지점번호(6)-일련번호(6)-검증번호(1). The virtual
    // 13d below stays distinguishable via its 8/9 leading identifier.
    {
      template: T("XXXXXX-XXXXXX-X"),
      kind: "old",
      note: "지점번호-일련번호-검증번호",
    },
    {
      template: T("X-XXXXXXXXXXX-X"),
      kind: "virtual",
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["8", "9"],
      // PDF p.21 changelog: added 2023.05.03 with the next-gen system.
      effectiveFrom: "2023-05-03",
    },
    {
      template: T("XXXXXX-XX-XXXXX-X"),
      kind: "new",
      subjectPosition: { start: 6, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({
          code: "97",
          category: "ordinary",
          effectiveFrom: "2023-05-03",
        }),
        defineSubject({ code: "03", category: "treasury" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "52", category: "savings" }),
        defineSubject({ code: "06", category: "free-savings" }),
      ],
    },
    // 14d incoming-only "other" — PDF lists: preferential savings (05), 31-33, 49, 40-48, 80-88.
    {
      template: T("XXXXXX-XX-XXXXX-X"),
      kind: "incoming-only",
      subjectPosition: { start: 6, length: 2 },
      subjects: [
        defineSubject({
          code: "05",
          category: "savings",
          label: "듬뿍우대저축",
          allowsWithdrawal: false,
        }),
        ...["31", "32", "33", "49"].map((code) =>
          defineSubject({ code, category: "other", allowsWithdrawal: false }),
        ),
        ...expandTwoDigitRange(40, 48).map((code) =>
          defineSubject({ code, category: "other", allowsWithdrawal: false }),
        ),
        ...expandTwoDigitRange(80, 88).map((code) =>
          defineSubject({ code, category: "other", allowsWithdrawal: false }),
        ),
      ],
    },
  ],
});
