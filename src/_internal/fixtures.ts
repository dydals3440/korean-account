import type { InstitutionId } from "../data";
import type { AccountKind, SubjectCategory } from "../types";

/** 단일 fixture — 입력 + 1순위 institution 기대값 + (있으면) kind/subject 기대값. */
export interface Fixture {
  readonly input: string;
  readonly id: InstitutionId;
  readonly kind?: AccountKind;
  readonly subjectCategory?: SubjectCategory;
}

/**
 * 기관별 대표 계좌번호 모음.
 *
 * detectAccount.spec.ts 의 자동 매칭 loop가 가드한다. `subjectCategory` 는 명시된
 * fixture만 검증한다 (모든 fixture가 subject를 갖는 건 아님).
 */
export const FIXTURES = [
  // ===== 시중·인터넷전문 은행 =====
  {
    input: "110-436-387740",
    id: "shinhan",
    kind: "new",
    subjectCategory: "savings",
  },
  {
    input: "130-123-456789",
    id: "shinhan",
    kind: "new",
    subjectCategory: "savings",
  },
  {
    input: "160-123-456789",
    id: "shinhan",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "1002-123-456789",
    id: "woori",
    kind: "new",
    subjectCategory: "savings",
  },
  {
    input: "1006-123-456789",
    id: "woori",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "611-123456-789",
    id: "hana",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "620-123456-789",
    id: "hana",
    kind: "new",
    subjectCategory: "savings",
  },
  { input: "161-910278-72907", id: "hana", kind: "merged-legacy" },
  {
    input: "301-1234-5678-90",
    id: "nh",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "302-1234-5678-90",
    id: "nh",
    kind: "new",
    subjectCategory: "savings",
  },
  {
    input: "351-1234-5678-09",
    id: "nh-coop",
    kind: "new",
    subjectCategory: "ordinary",
  },
  // 끝자리(계좌구분) 변형은 보통/저축 prefix 일 때 kind 영향 없음 회귀 가드.
  {
    input: "351-1234-5678-01",
    id: "nh-coop",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "352-1234-5678-03",
    id: "nh-coop",
    kind: "new",
    subjectCategory: "savings",
  },
  // 카카오 4자리 prefix (3333/7979), K뱅크 100 prefix, 토스 4자리 prefix (1000/1500),
  // 농협중앙 11d fallback 은 PDF 외 보강 → 컨슈머 (teacher-web) 측 회귀 spec 에서 검증.
  { input: "1712-3456-7890", id: "toss", kind: "virtual" },
  { input: "1912-3456-7890", id: "toss", kind: "virtual" },
  // 농협은행 13d 차세대 적금 (입금만 가능). 과목 304 → installment, 출금 불가.
  {
    input: "304-1234-5678-99",
    id: "nh",
    kind: "incoming-only",
    subjectCategory: "installment",
  },
  // 농협은행 13d 차세대 신탁 (입금만 가능). 과목 031 → trust, 출금 불가.
  {
    input: "031-1234-5678-99",
    id: "nh",
    kind: "incoming-only",
    subjectCategory: "trust",
  },
  // 농협중앙회 13d 차세대 적금. 과목 354 → installment.
  {
    input: "354-1234-5678-99",
    id: "nh-coop",
    kind: "incoming-only",
    subjectCategory: "installment",
  },
  // 우체국 14d 입금만 가능 — 듬뿍우대저축(05). 출금 불가지만 카테고리는 savings.
  {
    input: "123456-05-12345-6",
    id: "post",
    kind: "incoming-only",
    subjectCategory: "savings",
  },
  // 새마을금고 13d 신 저축 (입금만). prefix 9206 = 저축 206.
  {
    input: "9206-12-3456789",
    id: "kfcc",
    kind: "incoming-only",
    subjectCategory: "savings",
  },
  // 새마을금고 13d 신 적금 (입금만). prefix 9200 = 적금 200.
  {
    input: "9200-12-3456789",
    id: "kfcc",
    kind: "incoming-only",
    subjectCategory: "installment",
  },
  // 신협 12d 적금 prefix 170~178 은 토스 12d 가상 17/19 와 PDF 차원에서 모호 →
  // 라이브러리 fixture 에서 제외. 라이브러리에 패턴은 등록되어 있으므로 명시적
  // include 로 신협을 콕 집어 호출하면 매칭 가능.
  // K뱅크 14d 첫자리 1 → 여신가상계좌 (원리금 납부 입금전용) — 라이브러리만으론
  // 식별자 부재로 IBK 14d 와 score 충돌. teacher-web 회귀 spec 에서 검증.

  // KB 본점 14d 신계좌는 PDF 외 (실세계 prefix) → 컨슈머 회귀 spec 에서 검증.

  // IBK 14d: digits[9:11]="01" → 보통예금 (실제 사용자 보고 계좌)
  {
    input: "318-081775-01-014",
    id: "ibk",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "972-027629-01-013",
    id: "ibk",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "972-027629-04-013",
    id: "ibk",
    kind: "new",
    subjectCategory: "corporate-free",
  },
  {
    input: "972-027629-13-013",
    id: "ibk",
    kind: "new",
    subjectCategory: "savings",
  },
  {
    input: "972-027629-07-013",
    id: "ibk",
    kind: "new",
    subjectCategory: "household-current",
  },
  // 한국씨티 12d 첫자리 3 — 신한 12d (100~169) / 수협중앙 (2/7/9) 와 충돌 회피.
  // digits[8:10]="25" → 보통예금
  {
    input: "3-123456-7-25-08",
    id: "citi",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "3-123456-7-41-08",
    id: "citi",
    kind: "new",
    subjectCategory: "current",
  },
  {
    input: "123-15-67890",
    id: "sc",
    kind: "virtual",
    subjectCategory: "ordinary",
  },
  {
    input: "300-123456-15-78-9",
    id: "woori",
    kind: "merged-legacy",
    subjectCategory: "treasury",
  },
  {
    input: "300-09-456789-0",
    id: "woori",
    kind: "merged-legacy",
    subjectCategory: "linked",
  },
  // (구)한미 11d prefix digits[3:5]="89" — 신한 11d 식별 set 회피.
  {
    input: "300-89012-81-9",
    id: "citi",
    kind: "merged-legacy",
    subjectCategory: "ordinary",
  },
  // (053) 구씨티 10d suffix digits[8:10]="90" — 키움 10d 코드 set 회피.
  {
    input: "30-59-99999-0",
    id: "citi",
    kind: "merged-legacy",
    subjectCategory: "corporate-free",
  },
  {
    input: "300-13-45678-9",
    id: "shinhan",
    kind: "merged-legacy",
    subjectCategory: "savings",
  },
  // 081 하나증권 CMA 14d — 일련 첫자리 "9" 고정 identifier 가 디지트 4번째 위치.
  {
    input: "123-91234567-8-05",
    id: "hana-securities-cma",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "300-16-789012",
    id: "kb-sec",
    kind: "old",
    subjectCategory: "savings",
  },
  {
    input: "200-65-789012",
    id: "kb-sec",
    kind: "old",
    subjectCategory: "savings",
  },
  {
    input: "300-19-456789-0",
    id: "im-bank",
    kind: "old",
    subjectCategory: "installment",
  },
  {
    input: "318-05-123456-789",
    id: "im-bank",
    kind: "new",
    subjectCategory: "ordinary",
  },
  // 부산 13d new — 식별자 101 (보통). 부산 전용 prefix 라 13d 기관과 충돌 없음.
  {
    input: "101-1234-5678-90",
    id: "busan",
    kind: "new",
    subjectCategory: "ordinary",
  },
  // 광주 12d prefix 300 — 수협중앙 (2/7/9) / 우체국 (100~190/530) 회피.
  {
    input: "300-109-45678-9",
    id: "gwangju",
    kind: "old",
    subjectCategory: "treasury",
  },
  {
    input: "500-37-678901",
    id: "jeonbuk",
    kind: "old",
    subjectCategory: "savings",
  },
  {
    input: "220-123456789-0",
    id: "gyeongnam",
    kind: "new",
    subjectCategory: "other",
  },

  // ===== 비은행 =====
  {
    input: "9003-12-3456789",
    id: "kfcc",
    kind: "new",
    subjectCategory: "ordinary",
  },
  // 신협 12d 보통 731 — 다른 12d 기관과 충돌 없는 신협 전용 prefix.
  // (177 저축·170 적금은 토스 12d 가상 17/19 prefix 와 PDF 모호성으로 별첨 기록)
  {
    input: "731-321-98765-4",
    id: "shinhyup",
    kind: "new",
    subjectCategory: "ordinary",
  },

  // ===== 증권사 =====
  {
    input: "1234-5678-11",
    id: "kiwoom",
    kind: "new",
    subjectCategory: "ordinary",
  },
  // 키움 10d ISA 코드 55 — 출금 불가
  {
    input: "1234-5678-55",
    id: "kiwoom",
    kind: "new",
    subjectCategory: "isa",
  },
  {
    input: "1234567-8-23",
    id: "hana-sec",
    kind: "merged-legacy",
    subjectCategory: "savings",
  },
  // 메리츠 구계좌 10d 코드 99 — 하나증권 코드 set과 안 겹침.
  {
    input: "1234-5678-99",
    id: "meritz",
    kind: "old",
    subjectCategory: "corporate-free",
  },
  // 케이프 14d 코드 87 — 87 은 cape 14d (서브번호 포함) 전용 식별 코드.
  {
    input: "123-87-123456-789",
    id: "cape-inv",
    kind: "new",
    subjectCategory: "savings",
  },
] as const satisfies readonly Fixture[];
