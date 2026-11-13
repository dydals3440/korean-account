import { test } from "vitest";

import { createDetector } from "../core/detector/create-detector";
import { kb, shinhan, toss } from "../registry";
import { detect } from "./detect";

const scopedDetector = createDetector([kb, shinhan, toss]);

test("detect benchmark", async ({ bench }) => {
  await bench.compare(
    bench("신한 12자리 (전체 레지스트리)", () => {
      detect("110-436-387740");
    }),
    bench("지역농협 13자리", () => {
      detect("351-1234-5678-13");
    }),
    bench("토스 12자리 가상계좌", () => {
      detect("1712-3456-7890");
    }),
    bench("매칭 없는 14자리", () => {
      detect("99999999999999");
    }),
    bench("타이핑 중 7자리", () => {
      detect("3333-123");
    }),
    bench("짧은 입력 3자리", () => {
      detect("110");
    }),
    bench("필터 옵션", () => {
      detect("110-436-387740", { categories: ["bank"], limit: 3 });
    }),
    bench("스코프 detector (3개 기관)", () => {
      scopedDetector.detect("110-436-387740");
    }),
  );
});
