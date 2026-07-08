import type { Institution } from "../types";
import { templateLength } from "./templateLength";

/**
 * detect 의 후보 institution 을 빠르게 좁히는 인덱스.
 *
 * 입력 digits 의 길이에 부합하는 패턴을 가진 institution 만 골라 평가하도록
 * 미리 length → institution[] 매핑을 만든다. 60개 × 평균 3패턴 ≈ 180회
 * scorePattern 호출이 평균 ~10회 수준으로 감소.
 *
 * institution 한 곳에 다양한 자릿수 패턴이 공존할 수 있으므로 같은
 * institution 이 여러 length 버킷에 등장할 수 있다. 그러나 detect 내부에선
 * `Set` 으로 중복을 제거해 한 번만 평가한다.
 *
 * length 가 템플릿보다 ±1 인 부분 입력에 대비해, `near` (length ± 1) 도
 * 함께 묶어 둔다.
 */
export interface DetectorIndex<I extends Institution> {
  /** length-1 / length+1 까지 포함 (부분 입력 매칭용). */
  byLengthNear(length: number): readonly I[];
}

export function buildDetectorIndex<I extends Institution>(
  institutions: readonly I[],
): DetectorIndex<I> {
  const exact = new Map<number, I[]>();
  for (const institution of institutions) {
    const lengths = new Set<number>();
    for (const pattern of institution.patterns) {
      lengths.add(templateLength(pattern.template));
    }
    for (const length of lengths) {
      let bucket = exact.get(length);
      if (!bucket) {
        bucket = [];
        exact.set(length, bucket);
      }
      bucket.push(institution);
    }
  }

  const byLengthNear = (length: number): readonly I[] => {
    const seen = new Set<I>();
    for (const offset of [-1, 0, 1]) {
      const bucket = exact.get(length + offset);
      if (!bucket) {
        continue;
      }
      for (const institution of bucket) {
        seen.add(institution);
      }
    }
    return Array.from(seen);
  };

  return { byLengthNear };
}
