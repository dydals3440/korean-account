import { cmsServices, defineInstitution, defineSubject, patternTemplate } from "../../core/define";
import type { Subject } from "../../types";
import { REGULAR_ACCOUNT_SERVICES } from "../cms-service-presets";

const kbSubjectsOld12: Subject[] = [
  defineSubject({ code: "01", category: "ordinary" }),
  defineSubject({ code: "21", category: "savings" }),
  defineSubject({ code: "24", category: "free-savings" }),
  defineSubject({ code: "05", category: "household-current" }),
  defineSubject({ code: "04", category: "current" }),
  defineSubject({ code: "25", category: "corporate-free" }),
  defineSubject({ code: "26", category: "linked" }),
];

export const kb = defineInstitution({
  id: "kb",
  code: "004",
  aliasCodes: ["006", "019", "029", "078", "079"],
  nameKo: "KB국민은행",
  nameEn: "KB Kookmin Bank",
  category: "bank",
  aliases: ["국민", "국민은행", "KB", "KB국민"],
  userBaseMillions: 32,
  patterns: [
    {
      template: patternTemplate("XXX-XXX-XXXX"),
      kind: "incoming-only",
      services: cmsServices("directCredit"),
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["0"],
      note: "고객지정/핸드폰 입금 전용",
    },
    /** p.1 11자리 0-고객지정번호(10): 고객지정계좌·핸드폰, 입금만 가능. */
    {
      template: patternTemplate("XXX-XXXX-XXXX"),
      kind: "incoming-only",
      services: cmsServices("directCredit"),
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["0"],
    },
    /** p.1 11자리 9-고객지정번호(10): 고객지정·평생계좌, 자유입출금식 온라인예금 가능. */
    {
      template: patternTemplate("XXX-XXXX-XXXX"),
      kind: "lifetime",
      services: REGULAR_ACCOUNT_SERVICES,
      identifierPosition: { start: 0, length: 1 },
      identifiers: ["9"],
    },
    {
      template: patternTemplate("XXX-XX-XXXX-XX-X"),
      kind: "old",
      services: cmsServices("virtualAccount", "directDebit", "directCredit", "additionalServices"),
      subjectPosition: { start: 3, length: 2 },
      subjects: kbSubjectsOld12,
    },
    {
      template: patternTemplate("XXXX-XX-XXXXXXX-X"),
      kind: "virtual",
      services: cmsServices("virtualAccount", "directCredit", "additionalServices"),
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
      template: patternTemplate("XXXX-XX-XXXXX-X"),
      kind: "merged-legacy",
      services: REGULAR_ACCOUNT_SERVICES,
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({ code: "06", category: "household-current" }),
        defineSubject({ code: "18", category: "current" }),
      ],
      note: "(구)주택 12자리",
    },
    {
      template: patternTemplate("XXXX-XX-XXXXXXX-X"),
      kind: "merged-legacy",
      services: cmsServices("virtualAccount", "directDebit", "directCredit", "additionalServices"),
      subjectPosition: { start: 4, length: 2 },
      subjects: [
        defineSubject({ code: "01", category: "ordinary" }),
        defineSubject({ code: "02", category: "savings" }),
        defineSubject({ code: "25", category: "free-savings" }),
        defineSubject({ code: "37", category: "corporate-free" }),
        defineSubject({
          code: "90",
          category: "linked",
          note: "국민은행과 CMS 제공계약을 체결한 업체가 발행한 계좌만 이용 가능",
        }),
      ],
      note: "(구)주택 14자리",
    },
  ],
});
