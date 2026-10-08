import { defineConfig } from "tsdown";

// Preserve module boundaries so consumer bundlers can drop unused institutions.
// Declarations use a separate directory to avoid the TS7 CJS emission race;
// collect-dts moves only declarations before attw and publint validate dist.
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
