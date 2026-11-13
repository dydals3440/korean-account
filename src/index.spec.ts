import { expect, test } from "vitest";

import * as publicApi from ".";
import * as schemaApi from "./adapters/zod";

// Fails if any export disappears or is renamed; refresh with `pnpm test -u` for an intentional addition.
// Titles are snapshot keys — renaming one orphans its snapshot.
test("korean-account 의 공개 export", () => {
  // Given
  const moduleExports = publicApi;

  // When
  const exportNames = Object.keys(moduleExports).toSorted();

  // Then
  expect(exportNames).toMatchSnapshot();
});

test("korean-account/schema 의 공개 export", () => {
  // Given
  const moduleExports = schemaApi;

  // When
  const exportNames = Object.keys(moduleExports).toSorted();

  // Then
  expect(exportNames).toMatchSnapshot();
});
