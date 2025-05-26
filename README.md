![시작사진](https://s3.ap-northeast-2.amazonaws.com/order.me/readme.png)
<br />

## 📌 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [팀 소개](#-팀-소개)
3. [주요 기능](#-주요-기능)
4. [시연 영상](#-시연-영상)
5. [주요 기술](#-주요-기술)
6. [기술 스택](#-기술-)
7. [기술 아키텍처](#-기술-아키텍처)
8. [프로젝트 구조](#-프로젝트-구조)
9. [산출물](#-산출물)
   <br />

## 💻 프로젝트 소개

**_SSAFY 12기 2학기 자율 프로젝트_**

> ⌛ 프로젝트 기간 : 2025.04.21 ~ 2025.05.22 (4.5주)

> 📆 상세 기간 : 기획 1주 + 개발 3.5주

> 🔗 [노션 링크](https://shiny-headlight-8fc.notion.site/AI-Order-me-1ddc09e299c6808398ecd681881b752f?pvs=4)

> 🖥️ [키오스크 배포 URL](https://kiosk.cofface.store)

> 📲 [앱 배포 URL](https://app.cofface.store)

### 🤖 "당신을 기억하는 스마트 주문 솔루션, Cofface(커페이스)!"

**✨ 더 이상 복잡한 주문은 그만! 얼굴 인식 한 번이면 주문, 결제, 적립, 추천까지 한 번에!**<br/>
커페이스는 얼굴 인식을 통해, 나만의 취향을 기억한 딱 맞는 커피 주문 경험을 제공합니다.<br/>
카페 사장님도, 손님도 모두 만족하는 똑똑한 키오스크 솔루션을 만나보세요!<br/>

**☕ 이런 분들을 위한 스마트 주문 솔루션이에요**<br/>
메뉴 고민 없이 단골 손님처럼 나를 알아보고 메뉴를 추천받고 싶은 분<br/>
얼굴만으로 빠르고 안전한 결제로 시간을 절약하고 싶은 분<br/>
여러 카페의 스탬프 적립, 주문 내역, 결제 관리까지 한 번에 하고 싶은 분<br/>
직관적인 UI와 편리한 주문을 경험하고 싶은 분<br/>

**🙆🏻 커페이스만의 특별한 기능**<br/>
3D depth 카메라로 얼굴을 인식해 자동 로그인 및 개인 맞춤 추천<br/>
AI 기반 성별/연령 분석으로 비회원도 맞춤 추천 제공<br/>
머리 모션 인식으로 손 없이도 인터페이스 제어<br/>
통합 시스템으로 여러 매장 주문 내역·스탬프 적립 현황 실시간 확인<br/>
실시간 푸시 알림으로 주문 완료 안내<br/>
얼굴만 인식하면 등록된 카드로 자동 결제<br/>

**👨🏻‍💻 이렇게 사용해보세요!**<br/>
1️⃣ 키오스크 앞에 서기만 하면 얼굴인식으로 자동 로그인 완료<br/>
2️⃣ 분석한 맞춤 메뉴를 확인하고 원하는 음료 선택<br/>
3️⃣ 등록된 카드로 자동결제 또는 QR코드로 간편 결제<br/>
4️⃣ 앱에서 실시간 알림을 받고 완성된 음료 픽업<br/>
5️⃣ 다음 방문 시, 내 취향에 맞는 추천 메뉴로 더 빠른 주문<br/>

**🔒 보안도 걱정 없어요!**<br/>
얼굴 데이터 암호화 및 분산 저장으로 개인정보 보호<br/>
3D depth 카메라로 정확하고 안전한 얼굴 인식<br/>

## 👥 팀 소개

<table style="text-align: center;" width="100%">
  <tr>
    <th style="text-align: center;" width="16.66%"><img src="https://enjoy-trip-static-files.s3.ap-northeast-2.amazonaws.com/88D65731-09D7-4950-A1A8-3FB20363A192-43052-00001CFE9E7EA0C9.png" width="150" height="150"/></th>
    <th style="text-align: center;" width="16.66%"><img src="https://github.com/user-attachments/assets/76820bca-f807-4af5-bf93-09c9335fcbee" width="150" height="150"/></th>
    <th style="text-align: center;" width="16.66%"><img src="https://github.com/user-attachments/assets/4b2e42fb-1005-4453-a418-02ae430bcd93" width="150" height="150"/></th>
    <th style="text-align: center;" width="16.66%"><img src="https://github.com/user-attachments/assets/f3be0d04-1132-46c5-affb-929d97fb0b58" width="150" height="150"/></th>
    <th style="text-align: center;" width="16.66%"><img src="https://enjoy-trip-static-files.s3.ap-northeast-2.amazonaws.com/C1DFE235-A57E-467C-A243-013363DDFBCC-43052-00001CFE3E2204E4.png" width="150" height="150"/></th>
    <th style="text-align: center;" width="16.66%"><img src="https://github.com/user-attachments/assets/4ac5efaf-080e-4b20-8796-13416f9e6cd5" width="150" height="150"/></th>
  </tr>
  <tr>
    <td style="text-align: center;" width="16.66%">이수환<br/><a href="https://github.com/getbravelee">@getbravelee</a></td>
    <td style="text-align: center;" width="16.66%">권규리<br/><a href="https://github.com/rnjs010">@rnjs010</a></td>
    <td style="text-align: center;" width="16.66%">김주찬<br/><a href="https://github.com/PoloCeleste">@PoloCeleste</a></td>
    <td style="text-align: center;" width="16.66%">박혜원<br/><a href="https://github.com/hyeOOO">@hyeOOO</a></td>
    <td style="text-align: center;" width="16.66%">서성우<br/><a href="https://github.com/bamtol2">@bamtol2</a></td>
    <td style="text-align: center;" width="16.66%">이혜령<br/><a href="https://github.com/hyerongii">@hyerongii</a></td>
  </tr>
  <tr>
    <td style="text-align: center;" width="16.66%">AI 개발 </br> (팀장)</td>
    <td style="text-align: center;" width="16.66%">프론트 개발</td>
    <td style="text-align: center;" width="16.66%">AI 개발</td>
    <td style="text-align: center;" width="16.66%">백엔드 개발</td>
    <td style="text-align: center;" width="16.66%">백엔드 개발</td>
    <td style="text-align: center;" width="16.66%">프론트 개발</td>
  </tr>
  <tr>
    <td style="text-align: center;" width="16.66%">AI모델 파인튜닝, 얼굴인식, 모션인식, 라이브니스, 얼굴등록</td>
    <td style="text-align: center;" width="16.66%">키오스크 전체 개발 및 UX/UI 디자인</td>
    <td style="text-align: center;" width="16.66%">보조모니터 프론트, 얼굴 검증 및 모션 인식 백엔드, 벡터 DB 클러스터링, GPU서버 구축, 인프라 세팅, CI/CD</td>
    <td style="text-align: center;" width="16.66%">ERD설계, 유저, 주문, 결제, 알림</td>
    <td style="text-align: center;" width="16.66%">ERD설계, 추천 알고리즘, 키오스크, 앱 선호조사</td>
    <td style="text-align: center;" width="16.66%">앱 전체 개발 및 UX/UI 디자인, 키오스크 메인/옵션/결제 화면 구현</td>
  </tr>
</table>

## ⌨️ 주요 기능

<details>
<summary><strong>APP</strong></summary>
<table style="text-align: center;" width="100%">
  <tr>
    <th style="text-align: center;" width="25%">회원가입/로그인</th>
    <th style="text-align: center;" width="25%">홈페이지 비활성화</th>
    <th style="text-align: center;" width="25%">홈페이지 활성화</th>
    <th style="text-align: center;" width="25%">홈페이지 하단</th>
  </tr>
  <tr>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src="" ></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
  </tr>
  <tr>
    <td style="text-align: center;" width="25%">문자 인증 회원가입/로그인 기능을 제공합니다.</td>
    <td style="text-align: center;" width="25%">정보가 등록되어있지 않은 사용자는 홈화면 기능이 비활성화 됩니다.</td>
    <td style="text-align: center;" width="25%">얼굴/결제 정보가 등록된 사용자만 홈화면이 활성화되며</br>방문한 카페와 횟수를 확인할 수 있습니다.</td>
    <td style="text-align: center;" width="25%">홈페이지 하단에는 얼굴 등록과 결제정보등록 버튼이 구성되어있습니다.</td>
  </tr>  
  <tr>
    <th style="text-align: center;" width="25%">메뉴선호조사</th>
    <th style="text-align: center;" width="25%">옵션선택조사</th>    
    <th style="text-align: center;" width="25%">설정</th>
    <th style="text-align: center;" width="25%">카드설정 페이지</th>
  </tr>
  <tr>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src="" ></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
  </tr>
  <tr>
    <td style="text-align: center;" width="25%">처음 가입한 사용자의 경우 자신이 좋아하는 메뉴들를 선택하면 <br/> 추후 추천 알고리즘에 반영됩니다.</td>
    <td style="text-align: center;" width="25%">자신이 자주 주문하는 옵션 선택을 선택하면 추후 추천 알고리즘에 반영됩니다.</td>
    <td style="text-align: center;" width="25%">설정 페이지 입니다.</td>
    <td style="text-align: center;" width="25%">자신이 등록한 결제 카드 정보를 간략하게 확인하고 수정할 수 있습니다.</td>
  </tr>
  <tr>
    <th style="text-align: center;" width="25%">얼굴등록</th>
    <th style="text-align: center;" width="25%">카드등록</th>
  </tr>
  <tr>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src="" ></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
  </tr>
  <tr>
    <td style="text-align: center;" width="25%">전면 카메라로 정면/좌/우/상/하 얼굴을 가이드라인에 맞게 캡쳐하여 등록할 수 있습니다.</td>
    <td style="text-align: center;" width="25%">카드번호, 유효기간, CVC, 비밀번호 앞 2자리를 통해 카드 결제 정보를 등록할 수 있습니다.</td>
  </tr> 
</table>

</details>

<details>
<summary><strong>키오스크</strong></summary>
<table style="text-align: center;" width="100%">
  <tr>
    <th style="text-align: center;" width="25%">얼굴인식 페이지</th>
    <th style="text-align: center;" width="25%">주문 페이지</th>
    <th style="text-align: center;" width="25%">옵션 선택</th>
    <th style="text-align: center;" width="25%">포장/방문 페이지</th>
  </tr>
  <tr>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src="" ></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
  </tr>
  <tr>
    <td style="text-align: center;" width="25%">처음 로그인 시 얼굴인식이 보조모니터를 통해 진행됩니다.</td>
    <td style="text-align: center;" width="25%">다양한 카테고리 기반으로 추천된 메뉴들을 한 메뉴씩 확인할 수 있습니다.</td>
    <td style="text-align: center;" width="25%">옵션의 얼음양, 샷추가, 온도, 사이즈를 선택할 수 있습니다.</td>
    <td style="text-align: center;" width="25%">포장/방문의 여부를 선택할 수 있습니다.</td>
  </tr>
    <tr>
    <th style="text-align: center;" width="25%">결제 페이지(자동)</th>
    <th style="text-align: center;" width="25%">결제 페이지(일반)</th>
    <th style="text-align: center;" width="25%">주문 완료 페이지</th>
    <th style="text-align: center;" width="25%">비회원 안내 페이지</th>
  </tr>
  <tr>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src="" ></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
    <td style="text-align: center;" width="25%"><img height="400" alt="" src=""></td>
  </tr>
  <tr>
    <td style="text-align: center;" width="25%">카드를 드래그하여 리더기 쪽으로 올리면 자동 결제가 진행됩니다.</td>
    <td style="text-align: center;" width="25%">비회원일 경우 다양한 페이로 결제를 진행할 수 있습니다.</td>
    <td style="text-align: center;" width="25%">주문 완료 후 주문 번호와 완료 메세지가 뜨게 됩니다.</td>
    <td style="text-align: center;" width="25%">비회원일 경우 앱 링크 QR코드가 제공되고, 사용자는 쉽게 앱을 설치해 이용할 수 있습니다.</td>
  </tr>
</table>

<table style="text-align: center;" width="100%">

</table>
</details>

## 🎥 시연 영상

### 📱 App

<table style="text-align: center;" width="100%">
  <tr>
    <th style="text-align: center;" width="33.33%">회원가입/로그인</th>
    <th style="text-align: center;" width="33.33%">선호조사</th>
    <th style="text-align: center;" width="33.33%">홈페이지</th>
  </tr>
  <tr>
    <td style="text-align: center;" width="33.33%"><img src="" height="400"></td>
    <td style="text-align: center;" width="33.33%"><img src="" height="400"></td>
    <td style="text-align: center;" width="33.33%"><img src="" height="400"></td>
  </tr>
</table>
<table style="text-align: center;" width="100%">
  <tr>
    <th style="text-align: center;" width="33.33%">카페 세부 페이지</th>
    <th style="text-align: center;" width="33.33%">얼굴 등록</th>
    <th style="text-align: center;" width="33.33%">카드 등록</th>
  </tr>
  <tr>
    <td style="text-align: center;" width="33.33%"><img src="" height="400"></td>
    <td style="text-align: center;" width="33.33%"><img src="" height="400"></td>
    <td style="text-align: center;" width="33.33%"><img src="" height="400"></td>
  </tr>
</table>

### 🧋 키오스크

<table style="text-align: center;" width="100%">
  <tr>
    <th style="text-align: center;" width="33.33%">얼굴 인식 로그인</th>
    <th style="text-align: center;" width="33.33%">주문-비회원</th>
    <th style="text-align: center;" width="33.33%">주문-회원</th>
  </tr>
  <tr>
    <td style="text-align: center;" width="33.33%"><img src="" height="400"></td>
    <td style="text-align: center;" width="33.33%"><img src="" height="400"></td>
    <td style="text-align: center;" width="33.33%"><img src="" height="400"></td>
  </tr>
</table>

## 🔍 주요 기술

<details>
<summary><strong>MSA</strong></summary>

- **서비스별 독립 배포**: 특정 서비스만 업데이트하더라도 다른 서비스에 영향 없음
- **기술 스택 유연성**: 각 서비스에 최적화된 기술 선택 가능
- **장애 격리**: 한 서비스의 장애가 전체 시스템으로 확산되지 않음
- **탄력적 확장**: 트래픽이 많은 피드 서비스만 선택적으로 확장 가능

#### &emsp; Config 서버 분리

- **중앙 집중식 구성 관리**: 모든 마이크로서비스의 설정을 한 곳에서 관리하여 일관성 유지
- **동적 설정 변경**: 서비스 재시작 없이 설정 변경 적용 가능 (Spring Cloud Config + Spring Cloud Bus)
- **환경별 설정 분리**: 개발/테스트/프로덕션 환경별 설정 용이
- **버전 관리**: Git 등과 연동하여 설정 이력 관리 가능
</details>

<details>
<summary><strong>SNS</strong></summary>

#### &emsp; Kafka를 활용한 사용자 활동 이벤트 기반 로깅 & 맞춤형 피드 추천 시스템

- **비동기 처리**: 사용자 활동 로깅이 메인 서비스의 응답 시간에 영향을 주지 않음
- **높은 처리량**: Kafka의 높은 처리량으로 대량의 사용자 활동을 빠르게 처리
- **내구성**: 데이터 유실 없이 사용자 활동 로그 보존
- **서비스 분리**: 로깅 처리 실패가 핵심 서비스에 영향을 주지 않음
- **확장성**: 데이터 처리 파이프라인 구축 용이(Kafka Connect, Kafka Streams 등 활용)
- **개인화**: 사용자별 관심사와 활동 패턴에 맞는 콘텐츠 제공
- **데이터 기반 의사결정**: 사용자 행동 데이터를 활용한 알고리즘 개선 가능
- **사용자 경험 향상**: 관련성 높은 콘텐츠로 참여도와 체류 시간 증가
- **콜드 스타트 문제 해결**: 다단계 추천 전략(팔로우->활동 기반->인기)으로 신규 사용자에게도
관련 콘텐츠 제공 가능
</details>

<details>
<summary><strong>채팅</strong></summary>

#### &emsp; STOMP 프로토콜 도입

- **메시지 형식 정의**: 메시지 구조화로 개발 복잡성 감소
- **간편한 라우팅**: @Controller와 @MessageMapping으로 메시지 처리 단순화
- **효율적인 세션 관리**: 채팅방별 연결 관리 자동화
- **표준화된 통신**: 다양한 클라이언트와 서버 간 호환성 확보
- **발행/구독 모델**: 유연한 메시지 전달 구조로 확장성 향상

#### &emsp; Kafka 메시지 브로커 통합

- **높은 확장성**: 브로커 추가와 파티셔닝을 통한 효율적인 병렬 처리
- **데이터 안정성**: 디스크 저장 및 복제를 통한 메시지 유실 방지
- **대용량 처리**: 대규모 실시간 메시징에 최적화된 아키텍처
- **장애 대응**: 장애 발생 시에도 메시지 보존 및 복구 가능
- **비동기 처리**: 채팅 서비스와 데이터 처리 로직의 분리로 응답성 향상

#### &emsp; MongoDB를 통한 채팅 데이터 저장

- **비정형 데이터 처리**: 이모티콘 등 다양한 형식의 채팅 내용 수용
- **고성능 읽기/쓰기**: 실시간 채팅에 필수적인 빠른 응답성 확보
- **확장성**: 샤딩을 통한 대용량 데이터 처리 지원
- **유연한 스키마**: 향후 기능 확장 시 스키마 변경 용이
- **인덱싱**: 효율적인 채팅 내역 검색 및 조회 가능

#### &emsp; SSE를 활용한 알림 기능 구현

- **리소스 효율성**: 폴링 방식 대비 서버 부하 감소
- **실시간 전달**: 즉각적인 알림으로 사용자 경험 향상
- **구현 단순성**: WebSocket 대비 간편한 구현 및 유지보수
- **브라우저 호환성**: 대부분의 모던 브라우저에서 지원
- **단방향 최적화**: 알림 특성에 맞는 서버→클라이언트 전용 통신 채널
</details>

<details>
<summary><strong>검색</strong></summary>

#### &emsp; **고성능 검색 기능**

- **역 인덱스 기반 고속 검색**: Elasticsearch의 역 인덱스 구조를 활용하여 대량의 문서에서도 밀리초 단위의 빠른 검색 결과를 제공합니다
- **한글 초성 검색**: 사용자가 "ㅋㅂㄷ"만 입력해도 "키보드"와 같은 결과를 찾을 수 있도록 jaso_tokenizer를 활용합니다.
- **자소 분리 분석**: "키보드"를 "ㅋㅣㅂㅗㄷㅡ"로 분석하여 부분 일치 검색이 가능하게 합니다.
- **오타 교정**: "zlqhem"(키보드의 영타)로 입력해도 "키보드"를 찾을 수 있는 fuzzy 검색을 지원합니다.
- **중간 일치 검색**: ngram 필터를 사용하여 단어의 중간부터 시작하는 검색어도 자동완성에 포함시킵니다
- **동의어 처리**: 동의어 사전을 구축하여 "스위치"와 "축"을 동일한 개념으로 인식하되, 정확한 용어에 더 높은 가중치를 부여합니다.

#### &emsp; **검색 최적화 전략**

- **필드 부스팅**: 제목, 태그 등 중요 필드에 더 높은 가중치를 부여하여 검색 관련성을 향상시킵니다.
- **인덱스 별칭 활용**: 인덱스 별칭(alias)을 사용하여 데이터 재인덱싱 없이 검색 최적화가 가능하게 합니다.
- **쿼리 최적화**: 필터 컨텍스트를 활용하고 적절한 쿼리 타입(term, match)을 선택하여 검색 성능을 향상시킵니다.

#### &emsp; **데이터 동기화 시스템**

- **실시간 동기화**: Logstash를 사용하여 MySQL 데이터를 10초 간격으로 Elasticsearch에 색인합니다.
- **증분 업데이트**: 변경된 데이터만 선별적으로 업데이트하여 시스템 부하를 최소화합니다.
- **배치 처리**: 전체 데이터는 Spring Batch를 활용하여 일 단위로 전체 재색인합니다.

#### &emsp; **사용자 경험 향상 기능**

- **최근 검색어 관리**: Redis를 활용하여 사용자별 최근 검색어를 저장하고 빠르게 조회합니다.
- **검색어 추천**: 사용자의 검색 패턴과 행동 데이터를 분석하여 개인화된 검색어를 추천합니다.
- **인기 검색어**: 3시간 간격으로 집계된 상위 10개 인기 검색어를 제공하고, 순위 변동(상승/하락/유지/신규)을 표시합니다.
- **자동완성**: 사용자 입력에 따라 실시간으로 관련 검색어를 제안하여 검색 편의성을 높입니다.
</details>

## 🔧 기술 스택

![기술스택1]()
![기술스택2]()

## 🗺️ 기술 아키텍처

![아키텍처]()

## 📂 프로젝트 구조

<details>
  <summary><strong>Back 폴더 구조 보기</strong></summary>
  <pre>
📦main
 ┣ 📂java
 ┃ ┗ 📂com
 ┃ ┃ ┗ 📂ssafy
 ┃ ┃ ┃ ┗ 📂orderme
 ┃ ┃ ┃ ┃ ┣ 📂common
 ┃ ┃ ┃ ┃ ┃ ┗ 📜ApiResponse.java
 ┃ ┃ ┃ ┃ ┣ 📂config
 ┃ ┃ ┃ ┃ ┃ ┣ 📜AppConfig.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📜AsyncConfig.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📜FCMConfig.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📜RedisConfig.java
 ┃ ┃ ┃ ┃ ┃ ┗ 📜SecurityConfig.java
 ┃ ┃ ┃ ┃ ┣ 📂kiosk
 ┃ ┃ ┃ ┃ ┃ ┣ 📂controller
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜KioskController.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PreferredOptionRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜UserPreferenceRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜CategoryResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜MenuDetailResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜MenuOptionCategoryResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜MenuOptionResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜MenuResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PreferenceOptionCategoryResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PreferenceOptionItemResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PreferredMenuCategoryResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PreferredMenuResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜RecommendedMenuResponse.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂mapper
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜CategoryMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜MenuMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PreferenceMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StoresMapper.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂model
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜Category.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜Menu.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜MenuOptionCategory.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OptionCategory.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OptionItem.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜Order.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderMenu.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderOption.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜StampPolicy.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜Store.java
 ┃ ┃ ┃ ┃ ┃ ┗ 📂service
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜CategoryService.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜MenuService.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PreferenceService.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StoreServices.java
 ┃ ┃ ┃ ┃ ┣ 📂manager
 ┃ ┃ ┃ ┃ ┃ ┣ 📂controller
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜MenuImageController.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜MenuImageUploadResponse.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂S3
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜S3Uploader.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂service
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜MenuImageService.java
 ┃ ┃ ┃ ┃ ┃ ┗ 📂statistics
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📂controller
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StatisticsController.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StatisticsRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜DailySalesResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜GenderAgePreferenceResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PopularMenuResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜WeeklySalesResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📂mapper
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StatisticsMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📂scheduler
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StatisticsScheduler.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📂service
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StatisticsService.java
 ┃ ┃ ┃ ┃ ┣ 📂notification
 ┃ ┃ ┃ ┃ ┃ ┣ 📂controller
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜FcmController.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜FcmTokenRegistrationRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜FcmMessageDto.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜FcmSendDto.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂mapper
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜FcmTokenMapper.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂model
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜FcmToken.java
 ┃ ┃ ┃ ┃ ┃ ┗ 📂service
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜FcmService.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜NotificationService.java
 ┃ ┃ ┃ ┃ ┣ 📂order
 ┃ ┃ ┃ ┃ ┃ ┣ 📂controller
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderController.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜StampController.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜UserOrderController.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderMenuResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderOptionResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜StampResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜TopMenuResponse.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂mapper
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OptionItemMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderMenuMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderOptionMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜StampHistoryMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜StampMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StampPolicyMapper.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂model
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜MenuFrequency.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OptionItem.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderMenu.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderOption.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜Stamp.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜StampHistory.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StampPolicy.java
 ┃ ┃ ┃ ┃ ┃ ┗ 📂service
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderService.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜StampService.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜UserOrderService.java
 ┃ ┃ ┃ ┃ ┣ 📂payment
 ┃ ┃ ┃ ┃ ┃ ┣ 📂controller
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜AutoPaymentController.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜PaymentController.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜AutoPaymentRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜CardRegistrationRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜MenuOrderRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OptionOrderRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PaymentApprovalRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PaymentConfirmRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PaymentRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜SetDefaultCardRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜CardCompanyResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PaymentInfoResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜PaymentResponseDto.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂exception
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜CardNotFoundException.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜CardRegistrationException.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂mapper
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜OrderMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PaymentInfoMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜PaymentMapper.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂model
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜CardInfo.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜Order.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜Payment.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜PaymentInfo.java
 ┃ ┃ ┃ ┃ ┃ ┗ 📂service
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜AutoPaymentService.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜CardService.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜PaymentService.java
 ┃ ┃ ┃ ┃ ┣ 📂recommendation
 ┃ ┃ ┃ ┃ ┃ ┣ 📂controller
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜RecommendationController.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜AdvancedMenuRecommendation.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜MenuWithOptionsDto.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜RecommendationResponse.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜RecommendedMenuGroup.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂mapper
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜RecommendationMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜WeatherMapper.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂model
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜GeoLocation.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜WeatherData.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜WeatherPreference.java
 ┃ ┃ ┃ ┃ ┃ ┗ 📂service
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜RecommendationService.java
 ┃ ┃ ┃ ┃ ┣ 📂security
 ┃ ┃ ┃ ┃ ┃ ┣ 📜CustomUserDetailsService.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📜JwtAuthenticationFilter.java
 ┃ ┃ ┃ ┃ ┃ ┗ 📜JwtTokenProvider.java
 ┃ ┃ ┃ ┃ ┣ 📂store
 ┃ ┃ ┃ ┃ ┃ ┣ 📂controller
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StoreController.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📂response
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StoreResponse.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂mapper
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StoreMapper.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂model
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜Store.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StoreVisit.java
 ┃ ┃ ┃ ┃ ┃ ┗ 📂service
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜StoreService.java
 ┃ ┃ ┃ ┃ ┣ 📂user
 ┃ ┃ ┃ ┃ ┃ ┣ 📂controller
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜AuthController.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📂request
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜AdminLoginRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜AdminRegisterRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜KioskSessionRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜PhoneLoginRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜RefreshTokenRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜VerificationConfirmRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜VerificationRequest.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜AdminDto.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜UserDto.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂mapper
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜AdminMapper.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜UserMapper.java
 ┃ ┃ ┃ ┃ ┃ ┣ 📂model
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜Admin.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜Gender.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜User.java
 ┃ ┃ ┃ ┃ ┃ ┗ 📂service
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜AdminService.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ 📜SmsService.java
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ 📜UserService.java
 ┃ ┃ ┃ ┃ ┗ 📜OrdermeApplication.java
 ┗ 📂resources
 ┃ ┗ 📂mappers
 ┃ ┃ ┣ 📂kiosk
 ┃ ┃ ┃ ┣ 📜CategoryMapper.xml
 ┃ ┃ ┃ ┣ 📜MenuMapper.xml
 ┃ ┃ ┃ ┣ 📜PreferenceMapper.xml
 ┃ ┃ ┃ ┗ 📜StoreMapper.xml
 ┃ ┃ ┣ 📂manager
 ┃ ┃ ┃ ┗ 📜StatisticsMapper.xml
 ┃ ┃ ┣ 📂notification
 ┃ ┃ ┃ ┗ 📜FcmTokenMapper.xml
 ┃ ┃ ┣ 📂order
 ┃ ┃ ┃ ┣ 📜OptionItemMapper.xml
 ┃ ┃ ┃ ┣ 📜OrderMenuMapper.xml
 ┃ ┃ ┃ ┣ 📜OrderOptionMapper.xml
 ┃ ┃ ┃ ┣ 📜StampHistoryMapper.xml
 ┃ ┃ ┃ ┣ 📜StampMapper.xml
 ┃ ┃ ┃ ┗ 📜StampPolicyMapper.xml
 ┃ ┃ ┣ 📂payment
 ┃ ┃ ┃ ┣ 📜OrderMapper.xml
 ┃ ┃ ┃ ┣ 📜PaymentInfoMapper.xml
 ┃ ┃ ┃ ┗ 📜PaymentMapper.xml
 ┃ ┃ ┣ 📂recommendation
 ┃ ┃ ┃ ┗ 📜RecommendationMapper.xml
 ┃ ┃ ┣ 📂store
 ┃ ┃ ┃ ┗ 📜StoreMapper.xml
 ┃ ┃ ┗ 📂user
 ┃ ┃ ┃ ┣ 📜AdminMapper.xml
 ┃ ┃ ┃ ┗ 📜UserMapper.xml
  </pre>
</details>

<details>
  <summary><strong>Front - kiosk 폴더 구조 보기</strong></summary>
  <pre>
📦src
 ┣ 📂assets
 ┃ ┗ 📜react.svg
 ┣ 📂components
 ┃ ┣ 📂ui
 ┃ ┃ ┣ 📜alert-dialog.tsx
 ┃ ┃ ┗ 📜button.tsx
 ┃ ┣ 📜CustomButton.tsx
 ┃ ┣ 📜CustomDialog.tsx
 ┃ ┣ 📜GestureDetector.tsx
 ┃ ┣ 📜Header.tsx
 ┃ ┣ 📜HighlightText.tsx
 ┃ ┣ 📜ReasonText.tsx
 ┃ ┣ 📜slotDigit.tsx
 ┃ ┗ 📜slotNumber.tsx
 ┣ 📂features
 ┃ ┣ 📂adminLogin
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┗ 📜LoginForm.tsx
 ┃ ┃ ┣ 📂hooks
 ┃ ┃ ┃ ┗ 📜useAdminLogin.ts
 ┃ ┃ ┗ 📂services
 ┃ ┃ ┃ ┗ 📜adminService.ts
 ┃ ┣ 📂order
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📂Main
 ┃ ┃ ┃ ┃ ┣ 📜AnimatedContainer.tsx
 ┃ ┃ ┃ ┃ ┣ 📜MenuInfo.tsx
 ┃ ┃ ┃ ┃ ┣ 📜OptionLayerComponent.tsx
 ┃ ┃ ┃ ┃ ┣ 📜OptionList.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ProgressBar.tsx
 ┃ ┃ ┃ ┃ ┗ 📜SlideButtion.tsx
 ┃ ┃ ┃ ┣ 📂Menu
 ┃ ┃ ┃ ┃ ┣ 📜AllMenuSection.tsx
 ┃ ┃ ┃ ┃ ┣ 📜MenuCard.tsx
 ┃ ┃ ┃ ┃ ┣ 📜OrderSection.tsx
 ┃ ┃ ┃ ┃ ┗ 📜RecommendSection.tsx
 ┃ ┃ ┃ ┣ 📂Option
 ┃ ┃ ┃ ┃ ┣ 📜OptionalOptionSection.tsx
 ┃ ┃ ┃ ┃ ┣ 📜OptionButton.tsx
 ┃ ┃ ┃ ┃ ┣ 📜OptionDialog.tsx
 ┃ ┃ ┃ ┃ ┗ 📜RequiredOptionSection.tsx
 ┃ ┃ ┃ ┣ 📂pay
 ┃ ┃ ┃ ┃ ┣ 📜FailContent.tsx
 ┃ ┃ ┃ ┃ ┣ 📜PayMethodButton.tsx
 ┃ ┃ ┃ ┃ ┣ 📜ProgressContent.tsx
 ┃ ┃ ┃ ┃ ┗ 📜SuccessContent.tsx
 ┃ ┃ ┃ ┣ 📂Receipt
 ┃ ┃ ┃ ┃ ┣ 📜ReceiptDialog.tsx
 ┃ ┃ ┃ ┃ ┗ 📜ReceiptItemList.tsx
 ┃ ┃ ┃ ┣ 📜MainContent.tsx
 ┃ ┃ ┃ ┣ 📜MenuContent.tsx
 ┃ ┃ ┃ ┣ 📜PayContent.tsx
 ┃ ┃ ┃ ┗ 📜PlaceSelectContent.tsx
 ┃ ┃ ┣ 📂hooks
 ┃ ┃ ┃ ┣ 📂pay
 ┃ ┃ ┃ ┃ ┣ 📜useClientKey.ts
 ┃ ┃ ┃ ┃ ┣ 📜useConfirmPay.ts
 ┃ ┃ ┃ ┃ ┣ 📜usePreparePay.ts
 ┃ ┃ ┃ ┃ ┗ 📜useProgressPay.ts
 ┃ ┃ ┃ ┣ 📜useAllMenu.ts
 ┃ ┃ ┃ ┣ 📜useAutoPay.ts
 ┃ ┃ ┃ ┣ 📜useCategory.ts
 ┃ ┃ ┃ ┣ 📜useCoupon.ts
 ┃ ┃ ┃ ┣ 📜useNewRecommend.ts
 ┃ ┃ ┃ ┣ 📜useOption.ts
 ┃ ┃ ┃ ┣ 📜useRecommendMenu.ts
 ┃ ┃ ┃ ┗ 📜useSlideAnimation.ts
 ┃ ┃ ┗ 📂services
 ┃ ┃ ┃ ┣ 📂pay
 ┃ ┃ ┃ ┃ ┣ 📜confirmPayService.ts
 ┃ ┃ ┃ ┃ ┣ 📜keyService.ts
 ┃ ┃ ┃ ┃ ┗ 📜preparePayService.ts
 ┃ ┃ ┃ ┣ 📜allMenuService.ts
 ┃ ┃ ┃ ┣ 📜autoPayService.ts
 ┃ ┃ ┃ ┣ 📜categoryService.ts
 ┃ ┃ ┃ ┣ 📜couponService.ts
 ┃ ┃ ┃ ┣ 📜newRecommendService.ts
 ┃ ┃ ┃ ┣ 📜optionService.ts
 ┃ ┃ ┃ ┗ 📜recommendMenuService.ts
 ┃ ┗ 📂userLogin
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📜NewStartScreen.tsx
 ┃ ┃ ┃ ┗ 📜NumKeyPad.tsx
 ┃ ┃ ┣ 📂hooks
 ┃ ┃ ┃ ┣ 📜useExtendSession.ts
 ┃ ┃ ┃ ┣ 📜useLogin.ts
 ┃ ┃ ┃ ┣ 📜useLogout.ts
 ┃ ┃ ┃ ┗ 📜useWeather.ts
 ┃ ┃ ┗ 📂services
 ┃ ┃ ┃ ┣ 📜extendSessionService.ts
 ┃ ┃ ┃ ┣ 📜faceRecogService.ts
 ┃ ┃ ┃ ┣ 📜logoutService.ts
 ┃ ┃ ┃ ┣ 📜phoneLoginService.ts
 ┃ ┃ ┃ ┗ 📜weatherService.ts
 ┣ 📂fonts
 ┃ ┣ 📜SUIT-Variable.woff2
 ┃ ┗ 📜SUITE-Variable.woff2
 ┣ 📂hooks
 ┃ ┗ 📜useDragScroll.ts
 ┣ 📂interfaces
 ┃ ┣ 📜OrderInterface.ts
 ┃ ┣ 📜PayInterface.ts
 ┃ ┣ 📜RecommendInterface.ts
 ┃ ┗ 📜UserInterface.ts
 ┣ 📂lib
 ┃ ┣ 📜axios.ts
 ┃ ┣ 📜changeCamera.ts
 ┃ ┣ 📜changeDisplay.ts
 ┃ ┣ 📜cookie.ts
 ┃ ┗ 📜utils.ts
 ┣ 📂pages
 ┃ ┣ 📂adminLogin
 ┃ ┃ ┗ 📜AdminLoginPage.tsx
 ┃ ┣ 📂order
 ┃ ┃ ┗ 📜OrderPage.tsx
 ┃ ┣ 📂pay
 ┃ ┃ ┣ 📜FailPage.tsx
 ┃ ┃ ┣ 📜PayPage.tsx
 ┃ ┃ ┗ 📜SuccessPage.tsx
 ┃ ┣ 📂userLogin
 ┃ ┃ ┗ 📜UserLoginPage.tsx
 ┃ ┗ 📜LoadingPage.tsx
 ┣ 📂stores
 ┃ ┣ 📜adminStore.ts
 ┃ ┣ 📜directOrderStore.ts
 ┃ ┣ 📜loginStore.ts
 ┃ ┣ 📜orderStore.ts
 ┃ ┣ 📜payStore.ts
 ┃ ┣ 📜recommendStore.ts
 ┃ ┗ 📜stepStore.ts
 ┣ 📂styles
 ┃ ┣ 📜colors.ts
 ┃ ┣ 📜fonts.tsx
 ┃ ┣ 📜RippleEffect.tsx
 ┃ ┗ 📜typography.ts
 ┣ 📂utils
 ┃ ┣ 📜calculateAge.ts
 ┃ ┣ 📜convertMenuToOrder.ts
 ┃ ┣ 📜formatOptionLabel.ts
 ┃ ┣ 📜generateReasonPart.ts
 ┃ ┗ 📜maskUserName.ts
 ┣ 📜App.tsx
 ┣ 📜config.ts
 ┣ 📜index.css
 ┣ 📜main.tsx
 ┗ 📜vite-env.d.ts
  </pre>
</details>

<details>
  <summary><strong>Front - userApp 폴더 구조 보기</strong></summary>
  <pre>
📦src
 ┣ 📂assets
 ┃ ┣ 📂drinks
 ┃ ┃ ┣ 📜cookie.png
 ┃ ┃ ┣ 📜greentea.png
 ┃ ┃ ┗ 📜strawberry.png
 ┃ ┣ 📂icons
 ┃ ┃ ┣ 📜icon-cookie.png
 ┃ ┃ ┣ 📜icon-greentea.png
 ┃ ┃ ┗ 📜icon-strawberry.png
 ┃ ┣ 📜face-scan.gif
 ┃ ┣ 📜ice.png
 ┃ ┣ 📜loading.gif
 ┃ ┣ 📜lock.png
 ┃ ┣ 📜logo.png
 ┃ ┣ 📜phone.png
 ┃ ┣ 📜scroll-down.gif
 ┃ ┣ 📜shield-check.gif
 ┃ ┣ 📜shield.png
 ┃ ┗ 📜wallet.png
 ┣ 📂components
 ┃ ┣ 📂ui
 ┃ ┃ ┣ 📜button.tsx
 ┃ ┃ ┣ 📜drawer.tsx
 ┃ ┃ ┗ 📜input.tsx
 ┃ ┣ 📜AuthRedirect.tsx
 ┃ ┣ 📜DetailHeader.tsx
 ┃ ┣ 📜LoadingMessage.tsx
 ┃ ┣ 📜MainButton.tsx
 ┃ ┣ 📜ProtectedRoute.tsx
 ┃ ┗ 📜WavyHeader.tsx
 ┣ 📂features
 ┃ ┣ 📂home
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📂home
 ┃ ┃ ┃ ┃ ┣ 📜HomeMainButton.tsx
 ┃ ┃ ┃ ┃ ┣ 📜HomeSelectDrinks.tsx
 ┃ ┃ ┃ ┃ ┣ 📜HomeTitleLock.tsx
 ┃ ┃ ┃ ┃ ┗ 📜HomeTitleUnlock.tsx
 ┃ ┃ ┃ ┗ 📂order
 ┃ ┃ ┃ ┃ ┣ 📜OrderHistorySection.tsx
 ┃ ┃ ┃ ┃ ┣ 📜StampSection.tsx
 ┃ ┃ ┃ ┃ ┗ 📜TopOrdersSection.tsx
 ┃ ┃ ┗ 📂services
 ┃ ┃ ┃ ┣ 📜homeService.ts
 ┃ ┃ ┃ ┗ 📜storeService.ts
 ┃ ┣ 📂login
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📜LoginCodeComponents.tsx
 ┃ ┃ ┃ ┣ 📜LoginComponents.tsx
 ┃ ┃ ┃ ┣ 📜LoginSelectModal.tsx
 ┃ ┃ ┃ ┣ 📜MainLoginButton.tsx
 ┃ ┃ ┃ ┗ 📜MainTopSection.tsx
 ┃ ┃ ┣ 📂hooks
 ┃ ┃ ┃ ┗ 📜useAuth.ts
 ┃ ┃ ┗ 📂services
 ┃ ┃ ┃ ┗ 📜authService.ts
 ┃ ┣ 📂register
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📂capture
 ┃ ┃ ┃ ┃ ┣ 📜ActionButton.tsx
 ┃ ┃ ┃ ┃ ┣ 📜CameraView.tsx
 ┃ ┃ ┃ ┃ ┣ 📜CapturedImages.tsx
 ┃ ┃ ┃ ┃ ┣ 📜CaptureHeader.tsx
 ┃ ┃ ┃ ┃ ┣ 📜FaceGuidelines.tsx
 ┃ ┃ ┃ ┃ ┣ 📜StageIndicator.tsx
 ┃ ┃ ┃ ┃ ┣ 📜StatusMessage.tsx
 ┃ ┃ ┃ ┃ ┗ 📜styles.ts
 ┃ ┃ ┃ ┗ 📂intro
 ┃ ┃ ┃ ┃ ┣ 📜FaceRegisterCheckModal.tsx
 ┃ ┃ ┃ ┃ ┣ 📜FaceRegisterMainButton.tsx
 ┃ ┃ ┃ ┃ ┣ 📜PayRandomKeyPad.tsx
 ┃ ┃ ┃ ┃ ┗ 📜PayRegisterComponents.tsx
 ┃ ┃ ┣ 📂hooks
 ┃ ┃ ┃ ┗ 📜useFaceDetection.tsx
 ┃ ┃ ┗ 📂services
 ┃ ┃ ┃ ┣ 📜captureService.ts
 ┃ ┃ ┃ ┗ 📜payService.ts
 ┃ ┣ 📂setting
 ┃ ┃ ┗ 📂components
 ┃ ┃ ┃ ┗ 📜CardComponent.tsx
 ┃ ┗ 📂survey
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📜MenuSelectContent.tsx
 ┃ ┃ ┃ ┣ 📜OptionSelectContent.tsx
 ┃ ┃ ┃ ┗ 📜SurveyHeader.tsx
 ┃ ┃ ┗ 📂services
 ┃ ┃ ┃ ┗ 📜surveyService.ts
 ┣ 📂fonts
 ┃ ┣ 📜SUIT-Variable.woff2
 ┃ ┗ 📜SUITE-Variable.woff2
 ┣ 📂interfaces
 ┃ ┣ 📜FaceRegisterInterfaces.ts
 ┃ ┣ 📜HomeInterfaces.ts
 ┃ ┣ 📜LoginInterfaces.ts
 ┃ ┣ 📜PayRegisterInterfaces.ts
 ┃ ┣ 📜StoreInterfaces.ts
 ┃ ┗ 📜SurveyInterfaces.ts
 ┣ 📂lib
 ┃ ┗ 📜utils.ts
 ┣ 📂mocks
 ┃ ┣ 📜mockStore.ts
 ┃ ┗ 📜testStore.ts
 ┣ 📂pages
 ┃ ┣ 📂home
 ┃ ┃ ┣ 📜HomePage.tsx
 ┃ ┃ ┗ 📜StorePage.tsx
 ┃ ┣ 📂login
 ┃ ┃ ┣ 📜LoginConfirmPage.tsx
 ┃ ┃ ┣ 📜LoginVerifyPage.tsx
 ┃ ┃ ┗ 📜MainPage.tsx
 ┃ ┣ 📂register
 ┃ ┃ ┣ 📜FaceRegisterCapturePage.tsx
 ┃ ┃ ┣ 📜FaceRegisterConfirmPage.tsx
 ┃ ┃ ┣ 📜FaceRegisterPage.tsx
 ┃ ┃ ┗ 📜PayRegisterPage.tsx
 ┃ ┣ 📂setting
 ┃ ┃ ┣ 📜SettingPage.tsx
 ┃ ┃ ┗ 📜SettingPayPage.tsx
 ┃ ┗ 📂survey
 ┃ ┃ ┗ 📜SurveyPage.tsx
 ┣ 📂services
 ┃ ┣ 📜api.ts
 ┃ ┗ 📜notificationService.ts
 ┣ 📂stores
 ┃ ┣ 📜authStore.ts
 ┃ ┗ 📜visitedStoreStore.ts
 ┣ 📂styles
 ┃ ┣ 📜colors.ts
 ┃ ┣ 📜fonts.tsx
 ┃ ┗ 📜typography.ts
 ┣ 📂utils
 ┃ ┣ 📜captureUtils.ts
 ┃ ┣ 📜cookieAuth.ts
 ┃ ┣ 📜firebaseUtils.ts
 ┃ ┗ 📜storeUtils.ts
 ┣ 📜App.tsx
 ┣ 📜config.ts
 ┣ 📜firebaseConfig.ts
 ┣ 📜index.css
 ┣ 📜main.tsx
 ┗ 📜vite-env.d.ts
  </pre>
</details>

## 📜 산출물

<details>
  <summary><strong>기능 명세서</strong></summary>
  <h3>🔹 소셜 로그인</h3>
  <img src="" alt="기능명세서">
  <h3>🔹 견적 게시판</h3>
  <img src="" alt="기능명세서">
  <h3>🔹 채팅</h3>
  <img src="" alt="기능명세서">
  <h3>🔹 키위페이</h3>
  <img src="" alt="기능명세서">
  <h3>🔹 마이페이지</h3>
  <img src="" alt="기능명세서">
  <img scr="" alt="기능명세서">
  <h3>🔹 SNS 피드</h3>
  <img src="" alt="기능명세서">
  <h3>🔹 검색</h3>
  <img src="" alt="기능명세서">
  <h3>🔹 상품 게시판</h3>
  <img src="" alt="기능명세서">
</details>

<details>
  <summary><strong>erd</strong></summary>
  <img src="" alt="erd">
</details>

<details>
  <summary><strong>피그마</strong></summary>
  <img src="" alt="피그마">
</details>

<details>
  <summary><strong>api 명세서</strong></summary>
  <h3>🔹 소셜 로그인</h3>
  <img src="" alt="api명세서">
  <h3>🔹 견적 게시판</h3>
  <img src="" alt="api명세서">
  <h3>🔹 채팅</h3>
  <img src="" alt="api명세서">
  <h3>🔹 키위페이</h3>
  <img src="" alt="api명세서">
  <h3>🔹 마이페이지</h3>
  <img src="" alt="api명세서">
  <h3>🔹 SNS 피드</h3>
  <img src="" alt="api명세서">
  <h3>🔹 검색</h3>
  <img src="" alt="api명세서">
  <h3>🔹 상품 게시판</h3>
  <img src="" alt="api명세서">
</details>
