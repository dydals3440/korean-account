import { defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const gyeongnam = defineInstitution({
  id: "gyeongnam",
  code: "039",
  nameKo: "경남은행",
  nameEn: "Gyeongnam Bank",
  category: "bank",
  aliases: ["경남", "BNK경남"],
  userBaseMillions: 2,
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "07", category: "ordinary" }),
        defineSubject({ code: "09", category: "treasury" }),
        defineSubject({ code: "20", category: "other", label: "일일BEST" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "22", category: "free-savings" }),
        defineSubject({
          code: "32",
          category: "other",
          label: "기업BEST",
        }),
        defineSubject({ code: "03", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "35", category: "corporate-free" }),
      ],
    },
    {
      template: patternTemplate("XXX-XXXXXXXXX-X"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["207", "209", "220", "221", "222", "232", "203", "201", "235"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "207", category: "ordinary" }),
        defineSubject({ code: "209", category: "treasury" }),
        defineSubject({ code: "220", category: "other", label: "일일BEST" }),
        defineSubject({ code: "221", category: "savings" }),
        defineSubject({ code: "222", category: "free-savings" }),
        defineSubject({
          code: "232",
          category: "other",
          label: "기업BEST",
        }),
        defineSubject({ code: "203", category: "household-current" }),
        defineSubject({ code: "201", category: "current" }),
        defineSubject({ code: "235", category: "corporate-free" }),
      ],
      effectiveFrom: "2014-10-06",
    },
  ],
});
