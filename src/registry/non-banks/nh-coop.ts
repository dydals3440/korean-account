import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

const nhCoopSubjectsNew = [
  /* @__PURE__ */ defineSubject({ code: "351", category: "ordinary" }),
  /* @__PURE__ */ defineSubject({ code: "352", category: "savings" }),
  /* @__PURE__ */ defineSubject({ code: "356", category: "free-savings" }),
  /* @__PURE__ */ defineSubject({ code: "355", category: "corporate-free" }),
];

export const nhCoop = /* @__PURE__ */ defineInstitution({
  id: "nh-coop",
  code: "012",
  aliasCodes: ["013", "014", "015", "017", "018"],
  nameKo: "농협중앙회",
  nameEn: "NongHyup Central",
  category: "non-bank",
  aliases: ["농협중앙회", "지역농협", "단위농협", "농축협", "축협"],
  priority: 70,
  patterns: [
    {
      template: T("XXX-XXXX-XXXX-XX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["351", "352", "356", "355"],
      subjectPosition: { start: 0, length: 3 },
      subjects: nhCoopSubjectsNew,
      effectiveFrom: "2009-01-28",
    },
    // 13d next-gen installment savings (incoming only) — 5 codes listed in the PDF.
    {
      template: T("XXX-XXXX-XXXX-XX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["354", "360", "384", "394", "398"],
      subjectPosition: { start: 0, length: 3 },
      subjects: ["354", "360", "384", "394", "398"].map((code) =>
        defineSubject({
          code,
          category: "installment",
          allowsWithdrawal: false,
        }),
      ),
    },
    // 13d next-gen trust (incoming only) — PDF lists 028.
    {
      template: T("XXX-XXXX-XXXX-XX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["028"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({
          code: "028",
          category: "trust",
          allowsWithdrawal: false,
        }),
      ],
    },
    {
      template: T("XXXXXX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 6, length: 2 },
      subjects: [
        defineSubject({ code: "51", category: "ordinary" }),
        defineSubject({ code: "52", category: "savings" }),
        defineSubject({ code: "56", category: "free-savings" }),
        defineSubject({ code: "55", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXXXXX-XX-XXXXX-X"),
      kind: "virtual",
      subjectPosition: { start: 6, length: 2 },
      subjects: [
        defineSubject({ code: "66", category: "ordinary", virtual: true }),
        defineSubject({ code: "67", category: "ordinary", virtual: true }),
      ],
      effectiveFrom: "2007-11-27",
      note: "구가상계좌",
    },
    {
      template: T("XXX-XXXX-XXXX-XX-X"),
      kind: "virtual",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["792"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({
          code: "792",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2009-01-28",
        }),
      ],
    },
  ],
});
