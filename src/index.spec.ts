import { expect, test } from "vitest";
import * as publicApi from "./index";
import * as schemaApi from "./schema";

// 이 스냅샷이 "기존 유저에게 영향 없음" 을 기계로 보증한다. export 가 하나라도
// 사라지거나 이름이 바뀌면 실패한다. 의도한 추가라면 `pnpm test -u` 로 갱신한다.
test("korean-account 의 공개 export", () => {
  expect(Object.keys(publicApi).sort()).toMatchSnapshot();
});

test("korean-account/schema 의 공개 export", () => {
  expect(Object.keys(schemaApi).sort()).toMatchSnapshot();
});
