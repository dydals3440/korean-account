import type { Type } from "arktype";
import type * as v from "valibot";
import { describe, expectTypeOf, test } from "vitest";
import type { InferType } from "yup";
import type { z } from "zod";

import type { InstitutionId } from "../registry/institution-ids";
import type { AccountKind, DetectionPayload, SubjectCategory } from "../types";
import * as arktype from "./arktype";
import * as standard from "./standard-schema";
import * as valibot from "./valibot";
import * as yup from "./yup";
import * as zod from "./zod";

const CUSTOM_IDS = ["my-bank", "my-coop"] as const;
type CustomId = (typeof CUSTOM_IDS)[number];

describe("zod 어댑터 추론 타입", () => {
  test("accountSchema 의 입력과 출력은 모두 string 이다", () => {
    expectTypeOf<z.input<typeof zod.accountSchema>>().toEqualTypeOf<string>();
    expectTypeOf<z.infer<typeof zod.accountSchema>>().toEqualTypeOf<string>();
  });

  test("리터럴 스키마의 출력은 해당 유니온이다", () => {
    expectTypeOf<z.infer<typeof zod.institutionIdSchema>>().toEqualTypeOf<InstitutionId>();
    expectTypeOf<z.infer<typeof zod.accountKindSchema>>().toEqualTypeOf<AccountKind>();
    expectTypeOf<z.infer<typeof zod.subjectCategorySchema>>().toEqualTypeOf<SubjectCategory>();
  });

  test("detectionSchema 의 출력은 DetectionPayload 다", () => {
    expectTypeOf<z.infer<typeof zod.detectionSchema>>().toEqualTypeOf<
      DetectionPayload<InstitutionId>
    >();
  });

  test("팩토리는 넘긴 기관 ID 로 출력 타입을 좁힌다", () => {
    const ids = zod.createInstitutionIdSchema(CUSTOM_IDS);
    const detection = zod.createDetectionSchema(CUSTOM_IDS);
    expectTypeOf<z.infer<typeof ids>>().toEqualTypeOf<CustomId>();
    expectTypeOf<z.infer<typeof detection>>().toEqualTypeOf<DetectionPayload<CustomId>>();
  });
});

describe("valibot 어댑터 추론 타입", () => {
  test("accountSchema 의 입력과 출력은 모두 string 이다", () => {
    expectTypeOf<v.InferInput<typeof valibot.accountSchema>>().toEqualTypeOf<string>();
    expectTypeOf<v.InferOutput<typeof valibot.accountSchema>>().toEqualTypeOf<string>();
  });

  test("detectionSchema 와 팩토리 출력은 DetectionPayload 다", () => {
    const detection = valibot.createDetectionSchema(CUSTOM_IDS);
    expectTypeOf<v.InferOutput<typeof valibot.detectionSchema>>().toEqualTypeOf<
      DetectionPayload<InstitutionId>
    >();
    expectTypeOf<v.InferOutput<typeof detection>>().toEqualTypeOf<DetectionPayload<CustomId>>();
  });
});

describe("yup 어댑터 추론 타입", () => {
  test("accountSchema 출력은 string 이다", () => {
    expectTypeOf<InferType<typeof yup.accountSchema>>().toEqualTypeOf<string>();
  });

  test("detectionSchema 와 팩토리 출력은 DetectionPayload 다", () => {
    const detection = yup.createDetectionSchema(CUSTOM_IDS);
    expectTypeOf<InferType<typeof yup.detectionSchema>>().toEqualTypeOf<
      DetectionPayload<InstitutionId>
    >();
    expectTypeOf<InferType<typeof detection>>().toEqualTypeOf<DetectionPayload<CustomId>>();
  });
});

describe("arktype 어댑터 추론 타입", () => {
  test("accountSchema 출력은 string 이다", () => {
    expectTypeOf<typeof arktype.accountSchema>().toEqualTypeOf<Type<string>>();
    expectTypeOf<(typeof arktype.accountSchema)["infer"]>().toEqualTypeOf<string>();
  });

  test("detectionSchema 와 팩토리 출력은 DetectionPayload 다", () => {
    const detection = arktype.createDetectionSchema(CUSTOM_IDS);
    expectTypeOf<(typeof arktype.detectionSchema)["infer"]>().toEqualTypeOf<
      DetectionPayload<InstitutionId>
    >();
    expectTypeOf<(typeof detection)["infer"]>().toEqualTypeOf<DetectionPayload<CustomId>>();
  });
});

describe("standard-schema 어댑터 추론 타입", () => {
  test("accountSchema 의 입력과 출력은 모두 string 이다", () => {
    type Schema = typeof standard.accountSchema;
    expectTypeOf<standard.StandardSchemaV1.InferInput<Schema>>().toEqualTypeOf<string>();
    expectTypeOf<standard.StandardSchemaV1.InferOutput<Schema>>().toEqualTypeOf<string>();
  });

  test("detectionSchema 와 팩토리 출력은 DetectionPayload 다", () => {
    const detection = standard.createDetectionSchema(CUSTOM_IDS);
    expectTypeOf<
      standard.StandardSchemaV1.InferOutput<typeof standard.detectionSchema>
    >().toEqualTypeOf<DetectionPayload<InstitutionId>>();
    expectTypeOf<standard.StandardSchemaV1.InferOutput<typeof detection>>().toEqualTypeOf<
      DetectionPayload<CustomId>
    >();
  });
});
