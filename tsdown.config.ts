import { defineConfig } from "tsdown";

// JS is published unbundled (`unbundle: true` = rolldown preserveModules):
// dist mirrors src at module granularity. Combined with `sideEffects: false`
// and per-call PURE annotations, consumer bundlers drop every institution
// module they don't import — the whole point of the one-file-per-institution
// registry. The exports map (not the file layout) is the public API boundary.
//
// d.ts stays a separate *bundled* build. It writes to its own outDir
// (dist-dts) because under TypeScript 7 the plugin's `emitDtsOnly` fails to
// suppress the CJS JS pass — sharing dist made two builds race on index.cjs
// and intermittently corrupt it. scripts/collect-dts.mjs moves the
// declarations into dist and drops the stray JS; attw (strict) + publint then
// run as explicit build steps (see package.json "build") because they must
// validate the FINAL layout, not the pre-collection one.
//
// Regression guards: byte budgets in .size-limit.json + scripts/check-runtime.mjs.
export default defineConfig([
  {
    entry: [
      "src/index.ts",
      "src/adapters/zod/index.ts",
      "src/adapters/valibot/index.ts",
      "src/adapters/yup/index.ts",
      "src/adapters/arktype/index.ts",
      "src/adapters/standard-schema/index.ts",
    ],
    format: ["esm", "cjs"],
    dts: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    unbundle: true,
    minify: false,
    platform: "neutral",
    // Paired with `engines.node`. Without it, source-level syntax leaks through.
    target: "es2020",
    deps: { neverBundle: ["zod", "valibot", "yup", "arktype"] },
  },
  {
    entry: {
      index: "src/index.ts",
      zod: "src/adapters/zod/index.ts",
      valibot: "src/adapters/valibot/index.ts",
      yup: "src/adapters/yup/index.ts",
      arktype: "src/adapters/arktype/index.ts",
      "standard-schema": "src/adapters/standard-schema/index.ts",
    },
    outDir: "dist-dts",
    format: ["esm", "cjs"],
    // declarationMap stays off — `.d.ts.map` would point at `../src/*.ts`
    // paths that are not published, silently breaking go-to-definition.
    dts: { emitDtsOnly: true, sourcemap: false },
    clean: true,
    platform: "neutral",
    deps: { neverBundle: ["zod", "valibot", "yup", "arktype"] },
  },
]);
