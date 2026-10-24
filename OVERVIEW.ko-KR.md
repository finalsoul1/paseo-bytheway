# ByTheWay

Paseo의 주 agent가 작업하는 동안 별도로 질문하거나 작은 작업을 실행하는 보조 대화 plugin입니다. 보조 대화 내용은 주 transcript에 기록되지 않습니다.

## 동작 방식

각 보조 대화는 같은 workspace에서 실행되는 임시 agent를 사용합니다.

- Panel이나 `/btw` 계열 명령으로 대화를 시작하면 주 agent의 최근 대화를 첫 context로 전달합니다.
- Panel은 보조 agent의 timeline을 직접 구독해 텍스트, reasoning, 도구 호출, 할 일, 권한 요청과 turn별 사용량을 실시간으로 표시합니다.
- 기본 설정에서는 보조 agent가 Paseo 도구로 주 agent의 최신 진행 상황을 읽습니다. 도구를 사용할 수 없으면 이후 메시지에 새로운 context를 첨부하는 방식으로 전환합니다.
- Transcript는 Paseo agent timeline에 저장됩니다. Plugin은 대화 ID, 제목, 상태만 로컬에 저장합니다.

## 사용법

- `/btw <질문>`은 현재 보조 대화를 이어가거나 새 대화를 시작합니다. 인자 없이 `/btw`만 입력하면 panel만 엽니다.
- `/btw-new <질문>`은 새 보조 대화를 시작합니다.
- `/side <작업>`과 `/side-new <작업>`은 Build mode에서 작은 작업을 실행합니다.
- `/fork [첫 지시]`는 현재 transcript를 복제해 새 병렬 agent를 만듭니다.
- Command Center에서 ByTheWay panel과 설정을 열 수 있습니다.
- 대화 탭의 닫기 버튼은 해당 보조 agent를 보관합니다.
- Desktop에서는 Enter로 보내고 Shift+Enter로 줄을 바꿉니다.
- Paseo 언어가 한국어이면 panel, 명령, 설정과 AI가 생성한 대화 제목을 한국어로 표시합니다. 제목 생성 model이 한자를 반환하면 해당 제목을 저장하지 않습니다.

## 설정

Settings -> Plugins -> ByTheWay에서 다음 항목을 설정할 수 있습니다.

- 기본 mode와 model
- 첫 context에 포함할 메시지 수와 최근 작업 요약
- 보조 agent를 주 agent의 하위 agent로 연결할지 여부
- AI가 생성하는 대화 제목과 제목 생성 model
- 권한 정책과 자동 거부 시간
- Chat, Build, 전체 동시 실행 제한
- 실험적 취소 기능

별도 계정이나 API key는 필요하지 않습니다. Paseo에 설정된 provider를 사용합니다. Paseo 0.13.0-beta.1 이상이 필요하며 Desktop, Web, mobile client에서 사용할 수 있습니다.

## 데이터와 권한

- 읽기: 로컬 Paseo daemon을 통해 주 agent와 보조 agent의 timeline을 읽습니다.
- 쓰기: `~/.paseo/plugin-data/paseo-bytheway/`에 대화 ID, 제목과 상태를 저장합니다. 질문과 답변은 복사하지 않습니다.
- 네트워크: 질문, context와 도구 결과는 사용자가 Paseo에 설정한 model provider로 전달됩니다. 원격 이미지는 해당 URL에서 client가 직접 불러옵니다. Panel을 열면 GitHub에서 이 fork의 버전 정보만 확인하며 session 데이터는 전송하지 않습니다.
- 권한: 새 보조 agent는 주 agent의 thinking 설정과 provider 기능을 이어받습니다. 기본 권한 정책도 주 agent를 따릅니다.
- 중지: 먼저 Paseo 도구로 취소를 요청하고, 적용되지 않으면 원래 agent 탭에서 중지하도록 안내합니다.

## 제한 사항

- 보조 대화는 이를 만든 daemon과 주 agent에 연결됩니다.
- 기존 대화는 같은 provider 안에서만 model을 바꿀 수 있습니다.
- AI 제목, 취소, model과 mode 전환은 짧게 실행되는 helper agent를 만들 수 있습니다.
- 동시 실행 제한을 넘으면 새 요청을 시작할 수 없습니다.
