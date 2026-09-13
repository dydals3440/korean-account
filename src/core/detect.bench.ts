import { test } from "vitest";
import { detect } from "./detect";

// Vitest 5 는 최상위 `bench()` 를 걷어내고 테스트 컨텍스트의 `bench` 픽스처로 옮겼다.
// `bench(...)` 는 실행이 아니라 등록만 하고, `bench.compare(...)` 가 모아서 돌리며
// 같은 표에 결과를 나란히 찍는다 — 케이스별 상대 비용을 바로 읽을 수 있다.
test("detect benchmark", async ({ bench }) => {
  await bench.compare(
    bench("신한 신계좌 12자리 (high confidence)", () => {
      detect("110-436-387740");
    }),
    bench("IBK 14자리 신계좌 (high confidence)", () => {
      detect("318-081775-01-014");
    }),
    bench("농협 13자리 가상계좌 분기", () => {
      detect("351-1234-5678-01");
    }),
    bench("토스 12자리 가상 분기 (17-prefix)", () => {
      detect("1712-3456-7890");
    }),
    bench("매칭 없는 14자리 입력", () => {
      detect("99999999999999");
    }),
    bench("부분 입력 7자리 (저격 단계)", () => {
      detect("3333-12");
    }),
  );
});
