import { expect, test } from "vitest";
import * as publicApi from "./index";
import * as schemaApi from "./adapters/zod";

// This snapshot mechanically guarantees "no impact on existing users": it
// fails if any export disappears or is renamed. For an intentional addition,
// refresh with `pnpm test -u`.
test("korean-account 의 공개 export", () => {
  expect(Object.keys(publicApi).toSorted()).toMatchSnapshot();
});

test("korean-account/schema 의 공개 export", () => {
  expect(Object.keys(schemaApi).toSorted()).toMatchSnapshot();
});
