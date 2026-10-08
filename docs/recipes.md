[문서 목록](../DOCS.md) · [빠른 시작](../README.md)

<a id="appendix-c-recipes"></a>

# Appendix C. Recipes

통합 패턴 9개. 프레임워크 의존성·서버 API·주변 UI는 애플리케이션에서 구성한다. 생략 기호가 있는 예제는 부분 예제다.

- **프레임워크 무관** — C.1 폼 검증 · C.2 자동이체 가드 · C.9 실시간 포맷팅
- **React** — C.3 디바운싱 자동완성 · C.7 shadcn/ui 은행 Select
- **폼 라이브러리** — C.5 React Hook Form + zodResolver · C.6 TanStack Form
- **비용 최적화** — C.8 TanStack Query 유료 실명조회 게이트
- **확장 입문** — C.4 도메인 보강 detector (본격 확장은 Appendix D)

<a id="c1-폼-검증"></a>

## C.1 폼 검증

```ts
import { detectBest } from "korean-account";

function validateAccount(input: string): string | undefined {
  if (!input) return "계좌번호를 입력해주세요.";
  const top = detectBest(input);
  if (!top) return "올바른 계좌번호가 아닙니다.";
  if (!top.capabilities.allowsWithdrawal) {
    return `${top.institution.nameKo} ${top.subject?.label ?? top.kind} 는 라이브러리 정책상 출금 가능으로 안내하지 않습니다.`;
  }
  if (top.confidence === "low") return "기관을 특정할 수 없습니다.";
  return undefined;
}
```

<a id="c2-자동이체-등록-전-출금-가능-검증"></a>

## C.2 자동이체 등록 전 출금 가능 검증

```ts
import { detectBest } from "korean-account";

function canRegisterAutoDebit(input: string) {
  const top = detectBest(input);
  if (!top) return { ok: false, reason: "계좌 식별 불가" };
  if (!top.capabilities.allowsWithdrawal) {
    return { ok: false, reason: `${top.kind} 계좌는 출금 가능 여부를 별도로 확인해주세요` };
  }
  return { ok: true };
}
```

<a id="c3-react-디바운싱--자동완성"></a>

## C.3 React 디바운싱 + 자동완성

```tsx
import { useDeferredValue, useMemo, useState } from "react";
import { detect, type DetectionResult } from "korean-account";

function AccountInput() {
  const [raw, setRaw] = useState("");
  const deferred = useDeferredValue(raw);
  const candidates = useMemo<readonly DetectionResult[]>(
    () => detect(deferred, { limit: 3 }),
    [deferred],
  );

  return (
    <>
      <input value={raw} onChange={(e) => setRaw(e.target.value)} />
      <ul>
        {candidates.map((c, index) => (
          <li key={`${c.institution.id}:${index}`}>
            {c.institution.nameKo} · {c.subject?.label ?? c.kind} · {c.confidence}
          </li>
        ))}
      </ul>
    </>
  );
}
```

<a id="c4-도메인-보강-detector"></a>

## C.4 도메인 보강 detector

라이브러리 본판 위에 도메인 보강 patterns 를 얹어 자체 detector 를 만든다. 8건의 실제 보강 사례는 Appendix D.1.

> 아래 카카오 3333·7979 tightening 은 **0.2.0 에서 core 로 승격됨** — 이제 별도 보강 없이 기본 동작이다. 같은 기법을 다른 기관에 적용하는 예시로만 참고할 것.

```ts
import {
  createDetector,
  defineInstitution,
  getInstitution,
  institutions,
  patternTemplate as T,
} from "korean-account";

const kakaoCore = getInstitution("kakao"); // 등록 literal → non-null
const kakaoExtended = defineInstitution({
  id: "kakao",
  code: "090",
  nameKo: "카카오뱅크",
  category: "bank",
  aliases: ["카카오"],
  userBaseMillions: 5,
  patterns: kakaoCore.patterns.map((p) =>
    p.kind === "new" && !p.identifiers
      ? { ...p, identifierPosition: { start: 0, length: 4 }, identifiers: ["3333", "7979"] }
      : p,
  ),
});

export const myDetector = createDetector(institutions).extend({
  institutions: [kakaoExtended],
});
```

---

<a id="c5-react-hook-form--zodresolver"></a>

## C.5 React Hook Form + zodResolver

`accountSchema` 로 형식을 검증하고, 입력을 지켜보며 감지 결과를 폼 옆에 보여준다.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { accountSchema } from "korean-account/zod";
import { accountKindLabels, detectBest } from "korean-account";

const transferSchema = z.object({
  account: accountSchema,
  amount: z.number().positive(),
});
type TransferInput = z.infer<typeof transferSchema>;

export function TransferForm({ onSubmit }: { onSubmit: (v: TransferInput) => void }) {
  const form = useForm<TransferInput>({ resolver: zodResolver(transferSchema) });
  const detected = detectBest(form.watch("account") ?? "");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("account")} inputMode="numeric" placeholder="계좌번호" />
      {detected && detected.confidence !== "low" && (
        <p aria-live="polite">
          {detected.institution.nameKo} · {accountKindLabels[detected.kind]}
        </p>
      )}
      <p role="alert">{form.formState.errors.account?.message}</p>
    </form>
  );
}
```

<a id="c6-tanstack-form"></a>

## C.6 TanStack Form

zod 스키마를 validator 로 그대로 물리고, 필드 값으로 감지한다.

```tsx
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { accountSchema } from "korean-account/zod";
import { detectBest } from "korean-account";

const form = useForm({
  defaultValues: { account: "" },
  validators: { onChange: z.object({ account: accountSchema }) },
  onSubmit: ({ value }) => transfer(value),
});

// <form.Field name="account"> 내부에서:
// const detected = detectBest(field.state.value);
// detected?.confidence === "high" 이면 은행 배지 렌더링
```

<a id="c7-shadcnui--은행-select-자동-선택"></a>

## C.7 shadcn/ui — 은행 Select 자동 선택

계좌번호를 먼저 받고 은행 Select 를 감지 결과로 채운다. 수동 변경은 항상 감지를 이긴다.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { banks, createDetector } from "korean-account";

const detector = createDetector(banks); // 은행만 취급하는 서비스 — 증권·비은행은 번들에서 제외

export function BankField({ account }: { account: string }) {
  const [manual, setManual] = useState<string>();
  const detected = detector.detect(account)[0];
  const value = manual ?? (detected?.confidence !== "low" ? detected?.institution.code : undefined);

  return (
    <Select value={value} onValueChange={setManual}>
      <SelectTrigger>
        <SelectValue placeholder="은행 선택" />
      </SelectTrigger>
      <SelectContent>
        {banks.map((bank) => (
          <SelectItem key={bank.id} value={bank.code}>
            {bank.nameKo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

<a id="c8-tanstack-query--유료-실명조회-게이트"></a>

## C.8 TanStack Query — 유료 실명조회 게이트

입력 중 높은 confidence가 나와도 입력 완료나 은행 확정을 뜻하지 않는다. 예를 들어 우리은행 예제의 12자리 입력 중간값 `100212345678`, 카카오뱅크 예제의 중간값 `333312345678`도 다른 은행의 high 후보가 나온다. 조회는 사용자가 은행·계좌를 확인하고 제출할 때 실행한다. 조회 API 구현은 애플리케이션에서 주입한다.

```tsx
import { useMutation } from "@tanstack/react-query";
import { normalizeAccount } from "korean-account";
import { accountSchema } from "korean-account/standard-schema";

type ConfirmedAccount = { bankCode: string; rawAccount: string };

export function useAccountHolder<T>(
  fetchAccountHolder: (bankCode: string, digits: string) => Promise<T>,
) {
  return useMutation({
    mutationFn: async ({ bankCode, rawAccount }: ConfirmedAccount) => {
      const result = await accountSchema["~standard"].validate(rawAccount);
      if (result.issues || !/^\d{3}$/.test(bankCode)) {
        throw new Error("은행과 계좌번호를 확인해주세요.");
      }
      return fetchAccountHolder(bankCode, normalizeAccount(rawAccount));
    },
  });
}
```

사용자 확인 후 제출 핸들러에서 `mutate({ bankCode, rawAccount })`를 호출한다. 구문 검사는 실제 계좌의 유효성 검사가 아니다. 중복 제출·조회 실패 처리는 애플리케이션의 비용·재시도 정책에 맞춘다.

<a id="c9-입력-중-실시간-포맷팅"></a>

## C.9 입력 중 실시간 포맷팅

매칭된 패턴의 템플릿으로 하이픈 그루핑을 실시간 적용한다.

```tsx
import { detectBest, formatAccount, normalizeAccount } from "korean-account";

function formatAsTyped(raw: string): string {
  const digits = normalizeAccount(raw);
  const top = detectBest(digits);
  return top ? formatAccount(digits, top.matchedPattern.template) : digits;
}

// <input value={value} onChange={(e) => setValue(formatAsTyped(e.target.value))} />
// "110436387740" 입력 → "110-436-387740" 표시
```
