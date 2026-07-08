import type { Institution, InstitutionCategory } from "../types";
import { BANKS } from "./banks";
import { NON_BANKS } from "./nonBanks";
import { SECURITIES } from "./securities";

/** 등록된 모든 institution. */
export const institutions = [...BANKS, ...NON_BANKS, ...SECURITIES] as const;

/** 등록된 institution 의 union. */
export type RegisteredInstitution = (typeof institutions)[number];

/** 등록된 institution id 의 union. */
export type InstitutionId = RegisteredInstitution["id"];

/** 등록된 institution 대표 code 의 union. */
export type InstitutionCode = RegisteredInstitution["code"];

/**
 * 특정 카테고리에 속한 institution id 들의 union.
 *
 * @example
 * type BankId = InstitutionIdByCategory<"bank">;        // "kdb" | "ibk" | ...
 * type SecId  = InstitutionIdByCategory<"securities">;  // "yuanta" | "kb-sec" | ...
 * type Both   = InstitutionIdByCategory<"bank" | "securities">;
 */
export type InstitutionIdByCategory<C extends InstitutionCategory> = Extract<
  RegisteredInstitution,
  { category: C }
>["id"];

// pure 어노테이션이 없으면 번들러가 이 최상위 초기화를 side effect 로 보고
// `institutions` 를 통째로 유지한다. 조회 헬퍼를 안 쓰는 소비자를 위해 명시한다.
const BY_ID = /* @__PURE__ */ new Map<string, RegisteredInstitution>(
  institutions.map((i) => [i.id, i]),
);

const BY_CODE = /* @__PURE__ */ (() => {
  const map = new Map<string, RegisteredInstitution>();
  for (const i of institutions) {
    map.set(i.code, i);
    if (i.aliasCodes) for (const code of i.aliasCodes) map.set(code, i);
  }
  return map;
})();

/**
 * id 로 institution 조회. 없으면 null.
 *
 * 등록된 id literal (`InstitutionId`) 을 직접 넘기면 반환 타입이 그 id 의
 * institution 으로 좁혀진다.
 *
 * @example
 * const shinhan = institutionById("shinhan");
 * shinhan?.id; // "shinhan" (literal)
 */
export function institutionById<Id extends InstitutionId>(
  id: Id,
): Extract<RegisteredInstitution, { id: Id }> | null;
export function institutionById(id: string): Institution | null;
export function institutionById(id: string): Institution | null {
  return BY_ID.get(id) ?? null;
}

/**
 * 3자리 CMS 표준 코드로 institution 조회 — 대표 / alias 모두 매칭.
 *
 * 등록된 대표 code (`InstitutionCode`) 를 넘기면 반환 타입이 좁혀진다. alias
 * 코드는 string 으로 넘어가 일반 `Institution | null` 로 반환.
 *
 * @example
 * institutionByCode("088"); // 신한 (대표 code, literal narrow)
 * institutionByCode("078"); // KB국민 (alias — wide Institution | null)
 */
export function institutionByCode<Code extends InstitutionCode>(
  code: Code,
): Extract<RegisteredInstitution, { code: Code }> | null;
export function institutionByCode(code: string): Institution | null;
export function institutionByCode(code: string): Institution | null {
  return BY_CODE.get(code) ?? null;
}

export { defineInstitution } from "./defineInstitution";
