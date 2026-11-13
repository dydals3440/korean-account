import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";
import { expandTwoDigitRange } from "../expand-range";

export const post = defineInstitution({
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
      template: patternTemplate("XXX-XXXXXXXX-X"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
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
      effectiveFrom: "2023-05-03",
    },
    {
      template: patternTemplate("XXXXXX-XXXXXX-X"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      note: "지점번호-일련번호-검증번호",
    },
    {
      template: patternTemplate("X-XXXXXXXXXXX-X"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directCredit"),
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["8", "9"],
      effectiveFrom: "2023-05-03",
    },
    {
      template: patternTemplate("XXXXXX-XX-XXXXX-X"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
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
        defineSubject({ code: "05", category: "savings", label: "듬뿍우대저축예금" }),
        ...["31", "32", "33", "49"].map((code) => defineSubject({ code, category: "other" })),
        ...expandTwoDigitRange(40, 48).map((code) => defineSubject({ code, category: "other" })),
        ...expandTwoDigitRange(80, 88).map((code) => defineSubject({ code, category: "other" })),
      ],
    },
  ],
});
