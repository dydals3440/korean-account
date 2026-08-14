import { defineConfig } from "tsdown";

// The registry must live in its own chunk so `sideEffects: false` works at
// module granularity. In a shared chunk, the 57 top-level
// `defineInstitution(...)` calls prevent the bundler from proving purity, and
// a consumer importing only `normalize` would receive the full registry.
//
// Trap 1: the `helpers` group must precede `registry` (groups match in order),
//         or pure helpers get pulled into the registry chunk.
// Trap 2: never set `includeDependenciesRecursively: false` — it creates an
//         index <-> registry cyclic chunk that crashes with a TDZ on import.
// Trap 3: `institution-ids.ts` must stay out of both groups (zod-adapter only).
//
// Regression guard: byte budgets in .size-limit.json
const PURE_HELPER_MODULES =
  /src[\\/](?:core[\\/](?:pattern-template|subjects|confidence|template-length|define-institution)\.ts$|registry[\\/](?:rules|expand-range)\.ts$)/;

const REGISTRY_MODULES = /src[\\/]registry[\\/](banks|non-banks|securities|index)\.ts$/;

const ENTRY = {
  index: "src/index.ts",
  schema: "src/adapters/zod/index.ts",
};

// JS and d.ts are built separately. tsdown generates d.ts inside the ESM pass,
// and `codeSplitting.groups` applied to d.ts emits broken declarations that
// import a never-emitted `helpers-*.d.ts` (reproduced on 0.22.0 / 0.22.4).
// publint misses this; attw catches it.
export default defineConfig([
  {
    entry: ENTRY,
    format: ["esm", "cjs"],
    dts: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
    platform: "neutral",
    // Paired with `engines.node`. Without it, source-level syntax leaks through.
    target: "es2020",
    deps: { neverBundle: ["zod"] },
    outputOptions: {
      codeSplitting: {
        groups: [
          { name: "helpers", test: PURE_HELPER_MODULES },
          { name: "registry", test: REGISTRY_MODULES },
        ],
      },
    },
  },
  {
    entry: ENTRY,
    format: ["esm", "cjs"],
    // declarationMap stays off — `.d.ts.map` would point at `../src/*.ts`
    // paths that are not published, silently breaking go-to-definition.
    dts: { emitDtsOnly: true, sourcemap: false },
    clean: false,
    platform: "neutral",
    deps: { neverBundle: ["zod"] },
    attw: { profile: "strict" },
    publint: true,
  },
]);
