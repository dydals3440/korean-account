[문서 목록](../DOCS.md) · [빠른 시작](../README.md)

<a id="appendix-c-recipes"></a>

# Appendix C. Recipes

복사해 바로 쓰는 실전 패턴 9개.

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
    return `${top.institution.nameKo} ${top.subject?.label ?? top.kind} 는 자동이체 등록이 불가합니다.`;
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
    return { ok: false, reason: `${top.kind} 계좌는 자동이체 불가` };
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
        {candidates.map((c) => (
          <li key={c.institution.id}>
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

핵심 비용 패턴. **confidence 가 high 일 때만** 건당 과금되는 실명조회 API 를 호출한다 — 오타·미완성 입력이 유료 호출로 새지 않는다.

```tsx
import { useQuery } from "@tanstack/react-query";
import { detectBest, normalizeAccount } from "korean-account";

export function useAccountHolder(rawAccount: string) {
  const digits = normalizeAccount(rawAccount);
  const detected = detectBest(digits);
  const bankCode = detected?.institution.commonCode ?? detected?.institution.code;

  return useQuery({
    queryKey: ["account-holder", bankCode, digits],
    queryFn: () => fetchAccountHolder(bankCode!, digits), // 유료: 오픈뱅킹 계좌실명조회 등
    enabled: detected?.confidence === "high" && detected.capabilities.allowsWithdrawal,
    staleTime: Infinity, // 같은 계좌는 재조회하지 않는다
  });
}
```

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
