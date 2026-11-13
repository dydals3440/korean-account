import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { toss12First1719 } from "../branch-rules";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const toss = defineInstitution({
  id: "toss",
  code: "092",
  nameKo: "토스뱅크",
  nameEn: "Toss Bank",
  category: "bank",
  aliases: ["토스", "토스뱅크"],
  userBaseMillions: 13.8,
  patterns: [
    {
      template: patternTemplate("XXXX-XXXX-XXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["100", "150"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "100", category: "ordinary" }),
        defineSubject({ code: "150", category: "corporate-free" }),
      ],
      effectiveFrom: "2021-10-05",
    },
    /** p.13 17·19 + 일련번호(10): shares its prefix with Shinhyup 170–178, so both stay candidates. */
    {
      template: patternTemplate("XXXX-XXXX-XXXX"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directCredit"),
      identifierPosition: { start: 0, length: 2 },
      identifiers: ["17", "19"],
      subjectPosition: { start: 0, length: 2 },
      subjects: [
        defineSubject({ code: "17", category: "ordinary", virtual: true, allowsWithdrawal: false }),
        defineSubject({ code: "19", category: "ordinary", virtual: true, allowsWithdrawal: false }),
      ],
      branchRule: toss12First1719,
      effectiveFrom: "2023-08-01",
    },
  ],
});
