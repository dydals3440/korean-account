import type { Institution } from "../../types";

/** Finds an institution by id, representative code or alias code; ids win over codes. */
export function createInstitutionLookup<TInstitution extends Institution>(
  institutions: readonly TInstitution[],
): (idOrCode: string) => TInstitution | null {
  const byId = new Map(institutions.map((institution) => [institution.id, institution]));
  const byCode = new Map<string, TInstitution>();

  for (const institution of institutions) {
    for (const code of [institution.code, ...(institution.aliasCodes ?? [])]) {
      byCode.set(code, institution);
    }
  }

  return (idOrCode) => byId.get(idOrCode) ?? byCode.get(idOrCode) ?? null;
}
