# Paseo용 ByTheWay

Paseo의 주 agent가 작업하는 동안 별도의 보조 agent에게 질문하거나 작은 작업을 맡길 수 있는 plugin입니다. 보조 대화는 오른쪽 panel에서 실시간으로 확인하며, 주 대화의 흐름과 transcript를 방해하지 않습니다.

이 저장소는 한국어 UI와 한국어 문서를 추가한 [CasonMo/paseo-bytheway](https://github.com/CasonMo/paseo-bytheway) fork입니다.

## 요구 사항

- Paseo 0.13.0-beta.1 이상
- Paseo 설정에서 plugin 기능 활성화
- 사용할 model provider가 Paseo에 설정되어 있어야 함

별도 계정이나 API key는 필요하지 않습니다.

## 설치

기존 ByTheWay가 설치되어 있다면 동일한 plugin ID를 사용하므로 먼저 등록을 제거합니다.

```bash
paseo plugin remove paseo-bytheway
paseo plugin install github:finalsoul1/paseo-bytheway
paseo plugin ls paseo-bytheway
```

상태가 `running`이면 설치가 완료된 것입니다. 제거 명령은 별도로 clone한 로컬 저장소를 삭제하지 않습니다.

로컬 checkout을 직접 연결하려면 다음 명령을 사용합니다.

```bash
paseo plugin install /absolute/path/to/paseo-bytheway
```

소스 파일을 수정한 뒤에는 daemon을 재시작하지 말고 plugin만 다시 불러옵니다.

```bash
paseo plugin reload paseo-bytheway
paseo plugin logs paseo-bytheway
```

## 사용법

| 명령 | 동작 |
| --- | --- |
| `/btw <질문>` | 현재 보조 대화를 이어가며 질문합니다. 대화가 없으면 새로 만듭니다. |
| `/btw-new <질문>` | 새 보조 대화를 시작합니다. |
| `/side <작업>` | 현재 Build 대화를 이어가며 작은 작업을 실행합니다. |
| `/side-new <작업>` | 새 Build 대화를 시작합니다. |
| `/fork [첫 지시]` | 현재 transcript를 복제해 새 병렬 agent를 만듭니다. |

인자 없이 `/btw`를 실행하면 ByTheWay panel만 엽니다. Command Center에서도 `ByTheWay 열기`와 `ByTheWay 설정`을 실행할 수 있습니다.

`/btw`는 설명, 조사, 검토처럼 읽기 중심의 질문에 적합합니다. `/side`는 파일 수정이나 명령 실행처럼 Build mode가 필요한 작은 작업에 적합합니다. 둘 다 별도의 agent에서 실행되므로 주 agent는 계속 작업할 수 있습니다.

## 주요 기능

- 보조 agent의 답변, reasoning, 도구 호출, 할 일, 권한 요청과 사용량을 실시간으로 표시합니다.
- 여러 보조 대화를 만들고 전환하거나, 대화 이름을 바꾸고 보관할 수 있습니다.
- 첫 요청에는 주 대화의 최근 context를 전달하고, 이후에는 주 agent의 최신 진행 상황을 연결합니다.
- 새 대화는 다른 provider와 model을 선택할 수 있습니다. 기존 대화는 같은 provider 안에서 model을 바꿀 수 있습니다.
- Paseo 언어가 한국어이면 panel, 명령과 설정을 한국어로 표시합니다.
- Desktop에서는 Enter로 보내고 Shift+Enter로 줄을 바꿉니다.

## Context 동작

각 보조 대화는 같은 workspace에서 실행되는 별도의 Paseo agent를 사용합니다.

1. 대화를 시작할 때 주 agent의 최근 메시지와 선택한 작업 요약을 첫 context로 전달합니다.
2. 기본 설정에서는 보조 agent가 Paseo 도구로 주 agent의 최신 진행 상황을 읽습니다.
3. Paseo 도구를 사용할 수 없으면 새로 추가된 context를 다음 메시지에 첨부하는 방식으로 전환합니다.

보조 대화의 질문과 답변은 해당 Paseo agent의 timeline에 저장됩니다. Plugin 자체는 대화 ID, 제목과 상태만 저장합니다.

## 설정

`Settings -> Plugins -> ByTheWay`에서 다음 항목을 변경할 수 있습니다.

- 새 대화의 기본 mode와 model
- 첫 context에 포함할 메시지 수와 작업 요약 포함 여부
- 보조 agent를 주 agent의 하위 agent로 연결할지 여부
- AI 대화 제목과 제목 생성 model
- 권한 정책과 읽기·쓰기 요청의 자동 거부 시간
- Chat, Build와 전체 동시 실행 제한
- 실험적 취소 기능

기본 권한 정책은 주 agent의 설정을 따릅니다. 읽기 전용 요청 자동 허용, 모든 요청 거부 또는 시간 초과 자동 거부 정책도 선택할 수 있습니다.

## 데이터와 네트워크

- 주 agent와 보조 agent의 timeline은 로컬 Paseo daemon을 통해 읽습니다.
- 대화 메타데이터는 `~/.paseo/plugin-data/paseo-bytheway/`에 저장합니다.
- 질문, context와 도구 결과는 사용자가 Paseo에 설정한 model provider로 전달됩니다.
- 원격 이미지는 해당 URL에서 client가 직접 불러옵니다.
- Panel을 열 때 GitHub에서 이 fork의 버전 정보만 확인하며 session 데이터는 전송하지 않습니다.
- 별도 telemetry나 외부 분석 서비스는 사용하지 않습니다.

## 알려진 제한 사항

- 보조 대화는 이를 만든 daemon과 주 agent에 연결됩니다.
- 기존 대화는 같은 provider 안에서만 model을 변경할 수 있습니다.
- AI 제목 생성, 취소, model 또는 mode 전환 과정에서 짧게 실행되는 helper agent가 만들어질 수 있습니다.
- 동시 실행 제한을 넘으면 실행 중인 작업이 끝날 때까지 새 요청을 시작할 수 없습니다.
- 이전 버전에서 만든 대화 제목은 기존 접두사를 유지합니다. 새 대화부터 `ByTheWay` 접두사를 사용합니다.

## 개발

```bash
npm ci
npm run typecheck
npm test
npm run smoke
```

`npm run smoke`는 실행 중인 로컬 Paseo daemon과 연결 정보가 필요하며, 테스트용 보조 agent를 생성하고 정리합니다. Plugin의 설치 화면에 표시되는 상세 설명은 [OVERVIEW.ko-KR.md](./OVERVIEW.ko-KR.md)에서 확인할 수 있습니다.
