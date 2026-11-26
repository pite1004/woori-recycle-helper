# 외부 자료 출처

## 규칙 데이터 (처음 15개 품목은 2026-11-06, 추가 14개 품목은 2026-11-26 확인)

2026-11-26에 아래 페이지를 다시 읽었다. 미추홀구 재활용품·일반쓰레기 페이지의 최종수정일은 2026-11-11이었다.

| 출처 | URL | 사용한 값 (2026-11-26 추가분) |
|---|---|---|
| 미추홀구 재활용품 | https://www.michuhol.go.kr/main/content.do?sq=446 | 금속·캔류, 투명 페트병, 플라스틱류, 종이류, 의류, 종이팩 교환 |
| 미추홀구 비닐(필름)류 | https://www.michuhol.go.kr/main/content.do?sq=1595 | 비닐 배출 요일·시간·봉투, 불가 품목 |
| 연수구 재활용가능자원 배출방법 | https://www.yeonsu.go.kr/discharge/kor/sub/method_recycle.asp | 페트병, 캔, 부탄가스, 소형가전 수거함 |
| 연수구 의류수거함 | https://www.yeonsu.go.kr/main/part/clean/clothes.asp | 헌옷·이불 배출 품목과 불가 품목 |
| 연수구 우리동네 배출요일 | https://www.yeonsu.go.kr/discharge/kor/sub/week.asp | 대형폐기물 동별 요일, 가정사업계 폐기물 요일 |
| 연수구 대형폐기물 품목별 수수료 | https://www.yeonsu.go.kr/discharge/kor/sub/charge.asp | 거울, 선풍기, 전기밥솥, 자전거, 소파 |
| 미추홀구 대형폐기물 처리수수료표 | https://www.michuhol.go.kr/other/attach_down.do?sq=441&key=DB7770C867 | 거울, 자전거, 소파 |

전자기기 품목 근거 (2026-11-26 확인):

| 출처 | URL | 사용한 값 |
|---|---|---|
| 인천시 보도자료 「폐가전 무상수거 전 품목 확대」(2026-03-20) | https://www.incheon.go.kr/IC010205/view?repSeq=DOM_0000000014377781 | 전 품목 확대, 12kg 이상 대형 1개 수거, 중·소형은 대형과 함께 배출 가능, 전용 수거함 수량 무관 무료, 보조배터리 포함, 배터리 배출 요령, 신청 방법 |
| E-순환거버넌스 맞춤수거·중소형 폐가전 수거함 | https://www.e-cycle.or.kr/major_projects/customized_collection/ | 수거함 설치 장소(공동주택, 행정복지센터) |
| E-순환거버넌스 나눔폰 | https://www.e-cycle.or.kr/major_projects/nanum_phone/ | 휴대폰 기부, 문의 1899-7047 |
| 연수구 폐가전제품 무상 방문수거 | https://www.yeonsu.go.kr/main/part/clean/pickup.asp | 1개만 있어도 수거되는 품목(냉장고, 세탁기, 에어컨, TV, PC세트, 공기청정기, 제습기 등), 다량수거 품목 |
| 연수구 재활용가능자원 배출방법 | https://www.yeonsu.go.kr/discharge/kor/sub/method_recycle.asp | 1m 이하 소형 가전은 동 행정복지센터 전용수거함 |

E-순환거버넌스 예약 누리집(15990903.or.kr)은 화면을 스크립트로 그려서 내용을 읽지 못했다. 품목별 세부 조건은 위 인천시·연수구 자료를 따랐다.

「분리의 정석」 품목사전 (2026-11-26 수집):

| 출처 | URL | 사용한 값 |
|---|---|---|
| 기후에너지환경부 생활폐기물 분리배출 누리집 「분리의 정석」 품목사전 | https://wasteguide.or.kr/front/dischargeMethod/dictionary.do | 품목 1,560개의 이름, 폐기물 분류체계, 배출방법, 유의사항. 각 규칙의 출처 링크는 품목별 상세 페이지(`dictionaryView.do?niIdx=번호`)다 |

수집은 `scripts/scrape-wasteguide.mjs`(요청 사이 0.25초 간격, 동시 3개), 앱 데이터 변환은 `scripts/build-catalog.mjs`로 했다. 품목사전은 "배출방법은 지역별로 차이가 있을 수 있다"고 안내하므로, 앱은 요일·시간·장소·비용을 각 구청 규칙에서 가져온다.

처음 확인한 출처:

| 출처 | URL | 사용한 값 |
|---|---|---|
| 미추홀구 일반쓰레기 | https://www.michuhol.go.kr/main/content.do?sq=443 | 종량제 봉투 가격, 요일·시간(페이지 수정일 2026-03-09) |
| 미추홀구 대형폐기물 배출신고 | https://www.michuhol.go.kr/main/content.do?sq=442 | 신고 방법, 수거 요일, 시간, 소형 폐가전 |
| 미추홀구 대형폐기물 처리수수료표 | https://www.michuhol.go.kr/other/attach_down.do?sq=441&key=DB7770C867 | 의자·우산·매트리스 수수료(표 작성일 2019.01.29) |
| 미추홀구 재활용품 | https://www.michuhol.go.kr/main/content.do?sq=446 | 동별 요일, 품목별 요령 |
| 미추홀구 가정사업계폐기물 | https://www.michuhol.go.kr/main/content.do?sq=444 | 황색봉투·PP마대 가격, 수거 요일 |
| 연수구 생활폐기물 배출방법 | https://www.yeonsu.go.kr/main/part/clean/house.asp | 요일, 시간, 봉투 가격 |
| 연수구 올바른 생활폐기물 배출방법 | https://www.yeonsu.go.kr/discharge/kor/sub/method_domestic.asp | 배출 장소, 불연성 폐기물 |
| 연수구 재활용품 배출요령 | https://www.yeonsu.go.kr/main/part/clean/recycle.asp | 품목별 요령, 동별 요일 |
| 연수구 대형폐기물 배출방법 | https://www.yeonsu.go.kr/main/part/clean/large.asp | 신고 방법, 시간, 장소 |
| 연수구 대형폐기물 품목별 수수료 | https://www.yeonsu.go.kr/discharge/kor/sub/charge.asp | 의자·우산·매트리스 수수료 |
| 연수구 폐가전 무상 방문수거 | https://www.yeonsu.go.kr/main/part/clean/pickup.asp | 전자레인지 단일 수거, 소형가전 5개 조건 |
| 재활용품 분리배출 가이드라인 | https://www.guro.go.kr/raonkeditordata/2020/10/20201007_171440860_48470.pdf | 프라이팬·우산·깨진 유리·아이스팩·깨진 형광등 기준(구로구청 누리집 게시본, 지역 규칙이 없는 항목의 근거) |
| 인천시 폐가전 안내(작성일 2026-04-22) | https://www.incheon.go.kr/recycle/RC100300/3069041 | 전용 수거함은 수량과 무관하게 무료라는 배경 확인 |

연락처는 각 구 페이지의 안내를 썼다(미추홀구 1844-1652, 연수구 032-749-7852).

## 라이브러리

| 이름 | 용도 | 라이선스 |
|---|---|---|
| Next.js, React | 앱 프레임워크 | MIT |
| Tailwind CSS | 스타일 | MIT |
| TypeScript | 언어 | Apache-2.0 |
| @anthropic-ai/sdk | Claude API 호출 | MIT |
| Vitest | 단위 테스트 | MIT |
| ESLint | 코드 검사 | MIT |

정확한 버전은 `package.json`과 `package-lock.json`을 따른다.

## 아이콘·이미지

앱 아이콘과 화면의 아이콘은 이 프로젝트에서 직접 그렸다(PNG는 스크립트로 생성, 탭·카메라 아이콘은 인라인 SVG). 외부 이미지와 외부 글꼴은 쓰지 않았다.
