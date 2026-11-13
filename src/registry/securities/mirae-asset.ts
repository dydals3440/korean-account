import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

export const miraeAsset = defineInstitution({
  id: "mirae-asset",
  code: "238",
  aliasCodes: ["230"],
  nameKo: "미래에셋증권",
  nameEn: "Mirae Asset Securities",
  category: "securities",
  aliases: ["미래에셋", "미래에셋대우"],
  userBaseMillions: 13,
  patterns: [
    /** p.15: 230(구 미래에셋대우) plain serials are registrable only if opened by 2016.12.31. */
    {
      template: patternTemplate("XXXXXXXX"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      note: "2016.12.31 이전 등록분",
    },
    {
      template: patternTemplate("XXXXXXXXX"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      note: "2016.12.31 이전 등록분",
    },
    {
      template: patternTemplate("XXXXXXXX-XX"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      note: "2016.12.31 이전 등록분",
    },
    {
      template: patternTemplate("XXXXXXXXXXX"),
      kind: "old",
      effectiveFrom: "2010-05-22",
      services: REGULAR_ACCOUNT_SERVICES,
      note: "2016.12.31 이전 등록분",
    },
    {
      template: patternTemplate("XXXXXXXXXXXX"),
      kind: "new",
      services: REGULAR_ACCOUNT_SERVICES,
      note: "2017.1.1 이후 신규 등록은 12자리만 가능",
    },
    {
      template: patternTemplate("XXXXXXXXXXXXX"),
      kind: "old",
      services: REGULAR_ACCOUNT_SERVICES,
      note: "2016.12.31 이전 등록분",
    },
    {
      template: patternTemplate("XXXXXXXXXXXXXX"),
      kind: "old",
      effectiveFrom: "2010-05-22",
      services: REGULAR_ACCOUNT_SERVICES,
      note: "2016.12.31 이전 등록분",
    },
    {
      template: patternTemplate("XXX-XX-XXXXXX"),
      kind: "merged-legacy",
      services: REGULAR_ACCOUNT_SERVICES,
      note: "2010.5.22 이전 개설, 2016.12.31 이전 등록분",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "99", category: "ordinary" }),
        defineSubject({
          code: "31",
          services: cmsServices("directCredit", "additionalServices"),
          category: "savings",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "44",
          services: cmsServices("directCredit", "additionalServices"),
          category: "savings",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "46",
          category: "savings",
          note: "장기주택마련저축·연금·개인연금 계좌는 출금이체 제외",
        }),
        defineSubject({
          code: "51",
          services: cmsServices("directCredit", "additionalServices"),
          category: "savings",
          allowsWithdrawal: false,
        }),
        defineSubject({ code: "77", category: "savings" }),
      ],
    },
    /** p.15 238 점번호(3)-과목(2)-일련번호(7): 2016.12.31 이전 등록분, plain 12d coexists. */
    {
      template: patternTemplate("XXX-XX-XXXXXXX"),
      kind: "old",
      services: cmsServices("directCredit", "additionalServices"),
      note: "2016.12.31 이전 등록에 한함",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({
          code: "39",
          category: "other",
          services: REGULAR_ACCOUNT_SERVICES,
          effectiveFrom: "2016-03-14",
        }),
        ...["20", "21", "22", "33", "51", "58"].map((code) =>
          defineSubject({ code, category: "other", services: REGULAR_ACCOUNT_SERVICES }),
        ),
        ...["05", "15", "34", "37", "60", "62", "63", "90", "91"].map((code) =>
          defineSubject({ code, category: "other", allowsWithdrawal: false }),
        ),
        defineSubject({
          code: "92",
          effectiveFrom: "2016-03-14",
          category: "isa",
          allowsWithdrawal: false,
        }),
      ],
    },
  ],
});
