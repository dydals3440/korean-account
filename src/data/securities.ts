import { createPatternTemplate as T } from "../createPatternTemplate";
import { defineSubject } from "../subjects";
import { defineInstitution } from "./defineInstitution";
import { expandTwoDigitRange } from "./expandTwoDigitRange";

/**
 * 증권사. 자릿수·과목 위치는 사별 차이가 크며 일부는 비공개.
 * PDF에 명시된 자릿수 variant만 등록한다. 일련번호만 사용하는 곳은
 * `subjects` 없이 길이 매칭만.
 */

const yuanta = defineInstitution({
  id: "yuanta",
  code: "209",
  nameKo: "유안타증권",
  nameEn: "Yuanta Securities",
  category: "securities",
  aliases: ["유안타", "동양증권"],
  priority: 35,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "06", category: "savings" }),
        defineSubject({ code: "53", category: "savings" }),
        defineSubject({ code: "71", category: "savings" }),
        defineSubject({ code: "76", category: "savings" }),
      ],
    },
    {
      template: T("XXXX-XXXX-XXX"),
      kind: "new",
      effectiveFrom: "2011-01-03",
    },
  ],
});

const kbSec = defineInstitution({
  id: "kb-sec",
  code: "218",
  aliasCodes: ["226"],
  nameKo: "KB증권",
  nameEn: "KB Securities",
  category: "securities",
  aliases: ["KB증권", "현대증권"],
  priority: 60,
  successorOf: ["hyundai-sec"],
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "06", category: "savings" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "10", category: "savings" }),
        defineSubject({ code: "11", category: "savings" }),
        defineSubject({ code: "12", category: "savings" }),
        defineSubject({ code: "16", category: "savings" }),
        defineSubject({ code: "30", category: "savings" }),
        defineSubject({ code: "40", category: "savings" }),
        defineSubject({ code: "45", category: "savings" }),
        defineSubject({ code: "50", category: "savings" }),
        defineSubject({ code: "55", category: "savings" }),
        defineSubject({ code: "61", category: "savings" }),
        defineSubject({ code: "62", category: "savings" }),
        defineSubject({ code: "63", category: "savings" }),
        defineSubject({ code: "64", category: "savings" }),
        defineSubject({ code: "65", category: "savings" }),
        defineSubject({ code: "66", category: "savings" }),
        defineSubject({ code: "67", category: "savings" }),
        defineSubject({ code: "68", category: "savings" }),
        defineSubject({ code: "69", category: "savings" }),
      ],
    },
    { template: T("XXX-XXX-XX-XX"), kind: "new" },
    { template: T("XXX-XXX-XX"), kind: "new" },
  ],
});

const miraeAsset = defineInstitution({
  id: "mirae-asset",
  code: "238",
  aliasCodes: ["230"],
  nameKo: "미래에셋증권",
  nameEn: "Mirae Asset Securities",
  category: "securities",
  aliases: ["미래에셋", "미래에셋대우"],
  priority: 60,
  patterns: [
    { template: T("XXXXXXXX-XX"), kind: "new" },
    { template: T("XXXXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXXXX"), kind: "new", effectiveFrom: "2017-01-01" },
    { template: T("XXXXXXXXXXXXXX"), kind: "new" },
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "99", category: "ordinary" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "44", category: "savings" }),
        defineSubject({
          code: "46",
          category: "savings",
          allowsWithdrawal: false,
          note: "일부 출금이체 제외",
        }),
        defineSubject({ code: "51", category: "savings" }),
        defineSubject({ code: "77", category: "savings" }),
      ],
    },
  ],
});

const samsungSec = defineInstitution({
  id: "samsung-sec",
  code: "240",
  nameKo: "삼성증권",
  nameEn: "Samsung Securities",
  category: "securities",
  aliases: ["삼성증권"],
  priority: 60,
  patterns: [
    { template: T("XXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXX"), kind: "new", effectiveFrom: "2013-05-20" },
    { template: T("XXXXXXXXXXXX"), kind: "new", effectiveFrom: "2013-05-20" },
    {
      template: T("X-XXXXX-XXXXXXXX"),
      kind: "new",
      effectiveFrom: "2010-12-13",
    },
  ],
});

const kis = defineInstitution({
  id: "kis",
  code: "243",
  nameKo: "한국투자증권",
  nameEn: "Korea Investment & Securities",
  category: "securities",
  aliases: ["한국투자증권", "한투", "KIS"],
  priority: 55,
  patterns: [
    { template: T("XXXXXXXX-XX"), kind: "new" },
    { template: T("XXXXXXXX-XXXX"), kind: "new" },
    { template: T("XXXXXXXX-XX-XXXX"), kind: "new" },
  ],
});

const nhInv = defineInstitution({
  id: "nh-inv",
  code: "247",
  aliasCodes: ["289"],
  nameKo: "NH투자증권",
  nameEn: "NH Investment & Securities",
  category: "securities",
  aliases: ["NH투자", "NH투자증권", "우리투자증권"],
  priority: 55,
  successorOf: ["wooriinvest-legacy", "nh-nonghyup-sec"],
  patterns: [{ template: T("XXXXXXXXXXX"), kind: "new", effectiveFrom: "2009-08-04" }],
});

const kyobo = defineInstitution({
  id: "kyobo-sec",
  code: "261",
  nameKo: "교보증권",
  nameEn: "Kyobo Securities",
  category: "securities",
  aliases: ["교보증권"],
  priority: 25,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "35", category: "savings" }),
        defineSubject({ code: "51", category: "savings" }),
        defineSubject({ code: "53", category: "savings" }),
        defineSubject({ code: "54", category: "savings" }),
        ...expandTwoDigitRange(60, 69).map((code) => defineSubject({ code, category: "savings" })),
        defineSubject({ code: "71", category: "savings" }),
        defineSubject({ code: "80", category: "savings" }),
      ],
    },
    {
      template: T("XXXX-XXXX-X-X"),
      kind: "new",
      effectiveFrom: "2012-01-25",
    },
  ],
});

const imSec = defineInstitution({
  id: "im-sec",
  code: "262",
  nameKo: "아이엠증권",
  nameEn: "iM Securities",
  category: "securities",
  aliases: ["아이엠증권", "iM증권", "IBK투자증권", "하이투자증권"],
  priority: 25,
  successorOf: ["hi-investment-sec"],
  patterns: [
    {
      template: T("XXXXXXX-X-XX"),
      kind: "new",
      subjectPosition: { start: 8, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "99", category: "ordinary" }),
      ],
    },
  ],
});

const hyundaiMotorSec = defineInstitution({
  id: "hyundai-motor-sec",
  code: "263",
  nameKo: "현대차증권",
  nameEn: "Hyundai Motor Securities",
  category: "securities",
  aliases: ["현대차증권", "HMC투자증권"],
  priority: 25,
  patterns: [{ template: T("XXXXXXXX"), kind: "new" }],
});

const kiwoom = defineInstitution({
  id: "kiwoom",
  code: "264",
  nameKo: "키움증권",
  nameEn: "Kiwoom Securities",
  category: "securities",
  aliases: ["키움", "키움증권"],
  priority: 65,
  patterns: [
    // 50~59 는 ISA, 출금 불가 (defineSubject 의 allowsWithdrawal: false 로 강제)
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

const lsSec = defineInstitution({
  id: "ls-sec",
  code: "265",
  nameKo: "엘에스투자증권",
  nameEn: "LS Securities",
  category: "securities",
  aliases: ["엘에스투자증권", "LS투자증권", "이베스트투자증권", "이베스트"],
  priority: 25,
  successorOf: ["ebest-legacy"],
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "45", category: "savings" }),
        defineSubject({ code: "51", category: "savings" }),
        defineSubject({ code: "55", category: "savings" }),
        defineSubject({ code: "56", category: "savings" }),
        // 출금이체 X (입금전용)
        ...["65", "77", "78"].map((code) =>
          defineSubject({
            code,
            category: "savings",
            allowsWithdrawal: false,
          }),
        ),
      ],
    },
    { template: T("XXXXXXXXX"), kind: "new", effectiveFrom: "2012-07-09" },
    { template: T("XXXXXXXXXXX"), kind: "new" },
  ],
});

const skSec = defineInstitution({
  id: "sk-sec",
  code: "266",
  nameKo: "SK증권",
  nameEn: "SK Securities",
  category: "securities",
  aliases: ["SK증권"],
  priority: 30,
  patterns: [
    { template: T("XXXXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXX"), kind: "new" },
  ],
});

const daishin = defineInstitution({
  id: "daishin",
  code: "267",
  nameKo: "대신증권",
  nameEn: "Daishin Securities",
  category: "securities",
  aliases: ["대신", "대신증권"],
  priority: 35,
  patterns: [
    { template: T("XXX-XXXXXX"), kind: "new" },
    { template: T("XXX-XXXXXX-XX"), kind: "new" },
  ],
});

const hanwhaInv = defineInstitution({
  id: "hanwha-inv",
  code: "269",
  nameKo: "한화투자증권",
  nameEn: "Hanwha Investment & Securities",
  category: "securities",
  aliases: ["한화투자증권", "한화투자"],
  priority: 25,
  patterns: [
    { template: T("XXXXXXXXXX"), kind: "new", effectiveFrom: "2012-09-03" },
    { template: T("XXXXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXXXXXX"), kind: "new" },
  ],
});

const hanaSec = defineInstitution({
  id: "hana-sec",
  code: "270",
  nameKo: "하나증권",
  nameEn: "Hana Securities",
  category: "securities",
  aliases: ["하나증권", "하나금융투자"],
  priority: 35,
  successorOf: ["hana-fin-invest"],
  patterns: [
    { template: T("XXXXXXX-X"), kind: "new" },
    {
      template: T("XXXXXXX-X-XX"),
      kind: "merged-legacy",
      subjectPosition: { start: 8, length: 2 },
      subjects: [
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "22", category: "savings" }),
        defineSubject({ code: "23", category: "savings" }),
        defineSubject({ code: "26", category: "savings" }),
        defineSubject({ code: "30", category: "savings" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "51", category: "savings" }),
        defineSubject({ code: "61", category: "savings" }),
        defineSubject({ code: "69", category: "savings" }),
        defineSubject({ code: "80", category: "savings" }),
      ],
    },
    {
      template: T("XXXXXXXX-XXX"),
      kind: "new",
      effectiveFrom: "2016-11-21",
    },
    {
      template: T("XXXXXXXX-XXX-XXX"),
      kind: "new",
      effectiveFrom: "2016-11-21",
    },
  ],
});

const shinhanInv = defineInstitution({
  id: "shinhan-inv",
  code: "278",
  nameKo: "신한투자증권",
  nameEn: "Shinhan Securities",
  category: "securities",
  aliases: ["신한투자", "신한투자증권", "신한금융투자"],
  priority: 50,
  successorOf: ["shinhan-fin-invest"],
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "new",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
      ],
      note: "01·11 종합계좌는 2017.09.04 이후 신규 발급 중단, 기존 계좌만 매칭",
    },
  ],
});

const dbSec = defineInstitution({
  id: "db-sec",
  code: "279",
  nameKo: "DB증권",
  nameEn: "DB Securities",
  category: "securities",
  aliases: ["DB증권", "DB금융투자", "동부증권"],
  priority: 25,
  patterns: [
    { template: T("XXX-XX-XXXX"), kind: "new" },
    {
      template: T("XXX-XX-XXXX-XX"),
      kind: "new",
    },
  ],
});

const eugeneInv = defineInstitution({
  id: "eugene-inv",
  code: "280",
  nameKo: "유진투자증권",
  nameEn: "Eugene Investment & Securities",
  category: "securities",
  aliases: ["유진투자", "유진투자증권"],
  priority: 25,
  patterns: [{ template: T("XXXXXXXXXXX"), kind: "new" }],
});

const meritz = defineInstitution({
  id: "meritz",
  code: "287",
  aliasCodes: ["268"],
  nameKo: "메리츠증권",
  nameEn: "Meritz Securities",
  category: "securities",
  aliases: ["메리츠", "메리츠증권", "아이엠투자증권"],
  priority: 30,
  successorOf: ["im-investment-sec"],
  patterns: [
    {
      template: T("XXXX-XXXX-XX"),
      kind: "old",
      subjectPosition: { start: 8, length: 2 },
      subjects: [
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "15", category: "savings" }),
        defineSubject({ code: "16", category: "savings" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "22", category: "savings" }),
        defineSubject({ code: "23", category: "savings" }),
        defineSubject({ code: "31", category: "savings" }),
        defineSubject({ code: "61", category: "savings" }),
        defineSubject({ code: "62", category: "savings" }),
        defineSubject({ code: "63", category: "savings" }),
        defineSubject({ code: "64", category: "savings" }),
        defineSubject({ code: "65", category: "savings" }),
        defineSubject({ code: "66", category: "savings" }),
        defineSubject({ code: "41", category: "household-current" }),
        defineSubject({ code: "42", category: "household-current" }),
        defineSubject({ code: "71", category: "current" }),
        defineSubject({ code: "99", category: "corporate-free" }),
      ],
      effectiveFrom: "2009-09-24",
    },
    {
      template: T("XXXX-XXXX-XX"),
      kind: "new",
      effectiveFrom: "2012-07-26",
      note: "00 사용 불가",
    },
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "88", category: "savings" }),
        defineSubject({ code: "53", category: "savings" }),
        defineSubject({ code: "54", category: "savings" }),
        defineSubject({
          code: "21",
          category: "savings",
          allowsWithdrawal: false,
        }),
      ],
    },
  ],
});

const kakaopaySec = defineInstitution({
  id: "kakaopay-sec",
  code: "288",
  nameKo: "카카오페이증권",
  nameEn: "KakaoPay Securities",
  category: "securities",
  aliases: ["카카오페이증권", "카카오페이"],
  priority: 50,
  patterns: [{ template: T("XXXXXXXXXXX"), kind: "new", effectiveFrom: "2021-12-16" }],
});

const bookookSec = defineInstitution({
  id: "bookook-sec",
  code: "290",
  nameKo: "부국증권",
  nameEn: "Bookook Securities",
  category: "securities",
  aliases: ["부국증권"],
  priority: 15,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
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

const shinyoungSec = defineInstitution({
  id: "shinyoung-sec",
  code: "291",
  nameKo: "신영증권",
  nameEn: "Shinyoung Securities",
  category: "securities",
  aliases: ["신영증권"],
  priority: 20,
  patterns: [
    { template: T("XXXXXXXXX"), kind: "new" },
    { template: T("XXXXXXXXXXXX"), kind: "new" },
  ],
});

const capeInv = defineInstitution({
  id: "cape-inv",
  code: "292",
  nameKo: "케이프투자증권",
  nameEn: "Cape Investment & Securities",
  category: "securities",
  aliases: ["케이프투자증권", "케이프", "LIG투자증권"],
  priority: 15,
  successorOf: ["lig-investment"],
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "new",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "33", category: "savings" }),
        defineSubject({ code: "55", category: "savings" }),
        defineSubject({ code: "75", category: "savings" }),
        defineSubject({ code: "76", category: "savings" }),
        defineSubject({ code: "77", category: "savings" }),
        defineSubject({ code: "78", category: "savings" }),
        defineSubject({ code: "88", category: "savings" }),
      ],
    },
    {
      template: T("XXX-XX-XXXXXX-XXX"),
      kind: "new",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({
          code: "87",
          category: "savings",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "88",
          category: "savings",
          allowsWithdrawal: false,
        }),
      ],
    },
  ],
});

const wooriInv = defineInstitution({
  id: "woori-inv",
  code: "294",
  nameKo: "우리투자증권",
  nameEn: "Woori Investment & Securities",
  category: "securities",
  aliases: ["우리투자증권", "우리투자", "한국포스증권"],
  priority: 30,
  successorOf: ["korea-fos-sec"],
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "new",
      effectiveFrom: "2019-12-20",
    },
  ],
});

export const SECURITIES = [
  yuanta,
  kbSec,
  miraeAsset,
  samsungSec,
  kis,
  nhInv,
  kyobo,
  imSec,
  hyundaiMotorSec,
  kiwoom,
  lsSec,
  skSec,
  daishin,
  hanwhaInv,
  hanaSec,
  shinhanInv,
  dbSec,
  eugeneInv,
  meritz,
  kakaopaySec,
  bookookSec,
  shinyoungSec,
  capeInv,
  wooriInv,
] as const;
