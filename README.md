# ByTheWay for Paseo

주 agent의 작업을 멈추지 않고 별도로 질문하거나 작은 작업을 실행하는 Paseo plugin입니다.

## 주요 기능

- 실시간 실행 내용: 보조 agent의 텍스트, reasoning, 도구 호출, 할 일, turn 상태와 사용량을 panel에서 확인합니다.
- 여러 대화: `/btw`로 현재 보조 대화를 이어가고 `/btw-new`로 새 대화를 시작합니다. `/side`와 `/side-new`는 Build mode를 사용합니다.
- Context 연결: 보조 agent가 Paseo 도구로 주 agent의 최신 진행 상황을 읽습니다. 도구를 사용할 수 없으면 수동 증분 sync를 사용합니다.
- 별도 transcript: 질문과 답변은 Paseo agent timeline에 저장되며 plugin은 대화 ID, 제목, 상태만 보관합니다.
- 권한 처리: 주 agent의 권한 설정을 따르거나 읽기 전용 자동 허용, 전체 거부, 시간 초과 자동 거부 정책을 선택할 수 있습니다.
- Model 전환: 새 대화는 다른 provider를 선택할 수 있고, 기존 대화는 같은 provider 안에서 model을 바꿀 수 있습니다.
- 한국어 UI: Paseo 언어가 한국어이면 panel, 명령, 설정을 한국어로 표시합니다.

## 명령

| 명령 | 동작 |
|---|---|
| `/btw <질문>` | 현재 보조 대화를 이어가며 질문합니다. 대화가 없으면 새로 만듭니다. |
| `/btw-new <질문>` | 새 보조 대화를 시작합니다. |
| `/side <작업>` | 현재 Build 대화에서 작은 작업을 실행합니다. |
| `/side-new <작업>` | 새 Build 대화를 시작합니다. |
| `/fork [첫 지시]` | 현재 transcript를 복제해 새 병렬 agent를 만듭니다. |

명령을 실행하면 Explorer의 ByTheWay panel이 열리고 해당 대화를 선택합니다. Command Center에서도 panel과 설정을 열 수 있습니다.

## 개발

```bash
npm install
npm run typecheck
npm test
npm run smoke

paseo plugin install /path/to/paseo-bytheway
paseo plugin reload paseo-bytheway
paseo plugin logs paseo-bytheway
```

`npm run smoke`는 로컬 daemon 연결 정보가 필요합니다. 기능, 설정, 데이터 접근 범위는 `OVERVIEW.md`에서 확인할 수 있습니다.

## 구조

```text
Panel (client) -- RPC --> daemon plugin
      |                    |
      +-- timeline <-------+-- side agent
```

- Client는 timeline을 구독해 실행 내용을 표시합니다.
- 상태 변경은 daemon RPC를 사용합니다.
- Context mode는 linked, passive, snapshot off를 지원합니다.

This repository is a Korean-localized fork of [CasonMo/paseo-bytheway](https://github.com/CasonMo/paseo-bytheway).
