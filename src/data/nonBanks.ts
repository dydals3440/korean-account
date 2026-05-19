import { suhyupCoop12BranchToBank } from "../_internal/branchRules";
import { defineSubject } from "../_internal/subjects";
import { createPatternTemplate as T } from "../createPatternTemplate";
import { defineInstitution } from "./defineInstitution";

/**
 * 비은행 예금 취급 기관 (수협중앙회·농협중앙회·새마을·신협·우체국·산림조합·저축은행)
 * + 금융결제원 (099, 메타데이터 only).
 */

const suhyupCoop = defineInstitution({
  id: "suhyup-coop",
  code: "030",
  aliasCodes: ["069", "070"],
  nameKo: "수협중앙회",
  nameEn: "Suhyup Central",
  category: "non-bank",
  aliases: ["수협중앙회", "단위수협"],
  priority: 25,
  patterns: [
    // branchRule: 1번째 2/7/9 → 중앙회, 그 외 → 007 수협은행 라우팅
    {
      template: T("X-XXXXXXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["2", "7", "9"],
      branchRule: suhyupCoop12BranchToBank,
      validatesCheckDigit: false,
      effectiveFrom: "2025-11-10",
    },
  ],
});

const nhCoopSubjectsNew = [
  defineSubject({ code: "351", category: "ordinary" }),
  defineSubject({ code: "352", category: "savings" }),
  defineSubject({ code: "356", category: "free-savings" }),
  defineSubject({ code: "355", category: "corporate-free" }),
];

const nhCoop = defineInstitution({
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
    // 13d 차세대 적금 (입금만 가능) — PDF 명시 5코드.
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
    // 13d 차세대 신탁 (입금만 가능) — PDF 명시 028.
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

const kfcc = defineInstitution({
  id: "kfcc",
  code: "045",
  aliasCodes: ["046", "085", "086", "087"],
  nameKo: "새마을금고중앙회",
  nameEn: "Korean Federation of Community Credit Cooperatives",
  category: "non-bank",
  aliases: ["새마을금고", "새마을", "MG", "MG새마을금고"],
  priority: 55,
  patterns: [
    {
      template: T("XXXX-XX-XXXXXX-X"),
      kind: "old",
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({ code: "09", category: "ordinary" }),
        defineSubject({ code: "10", category: "ordinary" }),
        defineSubject({ code: "13", category: "ordinary" }),
      ],
    },
    {
      template: T("XXXX-XX-XXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["9001", "9002", "9003", "9004", "9005"],
      subjectPosition: { start: 1, length: 3 },
      subjects: [
        defineSubject({ code: "002", category: "ordinary" }),
        defineSubject({ code: "003", category: "ordinary" }),
        defineSubject({ code: "004", category: "ordinary" }),
        defineSubject({ code: "005", category: "corporate-free" }),
        defineSubject({
          code: "037",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2009-09-21",
        }),
      ],
    },
    // 13d 신 저축 (입금만 가능) — PDF X(출금이체 불가).
    {
      template: T("XXXX-XX-XXXXXXX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["9206", "9207", "9210"],
      subjectPosition: { start: 1, length: 3 },
      subjects: ["206", "207", "210"].map((code) =>
        defineSubject({ code, category: "savings", allowsWithdrawal: false }),
      ),
    },
    // 13d 신 적금 (입금만 가능) — PDF 기타 입금만.
    {
      template: T("XXXX-XX-XXXXXXX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["9200", "9202", "9205", "9208", "9209", "9212"],
      subjectPosition: { start: 1, length: 3 },
      subjects: ["200", "202", "205", "208", "209", "212"].map((code) =>
        defineSubject({
          code,
          category: "installment",
          allowsWithdrawal: false,
        }),
      ),
    },
  ],
});

const shinhyup = defineInstitution({
  id: "shinhyup",
  code: "048",
  aliasCodes: ["047", "049"],
  nameKo: "신협중앙회",
  nameEn: "Credit Union Central",
  category: "non-bank",
  aliases: ["신협", "신용협동조합", "CU"],
  priority: 40,
  patterns: [
    { template: T("XXX-XXX-XXXX"), kind: "new" },
    { template: T("XXX-XXXX-XXXX"), kind: "new" },
    {
      template: T("XXX-XXX-XXXXX-X"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: [
        "110",
        "131",
        "132",
        "134",
        "137",
        "138",
        "142",
        "144",
        "145",
        "731",
        "177",
        "133",
        "136",
        "135",
      ],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "110", category: "ordinary" }),
        defineSubject({ code: "131", category: "ordinary" }),
        defineSubject({ code: "132", category: "ordinary" }),
        defineSubject({ code: "134", category: "ordinary" }),
        defineSubject({ code: "137", category: "ordinary" }),
        defineSubject({
          code: "138",
          category: "ordinary",
          effectiveFrom: "2015-10-05",
        }),
        defineSubject({
          code: "142",
          category: "ordinary",
          effectiveFrom: "2024-12-31",
        }),
        defineSubject({
          code: "144",
          category: "ordinary",
          effectiveFrom: "2025-12-22",
        }),
        defineSubject({
          code: "145",
          category: "ordinary",
          effectiveFrom: "2026-02-23",
        }),
        defineSubject({ code: "731", category: "ordinary" }),
        defineSubject({ code: "177", category: "savings" }),
        defineSubject({ code: "133", category: "free-savings" }),
        defineSubject({ code: "136", category: "free-savings" }),
        defineSubject({ code: "135", category: "corporate-free" }),
        defineSubject({
          code: "910",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2011-02-28",
        }),
      ],
    },
    // 12d 적금 (입금만 가능) — PDF 명시 6코드.
    {
      template: T("XXX-XXX-XXXXX-X"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["170", "171", "172", "173", "174", "178"],
      subjectPosition: { start: 0, length: 3 },
      subjects: ["170", "171", "172", "173", "174", "178"].map((code) =>
        defineSubject({
          code,
          category: "installment",
          allowsWithdrawal: false,
        }),
      ),
    },
    {
      template: T("XXXXX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 5, length: 2 },
      subjects: [
        defineSubject({ code: "12", category: "ordinary" }),
        defineSubject({ code: "13", category: "ordinary" }),
      ],
    },
    {
      template: T("XXXXX-XX-XXXXXX-X"),
      kind: "old",
      subjectPosition: { start: 5, length: 2 },
      subjects: [defineSubject({ code: "14", category: "ordinary" })],
    },
  ],
});

const savingsBank = defineInstitution({
  id: "savings-bank",
  code: "050",
  nameKo: "상호저축은행",
  nameEn: "Mutual Savings Bank",
  category: "non-bank",
  aliases: ["저축은행", "상호저축은행", "SBI저축", "OK저축", "웰컴저축"],
  priority: 35,
  patterns: [
    {
      template: T("XXX-XX-XX-XXXXXX-X"),
      kind: "new",
      subjectPosition: { start: 5, length: 2 },
      subjects: [
        defineSubject({ code: "13", category: "ordinary" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "22", category: "free-savings" }),
        defineSubject({ code: "23", category: "corporate-free" }),
      ],
    },
  ],
});

const forest = defineInstitution({
  id: "forest",
  code: "064",
  nameKo: "산림조합중앙회",
  nameEn: "Forestry Cooperatives Central",
  category: "non-bank",
  aliases: ["산림조합", "산림"],
  priority: 10,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "11", category: "ordinary" }),
        defineSubject({ code: "12", category: "savings" }),
        defineSubject({ code: "13", category: "savings" }),
        defineSubject({ code: "14", category: "free-savings" }),
        defineSubject({ code: "15", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXXXX-XX-XXXXXX"),
      kind: "new",
      subjectPosition: { start: 5, length: 2 },
      subjects: [
        defineSubject({ code: "21", category: "ordinary" }),
        defineSubject({ code: "22", category: "savings" }),
        defineSubject({ code: "30", category: "savings" }),
        defineSubject({ code: "27", category: "free-savings" }),
        defineSubject({ code: "32", category: "corporate-free" }),
      ],
      effectiveFrom: "2009-11-09",
    },
  ],
});

const post = defineInstitution({
  id: "post",
  code: "071",
  aliasCodes: ["072", "073", "074", "075"],
  nameKo: "우체국",
  nameEn: "Korea Post",
  category: "non-bank",
  aliases: ["우체국", "Korea Post", "EPOST", "지식경제부 우체국"],
  priority: 50,
  patterns: [
    {
      template: T("XXX-XXXXXXXX-X"),
      kind: "old",
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
    },
    {
      template: T("X-XXXXXXXXXXX-X"),
      kind: "virtual",
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["8", "9"],
    },
    {
      template: T("XXXXXX-XX-XXXXX-X"),
      kind: "new",
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
      ],
    },
    // 14d 입금만 가능 기타 — PDF 명시: 듬뿍우대저축(05), 31~33, 49, 40~48, 80~88.
    {
      template: T("XXXXXX-XX-XXXXX-X"),
      kind: "incoming-only",
      subjectPosition: { start: 6, length: 2 },
      subjects: [
        defineSubject({
          code: "05",
          category: "savings",
          label: "듬뿍우대저축",
          allowsWithdrawal: false,
        }),
        ...["31", "32", "33", "49"].map((code) =>
          defineSubject({ code, category: "other", allowsWithdrawal: false }),
        ),
        ...Array.from({ length: 9 }, (_, i) => String(40 + i)).map((code) =>
          defineSubject({ code, category: "other", allowsWithdrawal: false }),
        ),
        ...Array.from({ length: 9 }, (_, i) => String(80 + i)).map((code) =>
          defineSubject({ code, category: "other", allowsWithdrawal: false }),
        ),
      ],
    },
  ],
});

// ---- 099 금융결제원 (메타 only) ----

const kftc = defineInstitution({
  id: "kftc",
  code: "099",
  nameKo: "금융결제원",
  nameEn: "Korea Financial Telecommunications & Clearings Institute",
  category: "clearing",
  aliases: ["금융결제원", "KFTC"],
  priority: 0,
  patterns: [],
  notes: "청산 기관 — customer-facing 계좌 없음",
});

export const NON_BANKS = [
  suhyupCoop,
  nhCoop,
  kfcc,
  shinhyup,
  savingsBank,
  forest,
  post,
  kftc,
] as const;
