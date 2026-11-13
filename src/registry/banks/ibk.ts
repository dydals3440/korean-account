import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const ibk = defineInstitution({
  id: "ibk",
  code: "003",
  aliasCodes: ["043"],
  nameKo: "IBK기업은행",
  nameEn: "Industrial Bank of Korea",
  category: "bank",
  aliases: ["IBK", "기업은행", "기업"],
  userBaseMillions: 8,
  patterns: [
    {
      template: patternTemplate("XXXXXXXX-XX"),
      kind: "lifetime",
      services: cmsServices(),
      note: "평생계좌, 자동이체 신규등록 중단(2012.11.12), 기존 계좌는 유지",
    },
    {
      template: patternTemplate("XXX-XXXXXXXX"),
      kind: "lifetime",
      services: cmsServices(),
      note: "평생계좌, 자동이체 신규등록 중단(2012.11.12), 기존 계좌는 유지",
    },
    {
      template: patternTemplate("XXX-XX-XXXXXX-X"),
      kind: "old",
      services: cmsServices("directDebit", "directCredit"),
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "03", category: "savings" }),
        defineSubject({ code: "13", category: "savings" }),
        defineSubject({ code: "07", category: "household-current" }),
        defineSubject({ code: "06", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
      ],
    },
    {
      template: patternTemplate("XXX-XXXXXX-XX-XX-X"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 9, length: 2 },
      identifiers: ["01", "02", "03", "04", "06", "07", "13"],
      subjectPosition: { start: 9, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "03", category: "savings" }),
        defineSubject({ code: "13", category: "savings" }),
        defineSubject({ code: "07", category: "household-current" }),
        defineSubject({ code: "06", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
      ],
    },
  ],
});
