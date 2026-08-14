import { patternTemplate as T } from "../../core/pattern-template";
import { defineSubject } from "../../core/subjects";
import { defineInstitution } from "../../core/define-institution";

export const kiwoom = /* @__PURE__ */ defineInstitution({
  id: "kiwoom",
  code: "264",
  nameKo: "키움증권",
  nameEn: "Kiwoom Securities",
  category: "securities",
  aliases: ["키움", "키움증권"],
  priority: 65,
  patterns: [
    {
      template: T("XXXX-XXXX-XX"),
      kind: "new",
      subjectPosition: { start: 8, length: 2 },
      subjects: [
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "41", category: "savings" }),
        defineSubject({
          code: "50",
          category: "isa",
          allowsWithdrawal: false,
          label: "ISA",
        }),
        defineSubject({
          code: "51",
          category: "isa",
          allowsWithdrawal: false,
          label: "ISA",
        }),
        defineSubject({
          code: "52",
          category: "isa",
          allowsWithdrawal: false,
          label: "ISA",
        }),
        defineSubject({
          code: "53",
          category: "isa",
          allowsWithdrawal: false,
          label: "ISA",
        }),
        defineSubject({
          code: "54",
          category: "isa",
          allowsWithdrawal: false,
          label: "ISA",
        }),
        defineSubject({
          code: "55",
          category: "isa",
          allowsWithdrawal: false,
          label: "ISA",
        }),
        defineSubject({
          code: "56",
          category: "isa",
          allowsWithdrawal: false,
          label: "ISA",
        }),
        defineSubject({
          code: "57",
          category: "isa",
          allowsWithdrawal: false,
          label: "ISA",
        }),
        defineSubject({
          code: "58",
          category: "isa",
          allowsWithdrawal: false,
          label: "ISA",
        }),
        defineSubject({
          code: "59",
          category: "isa",
          allowsWithdrawal: false,
          label: "ISA",
        }),
        defineSubject({ code: "61", category: "savings" }),
        defineSubject({ code: "71", category: "savings" }),
        defineSubject({ code: "72", category: "savings" }),
        defineSubject({ code: "74", category: "savings" }),
        defineSubject({ code: "98", category: "other" }),
      ],
    },
    { template: T("XXXXXXXX"), kind: "new" },
  ],
});
