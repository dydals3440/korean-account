import { defineConfig } from "oxlint";

type RestrictedImportsRule = ["error", { patterns: { group: string[]; message: string }[] }];

/** Forbids imports matching `groups` with a message that names the violated layer rule. */
const restrictImports = (groups: string[], layerRule: string): RestrictedImportsRule => [
  "error",
  { patterns: [{ group: groups, message: `Layer rule: ${layerRule}. See CONTRIBUTING.md.` }] },
];

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import"],
  ignorePatterns: ["dist", "dist-dts", "coverage", ".changeset"],
  categories: {
    correctness: "error",
    suspicious: "warn",
  },
  rules: {
    eqeqeq: "error",
    "no-nested-ternary": "error",
    "no-param-reassign": "error",
    "import/no-cycle": "error",
    "typescript/consistent-type-definitions": ["error", "interface"],
    "typescript/consistent-type-imports": "error",
    "typescript/explicit-module-boundary-types": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-non-null-assertion": "error",
    "unicorn/filename-case": ["error", { case: "kebabCase" }],
    "unicorn/no-useless-fallback-in-spread": "error",
  },
  overrides: [
    {
      files: ["src/types/**", "src/constants.ts"],
      rules: {
        "no-restricted-imports": restrictImports(
          [
            "**/core",
            "**/core/**",
            "**/registry",
            "**/registry/**",
            "**/builtin/**",
            "**/adapters/**",
          ],
          "types and constants import nothing but each other",
        ),
      },
    },
    {
      files: ["src/core/**"],
      rules: {
        "no-restricted-imports": restrictImports(
          ["**/registry", "**/registry/**", "**/builtin/**", "**/adapters/**", "**/deprecated"],
          "core works on any institution list and never imports the registry",
        ),
      },
    },
    {
      files: ["src/registry/**"],
      rules: {
        "no-restricted-imports": restrictImports(
          [
            "**/builtin/**",
            "**/adapters/**",
            "**/core/account/**",
            "**/core/detector/**",
            "**/core/lookup/**",
            "**/core/labels",
          ],
          "registry data imports only core/define",
        ),
      },
    },
    {
      files: ["src/builtin/**"],
      rules: {
        "no-restricted-imports": restrictImports(
          ["**/adapters/**"],
          "builtin never imports adapters",
        ),
      },
    },
    {
      files: ["src/adapters/**"],
      rules: {
        "no-restricted-imports": restrictImports(
          [
            "**/core/**",
            "**/builtin/**",
            "**/deprecated",
            "**/registry",
            "**/registry/*",
            "!**/registry/institution-ids",
          ],
          "adapters import only types, constants and registry/institution-ids",
        ),
      },
    },
    {
      files: ["**/*.spec.ts", "**/*.bench.ts", "**/*.fixtures.ts"],
      rules: {
        "no-restricted-imports": "off",
        "typescript/no-non-null-assertion": "off",
        "unicorn/consistent-function-scoping": "off",
        "no-useless-concat": "off",
      },
    },
  ],
});
