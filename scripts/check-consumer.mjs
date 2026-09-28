// Test the shipped artifact, not a rebuild against each consumer's peers.
// An npm alias provides the last public release for API/type/behavior comparison.
import assert from "node:assert/strict";
import spawn from "cross-spawn";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const typescript = process.env.CONSUMER_TYPESCRIPT ?? pkg.devDependencies.typescript;
assert.match(typescript, /^\^?\d+\.\d+\.\d+$/);
const runtimeOnly = process.env.CONSUMER_RUNTIME_ONLY === "true";
const legacyEsm = typescript === "5.1.6";
const selected = process.argv.slice(2);
const cases = selected.length
  ? selected
  : legacyEsm
    ? ["arktype@2.1.0", "arktype@^2"]
    : [
        "none",
        "zod@3.23.0",
        "zod@^3",
        "zod@4.0.0",
        "zod@^4",
        "valibot@1.0.0",
        "valibot@^1",
        "yup@1.4.0",
        "yup@^1",
        "arktype@2.1.0",
        "arktype@^2",
      ];
for (const peer of cases) {
  assert.match(peer, /^(none|(?:zod|valibot|yup|arktype)@\^?\d+(?:\.\d+){0,2})$/);
}

function run(command, args, cwd) {
  const result = spawn.sync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env, npm_config_update_notifier: "false" },
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.error ?? ""}${result.stdout}${result.stderr}`,
    );
  }
  return result.stdout;
}

// Deliberately include a space to exercise Windows .cmd argument escaping.
const temp = mkdtempSync(join(tmpdir(), "korean-account consumer-"));
try {
  const tarball = join(temp, "package.tgz");
  run("pnpm", ["pack", "--out", tarball], root);
  for (const peer of cases) {
    const cwd = mkdtempSync(join(temp, "case-"));
    writeFileSync(join(cwd, "package.json"), JSON.stringify({ private: true, type: "module" }));
    run(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--omit=peer",
        "--no-audit",
        "--no-fund",
        "--package-lock=false",
        tarball,
        "korean-account-baseline@npm:korean-account@0.3.0",
        ...(runtimeOnly ? [] : [`typescript@${typescript}`]),
        ...(peer === "none" ? [] : [peer]),
        // ArkType's own declarations refer to NodeJS and buffer types.
        ...(!runtimeOnly && peer.startsWith("arktype@") ? ["@types/node@^22"] : []),
      ],
      cwd,
    );

    const adapter = peer === "none" ? null : peer.split("@")[0];
    const entries = ["", "/standard-schema", ...(adapter ? [`/${adapter}`] : [])];
    const checks = `
      import assert from "node:assert/strict";
      import { createRequire } from "node:module";
      const require = createRequire(import.meta.url);
      const entries = ${JSON.stringify(entries)};
      const adapter = ${JSON.stringify(adapter)};
      const json = value => JSON.parse(JSON.stringify(value));
      const account = "110-436-387740";
      for (const mode of ["import", "require"]) {
        const load = name => mode === "import" ? import(name) : require(name);
        for (const entry of entries) {
          const current = await load("korean-account" + entry);
          const baseline = await load("korean-account-baseline" + entry);
          const keys = value => Object.keys(value).filter(key => key !== "__esModule").sort();
          assert.deepEqual(keys(current), keys(baseline), mode + entry + " exports");
          if (!entry) {
            for (const input of [account, "3333-12-3456789", "1002-123-456789", "12345", "", "000000000000"]) {
              assert.deepEqual(json(current.detect(input)), json(baseline.detect(input)));
              assert.deepEqual(json(current.detectBest(input)), json(baseline.detectBest(input)));
            }
            assert.deepEqual(json(current.institutions), json(baseline.institutions));
            assert.equal(current.normalizeAccount(account), "110436387740");
            assert.equal(current.createDetector([current.kb, current.shinhan]).detect(account)[0]?.institution.id, "shinhan");
          } else {
            const lib = entry.slice(1);
            const validator = lib === "valibot" ? await load("valibot") : null;
            const accepts = (schema, value) => {
              if (lib === "standard-schema") return !schema["~standard"].validate(value).issues;
              if (lib === "zod") return schema.safeParse(value).success;
              if (lib === "valibot") return validator.safeParse(schema, value).success;
              if (lib === "yup") return schema.isValidSync(value);
              return schema.allows(value);
            };
            const valid = {
              accountSchema: account, institutionIdSchema: "shinhan", accountKindSchema: "new", subjectCategorySchema: "savings",
              detectionSchema: { institutionId: "shinhan", kind: "new", score: 14, confidence: "high", formatted: account,
                capabilities: { allowsWithdrawal: true, virtual: false, validatedCheckDigit: null } },
            };
            for (const [name, value] of Object.entries(valid)) {
              assert.equal(accepts(current[name], value), true, mode + entry + name);
              for (const input of [value, undefined, null, 42, "invalid"]) {
                assert.equal(accepts(current[name], input), accepts(baseline[name], input));
              }
            }
          }
        }
      }
      const currentPackage = require("korean-account/package.json");
      const previousPackage = require("korean-account-baseline/package.json");
      for (const field of ["exports", "typesVersions", "engines", "peerDependencies", "peerDependenciesMeta", "sideEffects"]) {
        assert.deepEqual(currentPackage[field], previousPackage[field], field);
      }
      assert.equal(Object.keys(currentPackage.dependencies ?? {}).length, 0);
      for (const other of ["zod", "valibot", "yup", "arktype"].filter(name => name !== adapter)) {
        assert.throws(() => require.resolve(other), { code: "MODULE_NOT_FOUND" });
      }
    `;
    writeFileSync(join(cwd, "runtime.mjs"), checks);
    run(process.execPath, ["runtime.mjs"], cwd);

    if (runtimeOnly) {
      console.log(`✓ packed consumer: ${peer} (ESM, CJS; Node ${process.versions.node})`);
      continue;
    }

    const types =
      entries
        .map(
          (entry, index) => `
          import * as current${index} from "korean-account${entry}";
          import * as previous${index} from "korean-account-baseline${entry}";
          const backward${index}: ${entry ? `typeof previous${index}` : `Omit<typeof previous${index}, "searchInstitutions">`} = current${index};
          const forward${index}: ${entry ? `typeof current${index}` : `Omit<typeof current${index}, "searchInstitutions">`} = previous${index};
          export { backward${index}, forward${index} };
        `,
        )
        .join("\n") +
      // TS cannot relate unresolved conditional types from two copies of the
      // registry. Instantiate search's categories before comparing signatures.
      ["bank", "non-bank", "securities", "clearing", "bank | securities"]
        .map((category, index) => {
          const type = category
            .split(" | ")
            .map((value) => JSON.stringify(value))
            .join(" | ");
          return `
            const searchBackward${index}: typeof previous0.searchInstitutions<${type}> = current0.searchInstitutions<${type}>;
            const searchForward${index}: typeof current0.searchInstitutions<${type}> = previous0.searchInstitutions<${type}>;
            export { searchBackward${index}, searchForward${index} };
          `;
        })
        .join("\n");
    for (const extension of ["mts", "cts"]) {
      writeFileSync(join(cwd, `consumer.${extension}`), types);
      writeFileSync(
        join(cwd, `current.${extension}`),
        entries
          .map((entry, index) => `export * as entry${index} from "korean-account${entry}";`)
          .join("\n"),
      );
    }
    for (const [module, resolution] of [
      ["Node16", "Node16"],
      ["NodeNext", "NodeNext"],
      [legacyEsm ? "ESNext" : "Preserve", "Bundler"],
    ]) {
      writeFileSync(
        join(cwd, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            strict: true,
            noEmit: true,
            // ArkType recommends skipLibCheck; its own declarations produce
            // errors on TS 5.1. Preserve that existing ESM consumer setup.
            // All modern compiler cases still check dependencies strictly.
            skipLibCheck: legacyEsm,
            target: "ES2022",
            lib: ["ES2023", "DOM"],
            types: adapter === "arktype" ? ["node"] : [],
            module,
            moduleResolution: resolution,
          },
          // 0.3.0's ArkType CJS declaration fails in the frozen Node16 model.
          // Strictly check the fixed artifact here; compare with 0.3.0 in
          // NodeNext and Bundler, where its declarations already work.
          include: legacyEsm
            ? ["consumer.mts"]
            : adapter === "arktype" && resolution === "Node16"
              ? ["current.mts", "current.cts"]
              : ["consumer.mts", "consumer.cts"],
        }),
      );
      run("npm", ["exec", "--", "tsc", "--project", "tsconfig.json"], cwd);
    }
    console.log(
      `✓ packed consumer: ${peer} (ESM, CJS runtime; ${legacyEsm ? "TS 5.1 ESM types" : "ESM/CJS types"}, Node16, NodeNext, Bundler; 0.3.0 compatible)`,
    );
  }
} finally {
  rmSync(resolve(temp), { recursive: true, force: true });
}
