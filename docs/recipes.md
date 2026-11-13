[문서 목록](./README.md) · [빠른 시작](../README.md)

# 통합 예제

실제 화면과 서버에 붙이는 예제입니다. 프레임워크 코드는 최소한으로 줄였고, 실명조회 API·저장소 같은 애플리케이션 의존성은 인자로 주입합니다. 함수의 정확한 동작은 [API 레퍼런스](./api.md)에 있습니다.

| 주제      | 예제                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 권장 흐름 | [후보 제시 → 사용자 확정 → 유료 실명조회](#후보-제시--사용자-확정--유료-실명조회)                                            |
| 폼        | [형식 검증과 기관 안내](#형식-검증과-기관-안내) · [React Hook Form](#react-hook-form) · [TanStack Form](#tanstack-form)      |
| 입력 UI   | [입력 중 후보 표시](#입력-중-후보-표시) · [입력 중 포맷팅](#입력-중-포맷팅) · [shadcn/ui 은행 Select](#shadcnui-은행-select) |
| 업무 규칙 | [자동이체 등록 전 출금 가능 확인](#자동이체-등록-전-출금-가능-확인)                                                          |
| 서버      | [서버에서 탐지 결과 검증](#서버에서-탐지-결과-검증) · [지원 기관을 한 곳에서 관리](#지원-기관을-한-곳에서-관리)              |

## 후보 제시 → 사용자 확정 → 유료 실명조회

탐지 결과는 번호 체계상 가능한 후보일 뿐입니다. 은행은 사용자가 확정하고, 건당 비용이 드는 실명조회는 확정한 뒤에 한 번만 호출합니다.

1. **후보 계산**: 입력이 바뀔 때마다 후보를 다시 계산합니다. 1순위가 `"high"`이고 `ambiguous`가 `false`일 때만 미리 선택합니다.
2. **사용자 확정**: 후보를 보여 주고, 미리 선택한 값도 사용자가 바꿀 수 있게 합니다. 후보가 없으면 전체 목록에서 고르게 합니다.
3. **유료 조회**: 사용자가 확정을 누른 뒤에만 실명조회 API를 호출합니다.

### 1. 후보 계산

```ts
// suggest-bank.ts
import { detect, type Institution } from "korean-account";

export interface BankSuggestion {
  /** 사용자가 바꾸지 않으면 쓸 기관. 확신할 수 없으면 null. */
  readonly preselected: Institution | null;
  /** 선택지로 보여 줄 기관. 순위 순이고 중복이 없습니다. */
  readonly options: readonly Institution[];
}

export function suggestBank(input: string): BankSuggestion {
  // 1순위가 high·medium이면 low 후보는 이미 빠져 있습니다. 모두 low면 선택지를 비웁니다.
  const candidates = detect(input).filter((candidate) => candidate.confidence !== "low");
  const [top] = candidates;
  const isConfident = top !== undefined && top.confidence === "high" && !top.ambiguous;
  const options = candidates.map((candidate) => candidate.institution);

  return { preselected: isConfident ? top.institution : null, options };
}
```

| 입력              | `preselected` | `options`                     | 비고                                        |
| ----------------- | ------------- | ----------------------------- | ------------------------------------------- |
| `3333-12-3456789` | `kakao`       | `kakao`                       | 단독 `"high"`                               |
| `110-436-387740`  | `null`        | `shinhan`, `post`, `shinhyup` | 세 기관이 같은 `"high"`                     |
| `1002-123-456789` | `null`        | `woori`, `kfcc`               | 우리은행 10점, 새마을금고 8점 모두 `"high"` |
| `000000000000`    | `null`        | 없음                          | 근거 없는 `"low"` 후보뿐                    |
| `333312345678`    | `nh`          | `nh`, `kakao`                 | 카카오뱅크 번호를 12자리까지 입력한 상태    |

마지막 줄처럼 입력 중에는 다른 기관의 형식이 단독 `"high"`가 될 수 있습니다. 미리 선택은 입력이 바뀔 때마다 다시 계산하고, 사용자가 직접 고른 값이 항상 이기게 합니다.

### 2. 사용자 확정

```tsx
import { searchInstitutions } from "korean-account";
import { useState } from "react";

import { suggestBank } from "./suggest-bank";

const allInstitutions = searchInstitutions({ categories: ["bank", "non-bank"] });

export function BankConfirm({
  account,
  onConfirm,
}: {
  account: string;
  onConfirm: (institutionId: string) => void;
}) {
  // 수동 선택은 고른 시점의 계좌번호와 함께 기억합니다. 번호가 바뀌면 자동으로 무효가 되어,
  // 새 후보 목록에 없는 기관이 화면에 안 보이는 채로 제출되는 일을 막습니다.
  const [manual, setManual] = useState<{ account: string; id: string } | null>(null);
  const suggestion = suggestBank(account);
  const manualId = manual?.account === account ? manual.id : null;
  const selectedId = manualId ?? suggestion.preselected?.id ?? null;
  const choices = suggestion.options.length > 0 ? suggestion.options : allInstitutions;

  return (
    <fieldset>
      <legend>받는 은행</legend>
      {choices.map((institution) => (
        <label key={institution.id}>
          <input
            type="radio"
            name="institution"
            checked={selectedId === institution.id}
            onChange={() => setManual({ account, id: institution.id })}
          />
          {institution.nameKo}
        </label>
      ))}
      <button
        type="button"
        disabled={selectedId === null}
        onClick={() => selectedId && onConfirm(selectedId)}
      >
        이 은행으로 확인
      </button>
    </fieldset>
  );
}
```

실제 화면에서는 후보 아래에 "다른 은행 선택"을 두어 후보에 없는 기관도 고를 수 있게 합니다. 라이브러리가 모르는 형식의 실제 계좌도 있기 때문입니다.

### 3. 확정 후 유료 조회

```ts
import { useMutation } from "@tanstack/react-query";
import { getInstitution, normalizeAccount } from "korean-account";
import { accountSchema } from "korean-account/standard-schema";

interface ConfirmedAccount {
  /** 사용자가 확정한 기관 ID */
  readonly institutionId: string;
  /** 입력한 그대로의 계좌번호 */
  readonly account: string;
}

export function useAccountHolderLookup<TResult>(
  lookup: (bankCode: string, digits: string) => Promise<TResult>,
) {
  return useMutation({
    mutationFn: async ({ institutionId, account }: ConfirmedAccount) => {
      const institution = getInstitution(institutionId);
      const result = await accountSchema["~standard"].validate(account);
      if (institution === null || result.issues) {
        throw new Error("은행과 계좌번호를 확인해주세요.");
      }
      // 실명조회 API는 대부분 표준은행코드를 받습니다. 하나은행만 CMS 코드(005)와 다릅니다(081).
      return lookup(institution.commonCode ?? institution.code, normalizeAccount(account));
    },
  });
}
```

확인 버튼의 핸들러에서만 `mutate({ institutionId, account })`를 호출합니다. 입력 중 `onChange`나 디바운스에서 호출하지 않습니다. 형식 검사를 통과해도 계좌가 실제로 있다는 뜻은 아니므로, 중복 제출과 조회 실패 처리는 비용·재시도 정책에 맞춰 둡니다.

## 형식 검증과 기관 안내

형식 오류만 제출을 막고, 기관 추정은 안내로만 씁니다. 라이브러리가 모르는 형식의 실제 계좌도 있으므로 "기관을 찾지 못함"을 오류로 다루지 않습니다.

```ts
import { accountKindLabels, detectBest } from "korean-account";
import { accountSchema } from "korean-account/standard-schema";

interface AccountFieldState {
  /** 제출을 막는 형식 오류 */
  readonly error: string | null;
  /** 제출을 막지 않는 안내 */
  readonly hint: string | null;
}

export async function checkAccountField(input: string): Promise<AccountFieldState> {
  const result = await accountSchema["~standard"].validate(input);
  const error = result.issues?.[0]?.message ?? null;
  if (error !== null) return { error, hint: null };

  const best = detectBest(input);
  if (best === null || best.confidence === "low")
    return { error: null, hint: "은행을 선택해주세요." };
  if (best.ambiguous)
    return { error: null, hint: "여러 금융기관의 형식과 일치합니다. 은행을 확인해주세요." };
  const product = best.subject?.label ?? accountKindLabels[best.kind];
  return { error: null, hint: `${best.institution.nameKo} ${product}` };
}

await checkAccountField("12345"); // => { error: "계좌번호 자릿수가 부족합니다.", hint: null }
await checkAccountField("3333-12-3456789"); // => { error: null, hint: "카카오뱅크 신계좌" }
await checkAccountField("110-436-387740"); // => { error: null, hint: "여러 금융기관의 형식과 일치합니다. 은행을 확인해주세요." }
```

## React Hook Form

`accountSchema`로 형식을 검증하고, 입력값으로 감지 결과를 옆에 보여 줍니다.

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { accountKindLabels, detectBest } from "korean-account";
import { accountSchema } from "korean-account/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const transferSchema = z.object({
  account: accountSchema,
  amount: z.number().positive(),
});
type TransferInput = z.infer<typeof transferSchema>;

export function TransferForm({ onSubmit }: { onSubmit: (value: TransferInput) => void }) {
  const form = useForm<TransferInput>({ resolver: zodResolver(transferSchema) });
  const detected = detectBest(form.watch("account") ?? "");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("account")} inputMode="numeric" placeholder="계좌번호" />
      {detected && detected.confidence !== "low" && (
        <p aria-live="polite">
          {detected.institution.nameKo} · {accountKindLabels[detected.kind]}
          {detected.ambiguous && " (다른 은행일 수 있음)"}
        </p>
      )}
      <p role="alert">{form.formState.errors.account?.message}</p>
    </form>
  );
}
```

`accountSchema`는 `ZodString`이므로 zod 3·4 모두에서 `z.infer`가 `string`입니다. 통과한 값은 입력 그대로이므로 저장할 때는 `normalizeAccount`를 적용합니다.

## TanStack Form

TanStack Form은 Standard Schema를 필드 검증기로 받습니다. 의존성이 없는 `korean-account/standard-schema`를 그대로 넘깁니다.

```tsx
import { useForm } from "@tanstack/react-form";
import { detectBest } from "korean-account";
import { accountSchema } from "korean-account/standard-schema";

export function AccountForm({ onSubmit }: { onSubmit: (account: string) => void }) {
  const form = useForm({
    defaultValues: { account: "" },
    onSubmit: ({ value }) => onSubmit(value.account),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="account" validators={{ onChange: accountSchema }}>
        {(field) => {
          const detected = detectBest(field.state.value);
          return (
            <>
              <input
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {detected?.confidence === "high" && !detected.ambiguous && (
                <span>{detected.institution.nameKo}</span>
              )}
              <p role="alert">{field.state.meta.errors[0]?.message}</p>
            </>
          );
        }}
      </form.Field>
      <button type="submit">확인</button>
    </form>
  );
}
```

zod 스키마를 쓰려면 zod 3.24 이상이어야 합니다. zod 3.23은 Standard Schema를 구현하지 않습니다.

## 입력 중 후보 표시

```tsx
import { detect } from "korean-account";
import { useDeferredValue, useMemo, useState } from "react";

export function AccountInput() {
  const [raw, setRaw] = useState("");
  const deferred = useDeferredValue(raw);
  const candidates = useMemo(() => detect(deferred, { limit: 3 }), [deferred]);

  return (
    <>
      <input value={raw} onChange={(event) => setRaw(event.target.value)} inputMode="numeric" />
      <ul>
        {candidates.map((candidate) => (
          <li key={candidate.institution.id}>
            {candidate.institution.nameKo} · {candidate.subject?.label ?? candidate.kind} ·{" "}
            {candidate.confidence}
            {candidate.ambiguous && " · 확인 필요"}
          </li>
        ))}
      </ul>
    </>
  );
}
```

후보는 입력 자릿수와 1자리 이내인 형식에서만 나오므로, 번호를 거의 다 입력해야 목록이 채워집니다. `detect`는 동기 함수이고 기관 색인을 미리 만들어 두므로 매 입력마다 호출해도 됩니다.

## 입력 중 포맷팅

탐지 결과의 `formatted`는 1순위 형식의 템플릿대로 하이픈을 넣은 값입니다.

```ts
import { detectBest, normalizeAccount } from "korean-account";

export function formatAsTyped(raw: string): string {
  return detectBest(raw)?.formatted ?? normalizeAccount(raw);
}

formatAsTyped("110436387740"); // => "110-436-387740"
formatAsTyped("3333123456789"); // => "3333-12-3456789"
formatAsTyped("33331234567"); // => "333-31-23456-7" (입력 중에는 다른 기관의 형식일 수 있음)
```

1순위가 바뀌면 묶음도 바뀌므로, 입력란 자체를 바꾸기보다 입력란 아래에 미리보기로 보여 주는 편이 커서 위치 문제를 피하기 쉽습니다. 특정 템플릿으로 고정하려면 [`formatAccount`](./api.md#formataccount)를 씁니다.

## shadcn/ui 은행 Select

계좌번호를 먼저 받고 은행 Select를 감지 결과로 채웁니다. 사용자가 고른 값이 항상 감지 결과를 이깁니다.

```tsx
import { banks, detectBest } from "korean-account";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BankField({ account }: { account: string }) {
  const [manualId, setManualId] = useState<string>();
  // 은행만 받더라도 전체 레지스트리로 탐지해야 우체국·신협과의 모호성을 알 수 있습니다.
  const detected = detectBest(account, { categories: ["bank"] });
  const suggestedId =
    detected?.confidence === "high" && !detected.ambiguous ? detected.institution.id : undefined;
  const value = manualId ?? suggestedId ?? "";

  return (
    <Select value={value} onValueChange={setManualId}>
      <SelectTrigger>
        <SelectValue placeholder="은행 선택" />
      </SelectTrigger>
      <SelectContent>
        {banks.map((bank) => (
          <SelectItem key={bank.id} value={bank.id}>
            {bank.nameKo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

`createDetector(banks)`로 탐지하면 번들은 작아지지만 비은행 기관이 detector에 없으므로 `110-436-387740`도 신한은행 단독 후보(`ambiguous: false`)가 됩니다. `detect(input, { categories: ["bank"] })`는 우체국·신협을 결과에서 숨기면서도 `ambiguous: true`를 유지합니다.

## 자동이체 등록 전 출금 가능 확인

사용자가 확정한 기관의 후보에서 `capabilities.allowsWithdrawal`을 읽습니다. 이 값은 PDF의 출금이체 열과 과목 비고를 따릅니다.

```ts
import { accountKindLabels, detect } from "korean-account";

type AutoDebitCheck =
  | { readonly status: "allowed" }
  | { readonly status: "blocked"; readonly reason: string }
  | { readonly status: "unknown"; readonly reason: string };

export function checkAutoDebit(input: string, confirmedInstitutionId: string): AutoDebitCheck {
  const candidate = detect(input, { limit: Infinity }).find(
    (result) => result.institution.id === confirmedInstitutionId,
  );
  if (candidate === undefined || candidate.confidence === "low") {
    return { status: "unknown", reason: "계좌 형식만으로는 출금 가능 여부를 알 수 없습니다." };
  }
  if (!candidate.capabilities.allowsWithdrawal) {
    const product = candidate.capabilities.virtual
      ? accountKindLabels.virtual
      : (candidate.subject?.label ?? accountKindLabels[candidate.kind]);
    return { status: "blocked", reason: `출금이체를 등록할 수 없는 계좌 형식입니다(${product}).` };
  }
  return { status: "allowed" };
}

checkAutoDebit("1712-3456-7890", "toss").status; // => "blocked" (토스뱅크 가상계좌)
checkAutoDebit("123-716-12345-6", "gwangju").status; // => "blocked" (광주은행 ISA)
checkAutoDebit("123456-64-12345-1", "nh").status; // => "allowed" (농협은행 가상계좌, PDF 출금이체 ○)
checkAutoDebit("110-436-387740", "kb").status; // => "unknown" (국민은행 형식이 아님)
```

`"allowed"`는 형식 기준입니다. 계좌 상태와 출금 동의는 CMS 등록 결과로 확인합니다. `"unknown"`은 거부 사유가 아니므로 등록을 시도하고 결과를 따릅니다.

## 서버에서 탐지 결과 검증

클라이언트가 보여 준 추정 결과를 `toDetectionPayload`로 JSON에 담아 보내고, 서버는 어댑터의 `detectionSchema`로 모양을 검증합니다.

```ts
// client.ts
import { detectBest, toDetectionPayload } from "korean-account";

export async function submitAccount(account: string, institutionId: string): Promise<void> {
  const best = detectBest(account);
  const response = await fetch("/api/accounts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ account, institutionId, detection: best && toDetectionPayload(best) }),
  });
  // fetch는 400·500 응답에도 reject하지 않으므로 상태를 직접 확인합니다.
  if (!response.ok) {
    throw new Error(`계좌를 저장하지 못했습니다 (HTTP ${response.status}).`);
  }
}
```

```ts
// server.ts
import { detect, normalizeAccount, type InstitutionId } from "korean-account";
import {
  accountSchema,
  detectionSchema,
  institutionIdSchema,
  type DetectionPayload,
} from "korean-account/zod";
import { z } from "zod";

interface AccountRecord {
  readonly digits: string;
  readonly institutionId: InstitutionId;
  readonly detection: DetectionPayload | null;
  readonly needsReview: boolean;
}

const accountRequestSchema = z.object({
  account: accountSchema,
  institutionId: institutionIdSchema, // 사용자가 확정한 기관
  detection: detectionSchema.nullable(), // 클라이언트가 보여 준 추정
});

export async function handleAccountRequest(
  json: unknown,
  save: (record: AccountRecord) => Promise<void>,
) {
  const parsed = accountRequestSchema.safeParse(json);
  if (!parsed.success) return { status: 400, issues: parsed.error.issues };

  const { account, institutionId, detection } = parsed.data;
  // detection은 클라이언트가 만든 값이라 판단에 쓰지 않습니다. 서버에서 다시 탐지합니다.
  const isCandidate = detect(account, { limit: Infinity }).some(
    (candidate) => candidate.institution.id === institutionId,
  );
  await save({
    digits: normalizeAccount(account),
    institutionId,
    detection,
    needsReview: !isCandidate,
  });
  return { status: 201 };
}
```

- `detectionSchema`는 `institutionId`가 내장 기관 ID인지, `kind`·`confidence`·`subject.category`가 알려진 값인지, `score`가 0 이상의 유한한 수인지 확인합니다. 탐지를 다시 하지는 않습니다.
- 잘못된 요청은 `계좌번호 자릿수가 부족합니다.`, `지원하지 않는 금융기관입니다.` 같은 한국어 메시지로 실패합니다. 메시지를 바꾸려면 [팩토리](./api.md#팩토리)를 씁니다.
- 다른 어댑터: `v.parse(detectionSchema, json)`(valibot), `detectionSchema.validateSync(json)`(yup), `detectionSchema.assert(json)`(arktype), `detectionSchema["~standard"].validate(json)`(standard-schema).
- 후보에 없는 기관을 사용자가 골랐다고 거부하지 않습니다. 라이브러리가 모르는 형식일 수 있으므로 표시만 해 두고 실명조회 결과로 판단합니다.

## 지원 기관을 한 곳에서 관리

일부 기관만 지원하는 서비스라면 detector와 스키마를 같은 ID 목록으로 만들어 클라이언트와 서버가 함께 가져다 씁니다.

```ts
// supported-institutions.ts
import { createDetector, kakao, kb, shinhan, toss, woori } from "korean-account";
import { createDetectionSchema, createInstitutionIdSchema } from "korean-account/zod";

export const detector = createDetector([kb, shinhan, woori, kakao, toss]);

const supportedIds = detector.institutions.map((institution) => institution.id);
export const supportedInstitutionIdSchema = createInstitutionIdSchema(supportedIds);
export const supportedDetectionSchema = createDetectionSchema(supportedIds);
// z.infer<typeof supportedInstitutionIdSchema> => "kb" | "shinhan" | "woori" | "kakao" | "toss"
```

이 detector는 다섯 기관 사이의 모호성만 판단합니다. `110-436-387740`은 신한은행 단독 후보(`ambiguous: false`)이고 `1002-123-456789`는 우리은행 단독 후보입니다. 지원하지 않는 기관의 계좌일 가능성까지 알려면 전체 레지스트리로 탐지하고 `include`로 거릅니다. PDF에 없는 형식을 더하는 방법은 [커스텀 detector](./customization.md#보강-사례)에 있습니다.
