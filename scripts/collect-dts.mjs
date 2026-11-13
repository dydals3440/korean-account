// Moves declarations from the isolated dts build (see tsdown.config.ts) into dist/.

import { copyFileSync, existsSync, globSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const from = join(root, "dist-dts");
const to = join(root, "dist");

if (!existsSync(from)) {
  console.error("collect-dts: dist-dts not found — did the dts build run?");
  process.exit(1);
}

const ENTRY_NAMES = ["index", "zod", "valibot", "yup", "arktype", "standard-schema"];

const declarations = globSync(join(from, "**/*.d.{ts,cts}"));
const names = declarations.map((file) => basename(file));

const missing = ENTRY_NAMES.flatMap((entry) => [`${entry}.d.ts`, `${entry}.d.cts`]).filter(
  (name) => !names.includes(name),
);
if (missing.length > 0) {
  console.error(`collect-dts: missing entry declarations: ${missing.join(", ")}`);
  process.exit(1);
}

const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
if (duplicates.length > 0) {
  console.error(`collect-dts: declarations would overwrite each other: ${duplicates.join(", ")}`);
  process.exit(1);
}

for (const file of declarations) {
  const target = join(to, basename(file));
  if (basename(file) === "arktype.d.ts") {
    // ESM already resolves ArkType as an import; drop the attribute TS 5.1/5.2 cannot read.
    const declaration = readFileSync(file, "utf8");
    const query = 'import("arktype", { with: { "resolution-mode": "import" } })';
    if (!declaration.includes(query)) throw new Error("ArkType declaration query changed");
    writeFileSync(target, declaration.replaceAll(query, 'import("arktype")'));
  } else {
    copyFileSync(file, target);
  }
}
rmSync(from, { recursive: true, force: true });
console.log(`collect-dts: moved ${declarations.length} declaration files into dist/`);
