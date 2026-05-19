import {
  kb11FirstDigit,
  kbank10First9,
  kbank14First79,
  suhyup11BranchToCoop,
  suhyup12BranchToCoop,
  suhyup14BranchToCoop,
  toss12First1719,
} from "../_internal/branchRules";
import { defineSubject } from "../_internal/subjects";
import { createPatternTemplate as T } from "../createPatternTemplate";
import type { Subject } from "../types";
import { defineInstitution } from "./defineInstitution";

/**
 * 005 하나은행 외환 통합 14d (`XXX-XXXXXX-XXXXX`) 가 점유하는 prefix set.
 *
 * iM뱅크 14d 신, 하나증권 CMA 14d 등 동일 길이 패턴이 false positive 를 일으키지
 * 않도록 `additionalRules` 에서 제외 조건으로 사용한다.
 */
const HANA_FOREIGN_LEGACY_PREFIXES: ReadonlySet<string> = new Set([
  "117",
  "158",
  "161",
  "162",
  "210",
  "379",
  "600",
  "655",
]);

/**
 * 시중·특수·지방·인터넷전문·외국계 은행.
 *
 * 코드 / 자릿수 / 식별·과목 위치는 [금융결제원 CMS 참가기관별 계좌번호체계
 * (2026.05.08)](https://www.cmsedi.or.kr/cms/board/workdata/view/1026)을 기준으로 한다.
 *
 * 패턴은 `kind` 별로 분리하여 한 institution에 신/구/가상/평생/입금전용/구통합 패턴이
 * 공존한다. `subjects` 가 있는 패턴은 결과에 계정과목 카테고리가 함께 노출된다.
 */

// ---- 002 KDB산업은행 ----

const kdb = defineInstitution({
  id: "kdb",
  code: "002",
  nameKo: "KDB산업은행",
  nameEn: "Korea Development Bank",
  category: "bank",
  aliases: ["산업은행", "KDB", "산은"],
  priority: 40,
  patterns: [
    {
      template: T("XXX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "13", category: "ordinary" }),
        defineSubject({ code: "20", category: "savings" }),
        defineSubject({ code: "19", category: "free-savings" }),
        defineSubject({ code: "11", category: "current" }),
        defineSubject({ code: "22", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXX-XXXXXXX-X-XXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["013", "020", "019", "011", "022"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "013", category: "ordinary" }),
        defineSubject({ code: "020", category: "savings" }),
        defineSubject({ code: "019", category: "free-savings" }),
        defineSubject({ code: "011", category: "current" }),
        defineSubject({ code: "022", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXX-XXXXXXXX-XXX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["010", "036"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({
          code: "010",
          category: "treasury",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "036",
          category: "installment",
          label: "정기적금",
          allowsWithdrawal: false,
        }),
      ],
    },
  ],
});

// ---- 003 IBK기업은행 ----

const ibk = defineInstitution({
  id: "ibk",
  code: "003",
  aliasCodes: ["043"],
  nameKo: "IBK기업은행",
  nameEn: "Industrial Bank of Korea",
  category: "bank",
  aliases: ["IBK", "기업은행", "기업"],
  priority: 60,
  patterns: [
    {
      template: T("XXXXXXXX-XX"),
      kind: "lifetime",
      note: "자동이체 신규등록 중단 (2012.11.12)",
    },
    {
      template: T("XXX-XXXXXXXX"),
      kind: "lifetime",
    },
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "old",
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
    // 14d 과목 set 은 12d 구계좌와 동일.
    {
      template: T("XXX-XXXXXX-XX-XX-X"),
      kind: "new",
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

// ---- 004 KB국민은행 (006 구주택 통합) ----

const kbSubjectsOld12: Subject[] = [
  defineSubject({ code: "01", category: "ordinary" }),
  defineSubject({ code: "21", category: "savings" }),
  defineSubject({ code: "24", category: "free-savings" }),
  defineSubject({ code: "05", category: "household-current" }),
  defineSubject({ code: "04", category: "current" }),
  defineSubject({ code: "25", category: "corporate-free" }),
  defineSubject({ code: "26", category: "yes" }),
];

const kb = defineInstitution({
  id: "kb",
  code: "004",
  aliasCodes: ["006", "019", "029", "078", "079"],
  nameKo: "KB국민은행",
  nameEn: "KB Kookmin Bank",
  category: "bank",
  aliases: ["국민", "국민은행", "KB", "KB국민"],
  priority: 100,
  patterns: [
    {
      template: T("XXX-XXX-XXXX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["0"],
      note: "고객지정/핸드폰 입금 전용",
    },
    // 11자리는 0=입금전용, 9=평생계좌 — branchRule 로 kind 분기.
    {
      template: T("XXX-XXXX-XXXX"),
      kind: "new",
      branchRule: kb11FirstDigit,
      additionalRules: [(d) => d.length === 11 && (d[0] === "0" || d[0] === "9")],
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["0", "9"],
      note: "11자리: 0=입금전용, 9=평생계좌",
    },
    {
      template: T("XXX-XX-XXXX-XX-X"),
      kind: "old",
      identifierPosition: { start: 3, length: 2 },
      identifiers: ["01", "21", "24", "05", "04", "25", "26"],
      subjectPosition: { start: 3, length: 2 },
      subjects: kbSubjectsOld12,
    },
    {
      template: T("XXXX-XX-XXXXXXX-X"),
      kind: "virtual",
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({
          code: "92",
          category: "ordinary",
          virtual: true,
          allowsWithdrawal: false,
          effectiveFrom: "2010-08-26",
          note: "수납전용 비실명 가상계좌",
        }),
      ],
    },
    {
      template: T("XXXX-XX-XXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({ code: "06", category: "household-current" }),
        defineSubject({ code: "18", category: "current" }),
      ],
      note: "(구)주택 12자리, 연계예금(90) CMS 계약 업체만",
    },
    {
      template: T("XXXX-XX-XXXXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "25", category: "free-savings" }),
        defineSubject({ code: "37", category: "corporate-free" }),
        defineSubject({
          code: "90",
          category: "linked",
          allowsWithdrawal: false,
        }),
      ],
      note: "(구)주택 14자리",
    },
  ],
});

// ---- 005 하나은행 (외환·하나 통합) ----

const hana = defineInstitution({
  id: "hana",
  code: "005",
  // KFTC 표준은행코드는 081 (외환·하나 합병 후 표준 namespace 는 하나 대표코드 유지).
  // CMS namespace 의 081 은 hanaSecuritiesCma (하나증권 CMA) 가 점유 — 별개 institution.
  commonCode: "081",
  // CMS aliases 의 081 은 hanaSecuritiesCma 와 코드 충돌 회피 위해 제외.
  aliasCodes: ["025", "033", "080", "082"],
  nameKo: "하나은행",
  nameEn: "Hana Bank",
  category: "bank",
  aliases: ["하나", "KEB하나", "하나은행", "외환은행"],
  priority: 80,
  successorOf: ["keb-foreign-exchange"],
  patterns: [
    // 3자리 입금만 코드 (810/811/817/818/704 등) 는 본 11d 패턴 (2자리 과목) 으로
    // 표현 불가 — 별도 backlog.
    {
      template: T("XXX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "13", category: "ordinary" }),
        defineSubject({ code: "33", category: "ordinary" }),
        defineSubject({ code: "18", category: "savings" }),
        defineSubject({ code: "38", category: "savings" }),
        defineSubject({ code: "19", category: "free-savings" }),
        defineSubject({ code: "39", category: "free-savings" }),
        defineSubject({ code: "26", category: "household-current" }),
        defineSubject({ code: "11", category: "current" }),
        defineSubject({ code: "22", category: "corporate-free" }),
        // 입금만 (출금이체 등록 불가)
        ...["15", "23", "24", "29", "70", "73", "74", "75", "77"].map((code) =>
          defineSubject({
            code,
            category: "other",
            label: "입금전용",
            allowsWithdrawal: false,
          }),
        ),
      ],
      note: "평생계좌 자동이체 등록 불가",
    },
    {
      template: T("XXX-XXXXXX-XXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["611", "620", "600", "601", "630", "621", "631", "610"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "611", category: "ordinary" }),
        defineSubject({ code: "610", category: "treasury" }),
        defineSubject({ code: "620", category: "savings" }),
        defineSubject({ code: "600", category: "household-current" }),
        defineSubject({ code: "601", category: "current" }),
        defineSubject({ code: "630", category: "corporate-free" }),
        defineSubject({ code: "621", category: "yes" }),
        defineSubject({ code: "631", category: "yes" }),
      ],
      effectiveFrom: "2009-06-15",
    },
    {
      template: T("XXX-XXXXXX-XXXXX"),
      kind: "merged-legacy",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["117", "158", "161", "162", "210", "379", "600", "655"],
      // prefix 매칭 시 score boost — hana-cma 같은 약한 매칭과 동률 회피.
      additionalRules: [(d) => d.length === 14 && HANA_FOREIGN_LEGACY_PREFIXES.has(d.slice(0, 3))],
      note: "구 외환 통합 신상품 prefix",
    },
  ],
});

// ---- 007 수협은행 + 030 수협중앙회 (2025.11.10 분리, 분기 규칙으로 라우팅) ----

const suhyup = defineInstitution({
  id: "suhyup",
  code: "007",
  aliasCodes: ["009"],
  nameKo: "수협은행",
  nameEn: "Suhyup Bank",
  category: "bank",
  aliases: ["수협"],
  priority: 30,
  patterns: [
    // branchRule: 4·5번째 자리가 분기 코드면 030 수협중앙회 라우팅
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      branchRule: suhyup11BranchToCoop,
      validatesCheckDigit: false,
      note: "수협 분리 이후 과목코드/체크디지트 검증 안함",
    },
    // branchRule: 1번째 자리가 2/7/9면 030 수협중앙회 라우팅
    {
      template: T("XXX-XXXXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      branchRule: suhyup12BranchToCoop,
      validatesCheckDigit: false,
      effectiveFrom: "2025-11-10",
      note: "수협 분리 시행, 체크디지트 검증 안함",
    },
    // branchRule: 1·2·3번째가 481~489/493 이면 030 수협중앙회 라우팅
    {
      template: T("XXX-XXXXXXXXXXX"),
      kind: "virtual",
      branchRule: suhyup14BranchToCoop,
      validatesCheckDigit: false,
    },
  ],
});

// ---- 011 NH농협은행 ----

const nhBankSubjectsOld: Subject[] = [
  defineSubject({ code: "01", category: "ordinary" }),
  defineSubject({ code: "02", category: "savings" }),
  defineSubject({ code: "12", category: "free-savings" }),
  defineSubject({
    code: "06",
    category: "household-current",
    label: "가계종합",
  }),
  defineSubject({ code: "05", category: "current" }),
  defineSubject({ code: "17", category: "corporate-free" }),
];

const nh = defineInstitution({
  id: "nh",
  code: "011",
  aliasCodes: ["010", "016"],
  nameKo: "NH농협은행",
  nameEn: "NongHyup Bank",
  category: "bank",
  aliases: ["농협", "NH", "NH농협", "농협은행"],
  priority: 90,
  patterns: [
    {
      template: T("XXX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: nhBankSubjectsOld,
    },
    {
      template: T("XXXX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 4, length: 2 },
      subjects: nhBankSubjectsOld,
    },
    {
      template: T("XXX-XXXX-XXXX-XX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["301", "302", "312", "306", "305", "317"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "301", category: "ordinary" }),
        defineSubject({ code: "302", category: "savings" }),
        defineSubject({ code: "312", category: "free-savings" }),
        defineSubject({ code: "306", category: "household-current" }),
        defineSubject({ code: "305", category: "current" }),
        defineSubject({ code: "317", category: "corporate-free" }),
      ],
    },
    // 13d 차세대 적금 (입금만 가능) — PDF 명시 10코드.
    {
      template: T("XXX-XXXX-XXXX-XX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["304", "310", "314", "321", "324", "334", "345", "347", "349", "359", "380"],
      subjectPosition: { start: 0, length: 3 },
      subjects: ["304", "310", "314", "321", "324", "334", "345", "347", "349", "359", "380"].map(
        (code) =>
          defineSubject({
            code,
            category: "installment",
            allowsWithdrawal: false,
          }),
      ),
    },
    // 13d 차세대 신탁 (입금만 가능) — PDF 명시 9코드.
    {
      template: T("XXX-XXXX-XXXX-XX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["028", "031", "043", "046", "079", "081", "086", "087", "088"],
      subjectPosition: { start: 0, length: 3 },
      subjects: ["028", "031", "043", "046", "079", "081", "086", "087", "088"].map((code) =>
        defineSubject({ code, category: "trust", allowsWithdrawal: false }),
      ),
    },
    {
      template: T("XXXXXX-XX-XXXXX-X"),
      kind: "virtual",
      subjectPosition: { start: 6, length: 2 },
      subjects: [
        defineSubject({ code: "64", category: "ordinary", virtual: true }),
        defineSubject({ code: "65", category: "ordinary", virtual: true }),
      ],
      effectiveFrom: "2007-11-27",
      note: "HMC·삼성·미래에셋·현대·NH·한화 증권 한정",
    },
    {
      template: T("XXX-XXXX-XXXX-XX-X"),
      kind: "virtual",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["790", "791"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({
          code: "790",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2009-01-28",
        }),
        defineSubject({
          code: "791",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2009-01-28",
        }),
      ],
    },
  ],
});

// ---- 020 우리은행 (구 상업/한일/평화 통합) ----

const woori = defineInstitution({
  id: "woori",
  code: "020",
  aliasCodes: ["022", "024", "083", "084"],
  nameKo: "우리은행",
  nameEn: "Woori Bank",
  category: "bank",
  aliases: ["우리"],
  priority: 85,
  successorOf: ["sangup", "hanil", "pyunghwa"],
  patterns: [
    {
      template: T("XXXX-XXX-XXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 4 },
      identifiers: ["1002", "1005", "1006"],
      subjectPosition: { start: 1, length: 3 },
      subjects: [
        defineSubject({ code: "006", category: "ordinary" }),
        defineSubject({ code: "007", category: "treasury" }),
        defineSubject({ code: "002", category: "savings" }),
        defineSubject({ code: "004", category: "household-current" }),
        defineSubject({ code: "003", category: "current" }),
        defineSubject({ code: "005", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXX-XXXXX-XX-XX-X"),
      kind: "new",
      subjectPosition: { start: 10, length: 2 },
      subjects: [
        defineSubject({ code: "18", category: "linked", virtual: true }),
        defineSubject({ code: "92", category: "linked", virtual: true }),
      ],
    },
    {
      template: T("XXX-XX-XXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "05", category: "ordinary" }),
        defineSubject({ code: "06", category: "savings" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
      ],
      note: "(구)상업",
    },
    {
      template: T("XXX-XXXXXX-XX-XX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 9, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "15", category: "treasury" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "12", category: "free-savings" }),
        defineSubject({ code: "04", category: "household-current" }),
        defineSubject({ code: "03", category: "current" }),
        defineSubject({ code: "13", category: "corporate-free" }),
      ],
      note: "(구)한일은행",
    },
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "24", category: "free-savings" }),
        defineSubject({ code: "05", category: "household-current" }),
        defineSubject({ code: "04", category: "current" }),
        defineSubject({ code: "25", category: "corporate-free" }),
        defineSubject({
          code: "09",
          category: "linked",
          allowsWithdrawal: false,
          note: "신규 신청 불가",
        }),
      ],
      note: "(구)평화은행",
    },
  ],
});

// ---- 023 SC제일은행 ----

const sc = defineInstitution({
  id: "sc",
  code: "023",
  nameKo: "SC제일은행",
  nameEn: "SC First Bank",
  category: "bank",
  aliases: ["SC", "제일은행", "SC제일", "스탠다드차타드"],
  priority: 25,
  patterns: [
    {
      template: T("XXX-XX-XXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "10", category: "ordinary" }),
        defineSubject({ code: "20", category: "savings" }),
        defineSubject({ code: "30", category: "household-current" }),
      ],
    },
    {
      template: T("XXX-XX-XXXXX"),
      kind: "virtual",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({
          code: "15",
          category: "ordinary",
          virtual: true,
          allowsWithdrawal: false,
          effectiveFrom: "2010-12-27",
          note: "수납전용",
        }),
      ],
    },
    {
      template: T("XXX-XX-XXXXXXXXX"),
      kind: "virtual",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({
          code: "16",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2010-12-27",
          note: "비실명 가능",
        }),
      ],
    },
  ],
});

// ---- 027 한국씨티 ----

/** 2자리 숫자 코드 범위를 0-padded 문자열 배열로 펼친다 (e.g. 60~69 → ["60",...,"69"]). */
function expandTwoDigitRange(from: number, to: number): readonly string[] {
  const codes: string[] = [];
  for (let n = from; n <= to; n += 1) {
    codes.push(n.toString().padStart(2, "0"));
  }
  return codes;
}

/**
 * 통합씨티 13자리 ('06.7.18) 과 (구)한미 11자리 가 공유하는 과목 set.
 * PDF "(구)한미 — 통합씨티와 동일" 명시.
 */
const integratedCitiSubjects: readonly Subject[] = [
  defineSubject({ code: "01", category: "ordinary" }),
  defineSubject({ code: "11", category: "ordinary" }),
  defineSubject({ code: "21", category: "ordinary" }),
  defineSubject({ code: "25", category: "ordinary" }),
  defineSubject({ code: "31", category: "ordinary" }),
  defineSubject({ code: "42", category: "ordinary" }),
  defineSubject({ code: "51", category: "ordinary" }),
  defineSubject({ code: "71", category: "ordinary" }),
  defineSubject({ code: "81", category: "ordinary" }),
  defineSubject({ code: "23", category: "treasury" }),
  defineSubject({ code: "05", category: "savings" }),
  defineSubject({ code: "06", category: "savings" }),
  defineSubject({ code: "15", category: "savings" }),
  defineSubject({ code: "26", category: "savings" }),
  defineSubject({ code: "29", category: "savings" }),
  defineSubject({ code: "07", category: "free-savings" }),
  defineSubject({ code: "27", category: "free-savings" }),
  defineSubject({ code: "55", category: "free-savings" }),
  defineSubject({ code: "03", category: "current" }),
  defineSubject({ code: "13", category: "current" }),
  defineSubject({ code: "33", category: "current" }),
  defineSubject({ code: "41", category: "current" }),
  defineSubject({ code: "43", category: "current" }),
  defineSubject({ code: "53", category: "current" }),
  defineSubject({ code: "63", category: "current" }),
  defineSubject({ code: "24", category: "corporate-free" }),
  defineSubject({
    code: "99",
    category: "household-current",
    label: "가계종합",
  }),
  defineSubject({ code: "91", category: "linked" }),
  defineSubject({ code: "92", category: "linked" }),
];

/**
 * (053) 구 씨티은행 10자리 과목 set. PDF 명세 광범위 코드를 카테고리별 range 로 펼친다.
 *
 * - 보통: 20·21·32·34·36~38·42·46·70·71·73~78·80·81·83·84~88·91~96·99
 * - 저축: 30·33·35·41·43~45·50~58·63·64
 * - 자유저축: 60~69
 * - 당좌: 00~19
 * - 기업자유: 59
 * - 가계종합: 40, 48
 */
const formerCitiSubjects: readonly Subject[] = [
  ...["20", "21", "32", "34", "36", "37", "38", "42", "46", "70", "71"].map((code) =>
    defineSubject({ code, category: "ordinary" }),
  ),
  ...expandTwoDigitRange(73, 78).map((code) => defineSubject({ code, category: "ordinary" })),
  ...["80", "81", "83"].map((code) => defineSubject({ code, category: "ordinary" })),
  ...expandTwoDigitRange(84, 88).map((code) => defineSubject({ code, category: "ordinary" })),
  ...expandTwoDigitRange(91, 96).map((code) => defineSubject({ code, category: "ordinary" })),
  defineSubject({ code: "99", category: "ordinary" }),
  ...["30", "33", "35", "41"].map((code) => defineSubject({ code, category: "savings" })),
  ...expandTwoDigitRange(43, 45).map((code) => defineSubject({ code, category: "savings" })),
  ...expandTwoDigitRange(50, 58).map((code) => defineSubject({ code, category: "savings" })),
  ...["63", "64"].map((code) => defineSubject({ code, category: "savings" })),
  // 자유저축: 60~69 중 63·64 는 저축으로 분류 (PDF 중복 표기) 되어 제외.
  ...["60", "61", "62", "65", "66", "67", "68", "69"].map((code) =>
    defineSubject({ code, category: "free-savings" }),
  ),
  ...expandTwoDigitRange(0, 19).map((code) => defineSubject({ code, category: "current" })),
  defineSubject({ code: "59", category: "corporate-free" }),
  defineSubject({
    code: "40",
    category: "household-current",
    label: "가계종합",
  }),
  defineSubject({
    code: "48",
    category: "household-current",
    label: "가계종합",
  }),
];

const citi = defineInstitution({
  id: "citi",
  code: "027",
  aliasCodes: ["036", "053"],
  nameKo: "한국씨티은행",
  nameEn: "Citibank Korea",
  category: "bank",
  aliases: ["씨티", "Citi", "씨티은행"],
  priority: 15,
  patterns: [
    {
      template: T("X-XXXXXX-XX-X"),
      kind: "new",
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["5", "0"],
      subjectPosition: { start: 0, length: 1 },
      subjects: [
        defineSubject({ code: "5", category: "ordinary" }),
        defineSubject({
          code: "0",
          category: "household-current",
          label: "가계종합",
        }),
      ],
    },
    {
      template: T("X-XXXXXX-X-XX-XX"),
      kind: "new",
      subjectPosition: { start: 8, length: 2 },
      subjects: [
        defineSubject({ code: "25", category: "ordinary" }),
        defineSubject({ code: "41", category: "current" }),
        defineSubject({ code: "24", category: "corporate-free" }),
        defineSubject({
          code: "18",
          category: "installment",
          label: "기업금융 적금",
        }),
      ],
      effectiveFrom: "2008-10-06",
    },
    {
      template: T("XXX-XXXXX-XX-X-XX"),
      kind: "new",
      subjectPosition: { start: 8, length: 2 },
      subjects: integratedCitiSubjects,
      effectiveFrom: "2006-07-18",
    },
    // 과목 set 은 통합씨티 13d 와 동일 (PDF "(구)한미 — 통합씨티와 동일" 명시).
    {
      template: T("XXX-XXXXX-XX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 8, length: 2 },
      subjects: integratedCitiSubjects,
      note: "(구)한미은행",
    },
    {
      template: T("XX-XX-XXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 2, length: 2 },
      subjects: formerCitiSubjects,
      note: "(구) 053 씨티은행",
    },
  ],
});

// ---- 031 iM뱅크 (구 대구은행) ----

const imBank = defineInstitution({
  id: "im-bank",
  code: "031",
  nameKo: "iM뱅크",
  nameEn: "iM Bank",
  category: "bank",
  aliases: ["대구은행", "iM뱅크", "iM", "DGB", "iM bank"],
  priority: 40,
  patterns: [
    {
      template: T("XX-XXXXXXXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 2 },
      identifiers: ["91", "92", "93", "94", "96"],
      subjectPosition: { start: 0, length: 2 },
      subjects: [
        defineSubject({ code: "91", category: "ordinary" }),
        defineSubject({ code: "92", category: "ordinary" }),
        defineSubject({ code: "93", category: "ordinary" }),
        defineSubject({ code: "94", category: "ordinary" }),
        defineSubject({ code: "96", category: "ordinary" }),
      ],
    },
    // 재형(524) 등 3자리 prefix 입금만은 본 패턴(2자리 과목) 으로 매핑 불가.
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "05", category: "ordinary" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
        // 입금만 (출금이체 등록 불가)
        defineSubject({
          code: "19",
          category: "installment",
          label: "근로자우대",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "20",
          category: "savings",
          label: "비과세장기",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "21",
          category: "installment",
          label: "가계우대정기적금",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "25",
          category: "installment",
          label: "상호부금",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "27",
          category: "savings",
          label: "평생저축",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "28",
          category: "installment",
          label: "장기주택마련",
          allowsWithdrawal: false,
        }),
      ],
    },
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["505", "508", "502", "501", "504"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "505", category: "ordinary" }),
        defineSubject({ code: "508", category: "savings" }),
        defineSubject({ code: "502", category: "household-current" }),
        defineSubject({ code: "501", category: "current" }),
        defineSubject({ code: "504", category: "corporate-free" }),
      ],
    },
    // 점번호 범위 비공개라 identifier 미사용; 과목 매칭만으로 신뢰도 medium 유지.
    // 하나 외환 통합 14d 와 prefix 충돌 회피 → HANA_FOREIGN_LEGACY_PREFIXES 제외.
    {
      template: T("XXX-XX-XXXXXX-XXX"),
      kind: "new",
      subjectPosition: { start: 3, length: 2 },
      additionalRules: [(d) => d.length === 14 && !HANA_FOREIGN_LEGACY_PREFIXES.has(d.slice(0, 3))],
      subjects: [
        defineSubject({ code: "05", category: "ordinary" }),
        defineSubject({ code: "91", category: "ordinary" }),
        defineSubject({ code: "92", category: "ordinary" }),
        defineSubject({ code: "93", category: "ordinary" }),
        defineSubject({ code: "94", category: "ordinary" }),
        defineSubject({ code: "96", category: "ordinary" }),
        defineSubject({ code: "06", category: "savings" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXX-XXXXXXXXXX-X"),
      kind: "virtual",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["937", "938", "999"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({
          code: "937",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2023-08-01",
        }),
        defineSubject({
          code: "938",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2026-03-24",
        }),
        defineSubject({
          code: "999",
          category: "ordinary",
          virtual: true,
          effectiveFrom: "2026-03-24",
        }),
      ],
    },
  ],
});

// ---- 032 부산은행 ----

const busan = defineInstitution({
  id: "busan",
  code: "032",
  nameKo: "부산은행",
  nameEn: "Busan Bank",
  category: "bank",
  aliases: ["부산", "BNK부산"],
  priority: 40,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({
          code: "11",
          category: "savings",
          label: "국민주청약 저축예금",
        }),
        defineSubject({ code: "12", category: "free-savings" }),
        defineSubject({ code: "03", category: "household-current" }),
        defineSubject({ code: "09", category: "current" }),
        defineSubject({ code: "13", category: "corporate-free" }),
      ],
    },
    {
      // PDF row 헤더 "13" 자리지만 박스가 12 개로 검증 자리 누락된 표기 → 13자리화.
      template: T("XXX-XXXX-XXXXX-X"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["101", "102", "112", "103", "109", "113"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "101", category: "ordinary" }),
        defineSubject({ code: "102", category: "savings" }),
        defineSubject({ code: "112", category: "free-savings" }),
        defineSubject({ code: "103", category: "household-current" }),
        defineSubject({ code: "109", category: "current" }),
        defineSubject({ code: "113", category: "corporate-free" }),
      ],
      effectiveFrom: "2012-01-25",
    },
  ],
});

// ---- 034 광주은행 ----

const gwangju = defineInstitution({
  id: "gwangju",
  code: "034",
  nameKo: "광주은행",
  nameEn: "Gwangju Bank",
  category: "bank",
  aliases: ["광주", "광주은행", "JB광주"],
  priority: 25,
  patterns: [
    {
      template: T("XXX-XXX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 3, length: 3 },
      subjects: [
        defineSubject({ code: "107", category: "ordinary" }),
        defineSubject({ code: "108", category: "ordinary" }),
        defineSubject({ code: "109", category: "treasury" }),
        defineSubject({ code: "121", category: "savings" }),
        defineSubject({ code: "123", category: "savings" }),
        defineSubject({ code: "124", category: "savings" }),
        defineSubject({ code: "122", category: "free-savings" }),
        defineSubject({ code: "103", category: "household-current" }),
        defineSubject({ code: "101", category: "current" }),
        defineSubject({ code: "127", category: "corporate-free" }),
        defineSubject({
          code: "716",
          category: "isa",
          label: "ISA",
          allowsWithdrawal: false,
          note: "출금이체 불가",
        }),
      ],
    },
    {
      template: T("XXX-XXX-XXXXXX"),
      kind: "old",
      identifierPosition: { start: 3, length: 3 },
      identifiers: ["731"],
      subjectPosition: { start: 3, length: 3 },
      subjects: [
        defineSubject({
          code: "731",
          category: "linked",
          effectiveFrom: "2012-03-23",
        }),
      ],
      validatesCheckDigit: false,
      note: "체크디지트 검증 X",
    },
    {
      template: T("X-XXX-XXXXXXXX-X"),
      kind: "new",
      subjectPosition: { start: 1, length: 3 },
      subjects: [
        defineSubject({ code: "107", category: "ordinary" }),
        defineSubject({ code: "109", category: "ordinary" }),
        defineSubject({ code: "121", category: "savings" }),
        defineSubject({ code: "103", category: "household-current" }),
        defineSubject({ code: "101", category: "current" }),
        defineSubject({ code: "127", category: "corporate-free" }),
      ],
      effectiveFrom: "2016-11-07",
    },
  ],
});

// ---- 035 제주 ----

const jeju = defineInstitution({
  id: "jeju",
  code: "035",
  nameKo: "제주은행",
  nameEn: "Jeju Bank",
  category: "bank",
  aliases: ["제주"],
  priority: 15,
  patterns: [
    {
      template: T("XX-XX-XXXXX-X"),
      kind: "old",
      subjectPosition: { start: 2, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "03", category: "free-savings" }),
        defineSubject({ code: "04", category: "household-current" }),
        defineSubject({ code: "05", category: "current" }),
        defineSubject({ code: "13", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXX-XXXXXX-XXX"),
      kind: "new",
      identifierRange: { from: 700, to: 779 },
      identifierPosition: { start: 0, length: 3 },
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "700", category: "ordinary" }),
        defineSubject({ code: "701", category: "ordinary" }),
        defineSubject({ code: "702", category: "ordinary" }),
        defineSubject({ code: "770", category: "savings" }),
        defineSubject({ code: "769", category: "free-savings" }),
        defineSubject({ code: "711", category: "household-current" }),
        defineSubject({ code: "713", category: "current" }),
        defineSubject({ code: "707", category: "corporate-free" }),
      ],
      effectiveFrom: "2021-07-27",
    },
  ],
});

// ---- 037 전북 ----

const jeonbuk = defineInstitution({
  id: "jeonbuk",
  code: "037",
  nameKo: "전북은행",
  nameEn: "Jeonbuk Bank",
  category: "bank",
  aliases: ["전북", "JB전북"],
  priority: 20,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "02", category: "ordinary" }),
        defineSubject({ code: "13", category: "ordinary" }),
        defineSubject({ code: "15", category: "treasury" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "22", category: "savings" }),
        defineSubject({ code: "35", category: "savings" }),
        defineSubject({ code: "37", category: "savings" }),
        defineSubject({ code: "03", category: "household-current" }),
        defineSubject({ code: "12", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "11", category: "current" }),
        defineSubject({ code: "23", category: "corporate-free" }),
        defineSubject({ code: "36", category: "corporate-free" }),
      ],
    },
    {
      template: T("X-XXX-XX-XXXXXX-X"),
      kind: "new",
      identifierPosition: { start: 1, length: 3 },
      identifiers: ["013", "021", "012", "011", "023"],
      subjectPosition: { start: 1, length: 3 },
      subjects: [
        defineSubject({ code: "013", category: "ordinary" }),
        defineSubject({ code: "021", category: "savings" }),
        defineSubject({ code: "012", category: "household-current" }),
        defineSubject({ code: "011", category: "current" }),
        defineSubject({ code: "023", category: "corporate-free" }),
      ],
      effectiveFrom: "2013-09-16",
    },
  ],
});

// ---- 039 경남 ----

const gyeongnam = defineInstitution({
  id: "gyeongnam",
  code: "039",
  nameKo: "경남은행",
  nameEn: "Gyeongnam Bank",
  category: "bank",
  aliases: ["경남", "BNK경남"],
  priority: 30,
  patterns: [
    {
      template: T("XXX-XX-XXXXXX"),
      kind: "old",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "07", category: "ordinary" }),
        defineSubject({ code: "09", category: "treasury" }),
        defineSubject({ code: "20", category: "other", label: "일일BEST" }),
        defineSubject({ code: "21", category: "savings" }),
        defineSubject({ code: "22", category: "free-savings" }),
        defineSubject({
          code: "32",
          category: "corporate-free",
          label: "기업BEST",
        }),
        defineSubject({ code: "03", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "35", category: "corporate-free" }),
      ],
    },
    {
      template: T("XXX-XXXXXXXXX-X"),
      kind: "new",
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
          category: "corporate-free",
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

// ---- 054 HSBC ----

const hsbc = defineInstitution({
  id: "hsbc",
  code: "054",
  nameKo: "HSBC은행",
  nameEn: "HSBC",
  category: "bank",
  aliases: ["HSBC"],
  priority: 5,
  patterns: [
    {
      template: T("XXX-XXXXX-X-XXX"),
      kind: "new",
      subjectPosition: { start: 9, length: 3 },
      note: "서비스 미참가 — 메타데이터 only",
    },
  ],
});

const deutsche = defineInstitution({
  id: "deutsche",
  code: "055",
  nameKo: "도이치은행",
  nameEn: "Deutsche Bank",
  category: "bank",
  aliases: ["도이치"],
  priority: 5,
  patterns: [{ template: T("XXXXXXXXXX"), kind: "new" }],
});

const jpmc = defineInstitution({
  id: "jpmc",
  code: "057",
  nameKo: "JP모간체이스은행",
  nameEn: "JPMorgan Chase Bank",
  category: "bank",
  aliases: ["JPM", "JP모간", "JPMorgan", "체이스"],
  priority: 5,
  patterns: [{ template: T("XXXXXXXXXX"), kind: "new" }],
});

const boa = defineInstitution({
  id: "boa",
  code: "060",
  nameKo: "BOA은행",
  nameEn: "Bank of America",
  category: "bank",
  aliases: ["BOA", "Bank of America"],
  priority: 5,
  patterns: [
    {
      template: T("XXXX-XXXXX-XX-X"),
      kind: "new",
      effectiveFrom: "2012-07-16",
    },
    { template: T("XXXX-XXXXXXXXXX"), kind: "new" },
  ],
});

const bnpParibas = defineInstitution({
  id: "bnp-paribas",
  code: "061",
  nameKo: "비엔피파리바은행",
  nameEn: "BNP Paribas",
  category: "bank",
  aliases: ["BNP", "BNP파리바"],
  priority: 5,
  patterns: [
    {
      template: T("XXXXX-XXXXXX-XXX"),
      kind: "new",
      effectiveFrom: "2019-01-21",
      note: "서비스 미참가",
    },
  ],
});

// ---- 081 하나증권 CMA ----
// CMS 참가자 namespace 에서 은행 code 081 을 사용 → 은행 section 에 등록.
// 270 하나증권 (증권사 카테고리) 과는 별개 institution.

const hanaSecuritiesCma = defineInstitution({
  id: "hana-securities-cma",
  code: "081",
  nameKo: "하나증권 CMA",
  nameEn: "Hana Securities CMA",
  category: "bank",
  aliases: ["하나증권 CMA", "하나증권CMA"],
  priority: 25,
  patterns: [
    // identifier 를 두면 하나 외환 14d 정상 입력을 흡수해 (외환) 매칭이 깨지므로
    // additionalRules 두 개로 분리: (1) 일련 첫자리 "9" 고정 (PDF 명시),
    // (2) 점번호가 하나 외환 통합 prefix set 에 없을 것 → hana-cma score 8 vs
    // 외환 score 7 → 외환 우선.
    {
      template: T("XXX-XXXXXXXX-X-XX"),
      kind: "new",
      additionalRules: [
        (d) => d.length === 14 && d[3] === "9",
        (d) => d.length === 14 && !HANA_FOREIGN_LEGACY_PREFIXES.has(d.slice(0, 3)),
      ],
      subjectPosition: { start: 12, length: 2 },
      subjects: [
        defineSubject({ code: "05", category: "ordinary" }),
        defineSubject({ code: "07", category: "savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "01", category: "current" }),
        defineSubject({ code: "04", category: "corporate-free" }),
        defineSubject({
          code: "94",
          category: "ordinary",
          virtual: true,
          label: "증권가상",
        }),
        defineSubject({
          code: "37",
          category: "ordinary",
          virtual: true,
          label: "일반가상",
        }),
        defineSubject({ code: "60", category: "isa" }),
      ],
      note: "CMA 계좌만 가능, 평생계좌 자동이체 등록 불가",
    },
  ],
});

// ---- 088 신한은행 (021 조흥 / 026 신한 통합) ----

const shinhan = defineInstitution({
  id: "shinhan",
  code: "088",
  aliasCodes: ["021", "026", "028"],
  nameKo: "신한은행",
  nameEn: "Shinhan Bank",
  category: "bank",
  aliases: ["신한", "조흥은행"],
  priority: 95,
  successorOf: ["chohung", "shinhan-legacy"],
  patterns: [
    {
      template: T("XXX-XXX-XXXXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: [
        "100",
        "101",
        "102",
        "103",
        "104",
        "105",
        "106",
        "107",
        "108",
        "109",
        "160",
        "161",
        "110",
        "111",
        "112",
        "113",
        "114",
        "115",
        "116",
        "117",
        "118",
        "119",
        "120",
        "121",
        "122",
        "123",
        "124",
        "125",
        "126",
        "127",
        "128",
        "129",
        "130",
        "131",
        "132",
        "133",
        "134",
        "135",
        "136",
        "137",
        "138",
        "139",
        "140",
        "141",
        "142",
        "143",
        "144",
        "145",
        "146",
        "147",
        "148",
        "149",
        "150",
        "151",
        "152",
        "153",
        "154",
        "155",
        "156",
        "157",
        "158",
        "159",
        "268",
        "269",
        "298",
      ],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        ...["100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "160", "161"].map(
          (code) => defineSubject({ code, category: "ordinary" }),
        ),
        ...[
          "110",
          "111",
          "112",
          "113",
          "114",
          "115",
          "116",
          "117",
          "118",
          "119",
          "120",
          "121",
          "122",
          "123",
          "124",
          "125",
          "126",
          "127",
          "128",
          "129",
          "130",
          "131",
          "132",
          "133",
          "134",
          "135",
          "136",
          "137",
          "138",
          "139",
        ].map((code) => defineSubject({ code, category: "savings" })),
        ...["140", "141", "142", "143", "144", "145", "146", "147", "148", "149"].map((code) =>
          defineSubject({ code, category: "corporate-free" }),
        ),
        ...["150", "151", "152", "153", "154"].map((code) =>
          defineSubject({ code, category: "current" }),
        ),
        ...["155", "156", "157", "158", "159"].map((code) =>
          defineSubject({ code, category: "household-current" }),
        ),
        defineSubject({
          code: "268",
          category: "isa",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "269",
          category: "isa",
          allowsWithdrawal: false,
        }),
        defineSubject({
          code: "298",
          category: "installment",
          label: "청년희망펀드",
          allowsWithdrawal: false,
        }),
      ],
      effectiveFrom: "2006-10-09",
    },
    {
      template: T("XXX-XXX-XXXXXXX-X"),
      kind: "virtual",
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "560", category: "ordinary", virtual: true }),
        defineSubject({ code: "561", category: "ordinary", virtual: true }),
        defineSubject({ code: "562", category: "ordinary", virtual: true }),
      ],
    },
    {
      template: T("XXX-XX-XXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "09", category: "ordinary" }),
        defineSubject({ code: "61", category: "ordinary" }),
        defineSubject({ code: "04", category: "savings" }),
        defineSubject({ code: "05", category: "savings" }),
        defineSubject({ code: "06", category: "free-savings" }),
        defineSubject({ code: "08", category: "free-savings" }),
        defineSubject({ code: "02", category: "household-current" }),
        defineSubject({ code: "07", category: "current" }),
        defineSubject({ code: "03", category: "corporate-free" }),
      ],
      note: "(구)조흥(021)",
    },
    {
      template: T("XXX-XX-XXXXXXX-X"),
      kind: "virtual",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "81", category: "ordinary", virtual: true }),
        defineSubject({ code: "82", category: "ordinary", virtual: true }),
      ],
      note: "(구)조흥(021) 가상계좌",
    },
    {
      template: T("XXX-XX-XXXXX-X"),
      kind: "merged-legacy",
      subjectPosition: { start: 3, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "11", category: "savings" }),
        defineSubject({ code: "13", category: "savings" }),
        defineSubject({ code: "12", category: "free-savings" }),
        defineSubject({ code: "03", category: "household-current" }),
        defineSubject({ code: "04", category: "current" }),
        defineSubject({ code: "05", category: "corporate-free" }),
      ],
      note: "(구)신한(026)",
    },
    {
      template: T("XXX-XX-XXXXX-X"),
      kind: "virtual",
      subjectPosition: { start: 3, length: 2 },
      subjects: [defineSubject({ code: "99", category: "ordinary", virtual: true })],
      note: "(구)신한(026) 가상계좌",
    },
    {
      template: T("XXX-XXX-XXXXXXX-X"),
      kind: "virtual",
      subjectPosition: { start: 3, length: 3 },
      subjects: [defineSubject({ code: "901", category: "ordinary", virtual: true })],
      note: "(구)신한(026) 가상계좌 14d",
    },
  ],
});

// ---- 089 K뱅크 ----

const kbank = defineInstitution({
  id: "kbank",
  code: "089",
  nameKo: "K뱅크",
  nameEn: "K Bank",
  category: "bank",
  aliases: ["K뱅크", "케이뱅크", "Kbank"],
  priority: 65,
  patterns: [
    {
      template: T("X-XXXXXXXXX"),
      kind: "incoming-only",
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["9"],
      branchRule: kbank10First9,
      note: "비대면 실명인증 시 입금전용",
    },
    // PDF: 13자리 `일련번호(2)-휴대폰번호(3-4-4)` — 특정 prefix 명시 없음.
    {
      template: T("XXX-XXX-XXXXXXX"),
      kind: "new",
    },
    // branchRule: 7/9 prefix → 간편송금 가상, 그 외 → 여신
    {
      template: T("XXX-XXXX-XXX-XXXX"),
      kind: "virtual",
      branchRule: kbank14First79,
    },
  ],
});

// ---- 090 카카오뱅크 ----

const kakao = defineInstitution({
  id: "kakao",
  code: "090",
  nameKo: "카카오뱅크",
  nameEn: "KakaoBank",
  category: "bank",
  aliases: ["카카오", "카카오뱅크", "kakaobank"],
  priority: 90,
  patterns: [
    // PDF: `업무구분(1)-상품구분(3)-일련번호(9)` = 13d. 식별 prefix 는 enumerate 되지 않음.
    {
      template: T("XXXX-XX-XXXXXXX"),
      kind: "new",
    },
  ],
});

// ---- 092 토스뱅크 ----

const toss = defineInstitution({
  id: "toss",
  code: "092",
  nameKo: "토스뱅크",
  nameEn: "Toss Bank",
  category: "bank",
  aliases: ["토스", "토스뱅크"],
  priority: 75,
  patterns: [
    // PDF: `과목번호(3)-일련번호(8)-검증번호(1)`. 보통:100 / 기업자유:150.
    {
      template: T("XXXX-XXXX-XXXX"),
      kind: "new",
      identifierPosition: { start: 0, length: 3 },
      identifiers: ["100", "150"],
      subjectPosition: { start: 0, length: 3 },
      subjects: [
        defineSubject({ code: "100", category: "ordinary" }),
        defineSubject({ code: "150", category: "corporate-free" }),
      ],
      effectiveFrom: "2021-10-05",
    },
    // PDF: "17 또는 19-일련번호(10)" 가상계좌. 신협 12d 적금(170~178) 과
    // prefix 가 겹치므로 subject 도 enumerate 해 score 동률을 만든 뒤 priority
    // (토스 75 > 신협 40) 로 토스가 1순위가 되도록 한다.
    {
      template: T("XXXX-XXXX-XXXX"),
      kind: "virtual",
      identifierPosition: { start: 0, length: 2 },
      identifiers: ["17", "19"],
      subjectPosition: { start: 0, length: 2 },
      subjects: [
        defineSubject({ code: "17", category: "ordinary", virtual: true }),
        defineSubject({ code: "19", category: "ordinary", virtual: true }),
      ],
      branchRule: toss12First1719,
      effectiveFrom: "2023-08-01",
    },
  ],
});

export const BANKS = [
  kdb,
  ibk,
  kb,
  hana,
  suhyup,
  nh,
  woori,
  sc,
  citi,
  imBank,
  busan,
  gwangju,
  jeju,
  jeonbuk,
  gyeongnam,
  hsbc,
  deutsche,
  jpmc,
  boa,
  bnpParibas,
  hanaSecuritiesCma,
  shinhan,
  kbank,
  kakao,
  toss,
] as const;
