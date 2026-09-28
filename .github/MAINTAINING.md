# 저장소 운영 기준

## 언어

이 저장소는 한국 금융기관과 한국어 CMS 자료를 다루므로 이슈·PR·changeset·릴리스 설명은 한국어를 기본으로 합니다. 기술 이름·API·명령은 원문을 유지합니다. 영어 기여도 환영하며 번역을 기여 조건으로 요구하지 않습니다. README.en.md와 영어 소스 주석은 유지합니다.

Dependabot·Changesets가 관리하는 생성 본문은 자동화 원문을 유지합니다. 과거 기록을 정리할 때는 한국어 요약을 앞에 두고 당시의 상세 원문·버전·검증 결과를 보존합니다. 과거에 실행하지 않은 검사를 새로 통과했다고 쓰지 않습니다.

## 제목과 본문

이슈·PR·커밋의 제목은 `type(scope): 구체적인 문제 또는 변경`을 사용합니다. scope는 필요할 때만 넣고 `core`, `registry`, `adapters`, `types`, `build`, `ci`, `deps`, `docs`, `release`, `repo`를 권장합니다. 비호환 변경은 `!`로 표시합니다.

- `fix(adapters): ArkType CommonJS 타입 해석 오류 수정`
- `feat(registry): CMS 근거에 따라 기관 패턴 추가`
- `docs: 확장 API 사용 예제 보완`
- `chore(repo): 이슈·PR 운영 기준 정리`
- `chore(release): 0.3.1 릴리스 준비`

본문 순서는 **요약 → 변경 및 영향 → 검증 → 관련 항목**입니다. 이슈의 검증에는 재현 방법·완료 조건, PR의 검증에는 실행한 명령·실제 결과를 씁니다. 문서만 고칠 때까지 테스트 파일이나 changeset을 요구하지 않습니다.

완료하는 이슈에는 `Closes #번호`, 일부 작업에는 `Refs #번호`, 대체 PR에는 `Supersedes #번호`를 사용합니다. 닫힌 PR을 머지된 것으로 쓰거나, 버전 PR이 머지됐다는 이유만으로 npm 게시를 완료 처리하지 않습니다.

## 라벨

[labels.json](./labels.json)이 이름·색상·설명의 기준입니다.

| 구분                    | 규칙                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| `type:`                 | 목적을 정확히 1개 선택: bug / feature / docs / maintenance / refactor / test / release          |
| `area:`                 | 실제 영향 영역을 복수 선택: core / registry / adapters / types / build / ci / docs / repository |
| `flag: dependencies`    | npm 의존성 또는 Actions 버전 변경                                                               |
| `flag: breaking-change` | 공개 API·지원 런타임·관측 결과의 비호환 변경                                                    |

진행 상태·작성자·버전은 라벨에 중복 저장하지 않습니다. 상태는 이슈/PR 및 Projects, 작성자는 GitHub author, 버전은 Git 태그·Release를 사용합니다. 쓰이지 않는 분류를 미리 늘리지 않습니다.

Metadata workflow는 제목에서 type과 비호환 표시를 분류하고 PR 파일에서 area를 동기화합니다. Dependabot·deps scope·lockfile 변경에는 의존성 표시를 추가합니다. 수동 의존성 표시를 자동 제거하지 않으므로 철회된 업데이트는 리뷰에서 해제합니다. 이슈의 area는 트리아지 때 지정합니다. PR 코드는 이 workflow에서 checkout하거나 실행하지 않습니다.

라벨 개편 순서: 기준 파일·템플릿·자동화 수정 → 새 라벨 생성 → 기존 이슈/PR 이관 → 이전 라벨의 사용·설정 참조가 0인지 확인 → 이전 라벨 삭제. 기존 이력의 백업을 먼저 보관합니다.

## 작성자·담당자·검토자

- **Author**는 GitHub의 실제 작성자를 유지합니다. 봇 PR을 사람의 기여로 바꾸거나 과거 커밋의 author를 재작성하지 않습니다.
- **Assignee**는 실제로 작업을 맡은 사람만 지정합니다. 신고자나 메인테이너를 모든 이슈에 자동 배정하지 않습니다.
- **Reviewer/CODEOWNERS**는 검토 책임자입니다. 본인 PR에 self-review를 요구하지 않습니다. 현재 코드 소유자는 `@dydals3440`입니다.
- 기여자 표시는 GitHub의 PR·커밋·릴리스 기여 기록을 기준으로 합니다. 단순 편집으로 공동 작성자 크레딧을 추가하지 않습니다.

## Projects

이 저장소는 [korean-account Project](https://github.com/users/dydals3440/projects/1) 하나로 관리합니다. 저장소와 연결된 공개 보드이며 다른 저장소의 Project는 정리 대상이 아닙니다.

필드는 기본 Title·Assignees·Labels·Repository·Linked pull requests와 Status만 우선 사용합니다. Status는 GitHub 기본값인 `Todo` → `In Progress` → `Done`입니다. 표는 전체 작업, 보드는 Status별 진행 상황을 보여 줍니다. PR의 검토 상태는 GitHub 리뷰 상태를 그대로 활용합니다. 우선순위·기한·반복 주기는 실제 관리 필요가 있을 때만 추가합니다.

신규 이슈·PR은 트리아지할 때 이 보드에 추가하고, 완료 시 Done으로 이동합니다. 현재 자동 추가·상태 변경 workflow는 사용하지 않습니다. 추후 자동화를 켤 때는 이 저장소만 포함하는 필터를 지정합니다. 닫혔지만 반영하지 않은 요청은 종료 사유를 남깁니다. 지난 완료 항목은 이력을 유지한 채 보드에서 보관할 수 있습니다. 중복 보드는 항목·뷰·자동화를 기준 보드로 이관하고 검증한 뒤 정리합니다. 권한 없이 Project를 정리했다고 기록하지 않습니다.

## 버전·태그·릴리스

Git 태그는 `vX.Y.Z`, GitHub Release 제목도 `vX.Y.Z`로 통일합니다. Changesets가 버전과 릴리스 노트를 관리하고, 사람이 작성하는 changeset 본문은 한국어로 씁니다. 자동 생성 PR 제목은 `chore(release): 패키지 버전 갱신`, 버전 확정 시 `chore(release): X.Y.Z 릴리스 준비`를 사용할 수 있습니다.

게시된 태그는 삭제·이동·재사용하지 않습니다. 소비자 영향·마이그레이션·관련 PR을 기록하고, npm latest·실제 설치·provenance·GitHub Release를 확인한 뒤 완료합니다. 0.x에서 비호환 변경은 다음 minor로, 1.0 이후에는 major로 분리하며 변경 규모를 라벨만으로 결정하지 않습니다.
