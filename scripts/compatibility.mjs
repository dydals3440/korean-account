import assert from "node:assert/strict";

/** Apply only explicitly reviewed metadata changes to the public baseline. */
export function applyRegistryChanges(registry, changes) {
  const expected = structuredClone(registry);
  for (const change of changes) {
    const institution = expected.find((entry) => entry.id === change.id);
    assert(institution, `Unknown correction institution: ${change.id}`);
    let parent = institution;
    for (const key of change.path.slice(0, -1)) parent = parent[key];
    const key = change.path.at(-1);
    if (change.operation === "add") {
      assert(!Object.hasOwn(parent, key), `${change.id}.${change.path} already exists`);
    } else {
      assert.deepEqual(parent[key], change.before, `${change.id}.${change.path} baseline drift`);
    }
    if (change.operation === "remove") delete parent[key];
    else parent[key] = structuredClone(change.after);
  }
  return expected;
}
