// Moves declaration files from the dts build's isolated outDir into dist and
// removes everything else it emitted. See the header of tsdown.config.ts for
// why the dts build cannot share dist directly.

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

const declarations = globSync(join(from, "**/*.d.{ts,cts}"));
if (declarations.length < 12) {
  console.error(
    `collect-dts: expected declarations for all six entries, found ${declarations.length}`,
  );
  process.exit(1);
}

for (const file of declarations) {
  const target = join(to, basename(file));
  if (basename(file) === "arktype.d.ts") {
    // ESM already resolves ArkType as an import. Keep its declaration readable
    // by TS 5.1/5.2, before import attributes became stable in TS 5.3.
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
