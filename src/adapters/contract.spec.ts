import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { MESSAGES } from "./contract";

const CONTRACT_SOURCE = readFileSync(new URL("./contract.ts", import.meta.url), "utf8");

/** Maps each message key to the `@default` text in the JSDoc right above it. */
function documentedDefaults(source: string): Record<string, string> {
  const defaults: Record<string, string> = {};
  const memberPattern = /\/\*\*((?:(?!\*\/)[\s\S])*?)\*\/\s*readonly (\w+): string;/g;
  for (const [, doc = "", key = ""] of source.matchAll(memberPattern)) {
    const documented = /@default "([^"]*)"/.exec(doc)?.[1];
    if (documented !== undefined) defaults[key] = documented;
  }
  return defaults;
}

describe("MESSAGES 와 JSDoc @default", () => {
  test("모든 메시지 키의 JSDoc @default 가 실제 기본 메시지와 같다", () => {
    // Given
    const source = CONTRACT_SOURCE;

    // When
    const defaults = documentedDefaults(source);

    // Then
    expect(defaults).toEqual(MESSAGES);
  });
});
