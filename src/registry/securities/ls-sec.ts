import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const lsSec = defineInstitution({
  id: "ls-sec",
  code: "265",
  nameKo: "엘에스투자증권",
  nameEn: "LS Securities",
  category: "securities",
  aliases: ["엘에스투자증권", "LS투자증권", "이베스트투자증권", "이베스트"],
  userBaseMillions: 3,
  successorOf: ["ebest-legacy"],
  patterns: [
    {
      template: patternTemplate("XXX-XX-XXXXXX"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "45", category: "savings" }),
        defineSubject({ code: "51", category: "savings" }),
        defineSubject({ code: "55", category: "savings" }),
        defineSubject({ code: "56", category: "savings" }),
        ...["65", "77", "78"].map((code) =>
          defineSubject({
            code,
            category: "savings",
            allowsWithdrawal: false,
            services: cmsServices("directCredit", "additionalServices"),
          }),
        ),
      ],
    },
    {
      template: patternTemplate("XXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2012-07-09",
    },
    {
      template: patternTemplate("XXXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      effectiveFrom: "2012-07-09",
    },
  ],
});
