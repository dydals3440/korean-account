import { defineInstitution, defineSubject, patternTemplate } from "../../core/define";

export const bookookSec = defineInstitution({
  id: "bookook-sec",
  code: "290",
  nameKo: "부국증권",
  nameEn: "Bookook Securities",
  category: "securities",
  aliases: ["부국증권"],
  userBaseMillions: 0.7,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXXX"),
      kind: "new",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "30", category: "savings" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "46", category: "savings" }),
        defineSubject({
          code: "33",
          category: "savings",
          allowsWithdrawal: false,
        }),
      ],
    },
  ],
});
