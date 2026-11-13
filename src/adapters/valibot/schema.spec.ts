import * as v from "valibot";

import { describeAdapterContract } from "../contract.fixtures";
import {
  accountKindSchema,
  accountSchema,
  createAccountSchema,
  createDetectionSchema,
  createInstitutionIdSchema,
  detectionSchema,
  institutionIdSchema,
  subjectCategorySchema,
} from "./schema";

describeAdapterContract<v.GenericSchema<unknown>>("valibot", {
  schemas: {
    account: accountSchema,
    institutionId: institutionIdSchema,
    accountKind: accountKindSchema,
    subjectCategory: subjectCategorySchema,
    detection: detectionSchema,
  },
  createAccountSchema,
  createInstitutionIdSchema,
  createDetectionSchema,
  firstIssue: (schema, value) => {
    const result = v.safeParse(schema, value);
    return result.success ? null : (result.issues[0]?.message ?? "");
  },
});
