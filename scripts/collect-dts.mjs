// Moves declaration files from the dts build's isolated outDir into dist and
// removes everything else it emitted. See the header of tsdown.config.ts for
// why the dts build cannot share dist directly.

import { copyFileSync, existsSync, globSync, rmSync } from "node:fs";
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
  copyFileSync(file, join(to, basename(file)));
}
rmSync(from, { recursive: true, force: true });
console.log(`collect-dts: moved ${declarations.length} declaration files into dist/`);
