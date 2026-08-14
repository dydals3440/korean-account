import type { InstitutionId } from "../registry";
import type { AccountKind, SubjectCategory } from "../types";

/** Single fixture — input + expected top-ranked institution + optional kind/subject expectations. */
export interface Fixture {
  readonly input: string;
  readonly id: InstitutionId;
  readonly kind?: AccountKind;
  readonly subjectCategory?: SubjectCategory;
}

/**
 * Representative account numbers per institution.
 *
 * Guarded by the automatic matching loop in detectAccount.spec.ts.
 * `subjectCategory` is verified only for fixtures that state it (not every
 * fixture carries a subject).
 */
export const FIXTURES = [
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
  { input: "3333-12-3456789", id: "kakao", kind: "new" },
  { input: "7979-01-2345678", id: "kakao", kind: "new" },
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
    input: "301-1234-5678-91",
    id: "nh",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "302-1234-5678-91",
    id: "nh",
    kind: "new",
    subjectCategory: "savings",
  },
  {
    input: "351-1234-5678-03",
    id: "nh-coop",
    kind: "new",
    subjectCategory: "ordinary",
  },
  // Regression guard: varying the last digit (계좌구분) must not affect kind for ordinary/savings prefixes.
  {
    input: "351-1234-5678-04",
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
  // Kakao 4-digit prefixes (3333/7979), K Bank 100 prefix, Toss 4-digit
  // prefixes (1000/1500), and the NH federation 11d fallback are non-PDF
  // augmentations → verified by the consumer (teacher-web) regression specs.
  { input: "1712-3456-7890", id: "toss", kind: "virtual" },
  { input: "1912-3456-7890", id: "toss", kind: "virtual" },
  // NH Bank 13d next-gen installment savings (deposit-only). Subject 304 → installment, no withdrawal.
  {
    input: "304-1234-5678-91",
    id: "nh",
    kind: "incoming-only",
    subjectCategory: "installment",
  },
  // NH Bank 13d next-gen trust (deposit-only). Subject 031 → trust, no withdrawal.
  {
    input: "031-1234-5678-91",
    id: "nh",
    kind: "incoming-only",
    subjectCategory: "trust",
  },
  // NH federation 13d next-gen installment savings. Subject 354 → installment.
  {
    input: "354-1234-5678-93",
    id: "nh-coop",
    kind: "incoming-only",
    subjectCategory: "installment",
  },
  // Post office 14d deposit-only — preferential savings (05). No withdrawal, but the category stays savings.
  {
    input: "123456-05-12345-6",
    id: "post",
    kind: "incoming-only",
    subjectCategory: "savings",
  },
  // KFCC 13d new savings (deposit-only). Prefix 9206 = savings 206.
  {
    input: "9206-12-3456789",
    id: "kfcc",
    kind: "incoming-only",
    subjectCategory: "savings",
  },
  // KFCC 13d new installment savings (deposit-only). Prefix 9200 = installment 200.
  {
    input: "9200-12-3456789",
    id: "kfcc",
    kind: "incoming-only",
    subjectCategory: "installment",
  },
  // Shinhyup 12d installment prefixes 170~178 are ambiguous with Toss 12d
  // virtual 17/19 at the PDF level → excluded from library fixtures. The
  // pattern is still registered, so an explicit include targeting Shinhyup
  // can match it.
  // K Bank 14d first digit 1 → loan virtual account (principal/interest,
  // deposit-only) — with the library alone it ties with IBK 14d for lack of
  // an identifier. Verified in the teacher-web regression spec.

  // KB head-office 14d new accounts are non-PDF (real-world prefix) → verified in consumer regression specs.

  // IBK 14d: digits[9:11]="01" → ordinary deposit (account reported by a real user).
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
  // Citi 12d first digit 3 — avoids collisions with Shinhan 12d (100~169) and
  // Suhyup federation (2/7/9). digits[8:10]="25" → ordinary deposit.
  {
    input: "3-127086-7-25-08",
    id: "citi",
    kind: "new",
    subjectCategory: "ordinary",
  },
  {
    input: "3-127086-7-41-08",
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
  // Former KorAm 11d prefix digits[3:5]="89" — avoids Shinhan's 11d identifier set.
  {
    input: "300-89012-81-9",
    id: "citi",
    kind: "merged-legacy",
    subjectCategory: "ordinary",
  },
  // (053) former Citi 10d suffix digits[8:10]="90" — avoids Kiwoom's 10d code set.
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
  // 081 Hana Securities CMA 14d — the fixed "9" serial-first-digit identifier sits at digit index 3.
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
  // Busan 13d new — identifier 101 (ordinary). Busan-only prefix, so no collision with other 13d institutions.
  {
    input: "101-1234-5678-90",
    id: "busan",
    kind: "new",
    subjectCategory: "ordinary",
  },
  // Gwangju 12d prefix 300 — avoids Suhyup federation (2/7/9) and post office (100~190/530).
  {
    input: "300-109-45678-9",
    id: "gwangju",
    kind: "old",
    subjectCategory: "treasury",
  },
  {
    input: "500-23-678901-2",
    id: "jeonbuk",
    kind: "old",
    subjectCategory: "corporate-free",
  },
  {
    input: "220-123456789-0",
    id: "gyeongnam",
    kind: "new",
    subjectCategory: "other",
  },

  {
    input: "9003-12-3456789",
    id: "kfcc",
    kind: "new",
    subjectCategory: "ordinary",
  },
  // Shinhyup 12d ordinary 731 — Shinhyup-only prefix with no 12d collisions.
  // (177 savings / 170 installment are recorded separately: PDF-ambiguous with Toss 12d virtual 17/19.)
  {
    input: "731-321-98765-4",
    id: "shinhyup",
    kind: "new",
    subjectCategory: "ordinary",
  },

  {
    input: "1234-5678-11",
    id: "kiwoom",
    kind: "new",
    subjectCategory: "ordinary",
  },
  // Kiwoom 10d ISA code 55 — no withdrawal.
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
  // Meritz legacy 10d code 99 — does not overlap Hana Securities' code set.
  {
    input: "1234-5678-99",
    id: "meritz",
    kind: "old",
    subjectCategory: "corporate-free",
  },
  // Cape 14d code 87 — 87 identifies only the cape 14d (sub-number) pattern.
  {
    input: "123-87-123456-789",
    id: "cape-inv",
    kind: "new",
    subjectCategory: "savings",
  },
] as const satisfies readonly Fixture[];
