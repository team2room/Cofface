# 4월 21일 - 기획 아이디어 도출

<br/>
<br/>

# **치매환자 배회 감지 서비스**

## ✅ **기획배경**

- 치매 환자의 약 60%가 질병 경과 중 한 번 이상 배회 증상을 보이며, 국내에서도 치매 환자의 실종 신고가 연간 1만 건 이상 발생, 이 중 일부는 사망으로 이어질 정도로 위험성이 큼[1](https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027&act=view&list_no=378232&tag=&nPage=38)[4](https://www.mstoday.co.kr/news/articleView.html?idxno=94243)[5](https://www.ablenews.co.kr/news/articleView.html?idxno=219727).
- 배회는 주로 공간지각력 저하, 방향감각 상실 등 뇌기능 저하로 인해 발생하며, 집 안팎에서 실종 및 사고로 이어질 가능성이 높음.
- 현재 제공 중인 배회감지기, 인식표, 지문 사전등록 등 예방 서비스의 이용률은 3% 내외로 매우 낮아 실질적 보호망 확대가 시급함[7](https://www.womaneconomy.co.kr/news/articleView.html?idxno=227865)[14](https://www.dementianews.co.kr/news/articleView.html?idxno=6627).
- 기존 배회감지기는 단순 위치 추적에 그치거나, 실내·외 연동, 행동 패턴 분석 등에서 한계가 존재함[6](https://www.nhis.or.kr/static/alim/paper/oldpaper/202201/sub/15.html)[8](https://www.kihasa.re.kr/hswr/assets/pdf/977/journal-36-3-393.pdf).

### 관련 자료

- **치매 환자의 배회 행동과 위험성**
    
    > 치매 환자는 해가 진 후 과민 반응이나 강박적 행동, 그리고 집 밖을 방황하는 '배회' 증상을 자주 보입니다.실제로 치매 환자의 사망 원인 중 배회로 인한 교통사고, 추락 등 사고사가 흔하며,뇌기능 저하(특히 전두엽, 두정엽)로 인해 공간지각능력이 떨어져 집안에서도 길을 잃거나,집 밖에서 방황하다 실종되는 경우가 많습니다.“치매 환자의 경우 해가 진 후에 과민 반응을 보이거나 강박적인 행동을 나타내는 경우가 많은데, 이를 ‘일몰 후 증후군’이라 한다. 낮에는 유순하지만 해가 진 오후만 되면 안절부절 못하거나, 집 밖에서 방황을 하기도 하며 심지어 밤새도록 밖을 헤매면서 돌아다니기도 한다... 치매 환자들이 배회를 하는 이유는 뇌기능의 저하에서 찾을 수 있다.”
    > 
- **배회 증상 빈도**
    
    > “치매환자의 10명 중 6명은 한 번 이상 배회 증상을 겪는다. 치매환자는 겉으로는 실종상태인지 알 수 없는 경우가 많으므로 배회를 하다 결국 가족의 품으로 돌아가지 못하고 실종되는 경우가 적지 않다.”
    > 
- **배회감지기 등 관리기술**
    
    > “중앙치매센터는 『치매환자 실종 예방 대응 가이드북』을 발간해 배회 원인별 대처법을 안내하고 있으며,일부 지역 치매센터에서는 배회감지기를 배부하고 있다.”
    > 

## **국내 실태 및 통계**

- **치매노인 실종 신고 건수**
    - 2023년 한 해 동안 치매환자 실종 신고는 **1만 4,677건**으로, 최근 5년간 21% 증가했습니다[1](https://www.dementianews.co.kr/news/articleView.html?idxno=7522)[6](https://m.healthcaren.com/news/news_article_yong.jsp?mn_idx=535335).
    - 실종된 치매환자가 숨진 채 발견된 사례는 한 해 83건에 달합니다[1](https://www.dementianews.co.kr/news/articleView.html?idxno=7522)[3](https://v.daum.net/v/20230920043020146).
    - 실종 치매환자 중 약 **1%**는 사망한 상태로 발견되고, 실제 사망자는 이보다 많을 것으로 추정됩니다[3](https://v.daum.net/v/20230920043020146).
- **배회감지기 이용률**
    - 치매환자(노인장기요양보험 수급자) 중 배회감지기 이용률은 **2.9%**로 매우 낮은 편입니다[1](https://www.dementianews.co.kr/news/articleView.html?idxno=7522)[6](https://m.healthcaren.com/news/news_article_yong.jsp?mn_idx=535335).
- **배회 증상 경험률**
    - 국내 조사에 따르면, 치매 환자를 돌보는 가족 중 **73%**가 ‘배회로 인한 실종’을 경험했다고 답했습니다[4](https://synapse.koreamed.org/upload/synapsedata/pdfdata/0196dnd/dnd-13-74.pdf).

## ✅ 기능

### 1. 메인기능

- ⭐ **워치의 GPS/움직임 패턴 분석 - 메인기능**
    
    → **집 근처가 아닌 낯선 곳을 일정 시간 이상 배회/이동**
    
    → “평소와 다른 동선”(AI가 학습) 감지 시, 즉시 보호자에게 **위치알림** 및 **워치 진동+‘돌아가세요’ 메시지**
    
    - 환자의 GPS 데이터를 1~2주간 저장해 ‘자주 가는 위치(집, 가족 집, 단골 가게 등)’와 ‘주요 경로’를 자동 기록
    - 새로운 이동 경로가 이 범위를 벗어나면 보호자에게 알림(간단한 이상치 탐지 알고리즘 활용)
    - 외출 시 목적지 입력 기능 추가 → 해당 경로 이탈 시 실시간 경고
    - 반복적 이동, 무작위 이동 등 패턴 감지(거리, 방향, 이동 경로의 변화 등 추가 분석)
- **급소리/이상 행동(움직임 급증, 신체 떨림 등) 감지**
    - 워치의 마이크/센서로 갑작스러운 고성, 혼잣말, 평소와 다른 움직임(갑자기 서성임, 빠른 걸음 등) 패턴을 AI가 감지
    - 보호자에게 “이상 행동 감지” 문자/앱 푸시 알림 + 워치로 안심 메시지 송출

### 2. 추가기능

- **‘집 나감’ 감지**
    - 현관문에서 특정 움직임(워키토키/자이로센서) + GPS 이탈 조합
- **중요 물건 분실 방지**
    - 환자가 자주 잊어버리는 물건(지갑, 열쇠, 휴대폰)에 저전력 블루투스 태그를 부착
    - 워치와 연결하여, 외출 시 ‘물건 두고 나가면 진동/음성 알림’
- **일상 스케줄 리마인더**
    - 약 복용, 식사, 일정 등 시간이 다가오면 워치에서 음성/진동 알림
    - 반복 일정, 보호자 직접 음성 안내(녹음 등록)도 가능
- **“지금 어디 계신가요?” 등 자동/주기적 질문**
    - 환자가 버튼 또는 음성 답변하면, 정상인지 AI가 패턴 분석
    - 장기간 미응답/이상 답변 시 보호자에 경고

## ✅ 기술

### **1. 규칙 기반(Rule-based) 감지**

- **기본 위치(집)에서 일정 거리 이상 벗어나면 알림**
    - 예: 집 좌표에서 반경 200m 이상 이동 시 경고
- **야간(예: 21시~06시) 시간대 외출 시 알림**
- **특정 시간 이상(예: 30분) 한 곳에 정지/머무르면 알림**
- **이동 경로에 급격한 변화(짧은 시간에 멀리 이동) 감지**

### **2. 간단한 이상치(Anomaly) 탐지**

- **이동 거리/경로의 평균, 표준편차 계산**
    - 예: 최근 일주일 이동 데이터를 저장 → 오늘 이동 경로가 평균에서 크게 벗어나면 이상 감지
- **클러스터링(예: K-means)로 ‘주요 위치’와 ‘이상 위치’ 구분**
    - 주요 위치(집, 단골 가게 등) 외에 처음 가는 곳이면 알림

### **3. 머신러닝 적용**

- **이상치 탐지용 Isolation Forest, One-Class SVM 등**
    - 위치/시간/이동 거리 데이터를 입력해 ‘정상/비정상’ 구분
- **지도학습이 아닌 비지도학습(라벨 없는 데이터로 학습)**

<br/>
<br/>
<br/>


# 치매환자를 위한 추억게임

## ✅ **기획배경**

- 치매 환자는 기억력 저하와 함께 가족, 지인, 과거 경험에 대한 인지와 감정 반응이 약화되어 일상생활의 만족도와 정서적 안정감이 크게 떨어질 수 있습니다.
- 회상치료(추억 사진, 가족 사진 등 개인적 기억을 자극하는 활동)는 치매 환자의 정서적 안정, 자존감, 삶의 만족도 향상에 효과가 있음이 여러 연구에서 입증되었습니다[3](https://pmc.ncbi.nlm.nih.gov/articles/PMC10848130/).
- AI를 활용해 가족·지인 사진, 추억 사진을 자동으로 큐레이션하고, 맞춤형 퀴즈와 상호작용을 제공하면 환자와 가족 모두에게 긍정적 경험과 인지 자극을 줄 수 있습니다[1](http://www.ella-ai-care.com/)[3](https://pmc.ncbi.nlm.nih.gov/articles/PMC10848130/).
- 감정 인식 및 기억력 퀴즈를 포함한 인터랙티브 게임은 치매 환자의 인지기능 유지, 감정 표현 능력 향상, 가족과의 유대 강화에 기여할 수 있습니다[3](https://pmc.ncbi.nlm.nih.gov/articles/PMC10848130/)[5](https://academic.oup.com/acn/advance-article/doi/10.1093/arclin/acaf012/8026196?searchresult=1).

## ✅ **주요 기능**

### 1. 메인기능

- **AI 사진 큐레이션 및 퀴즈 생성**
    - 가족·지인·추억 사진을 자동 분류(인물, 장소, 이벤트 등) 및 큐레이션
    - 사진 속 인물, 장소, 시기 등을 묻는 맞춤형 기억력 퀴즈 자동 생성
    - 사진에 얽힌 에피소드, 가족과의 추억을 회상하도록 유도하는 질문 제공[3](https://pmc.ncbi.nlm.nih.gov/articles/PMC10848130/)

### 2. 추가기능

- **감정 퀴즈 및 감정 인식 훈련**
    - 사진 속 인물의 표정(기쁨, 슬픔, 놀람 등)을 AI가 분석, 감정 맞추기 퀴즈 제공[5](https://academic.oup.com/acn/advance-article/doi/10.1093/arclin/acaf012/8026196?searchresult=1)
    - 다양한 표정 사진을 활용해 감정 인식 능력 훈련
- **음성 기반 상호작용**
    - 음성 안내 및 답변 기능(사진 설명, 퀴즈 진행, 정답 피드백 등)
    - 사용자의 답변을 음성으로 인식, 자연스러운 대화 흐름 제공[3](https://pmc.ncbi.nlm.nih.gov/articles/PMC10848130/)[4](https://www.news-medical.net/news/20230628/CognoSpeak-AI-tool-uses-speech-technology-to-quickly-assess-dementia-risk.aspx)
- **개인 맞춤형 난이도 조정**
    - 환자의 인지 수준, 진행 상황에 따라 퀴즈 난이도 및 유형 자동 조정[1](http://www.ella-ai-care.com/)
    - 가족·보호자가 직접 사진, 에피소드, 퀴즈를 등록·수정 가능
- **회상 및 감정 기록**
    - 환자의 답변, 감정 반응, 회상 내용 등을 자동 저장 및 분석
    - 보호자·의료진에게 환자의 인지·정서 상태 리포트 제공

## ✅ 기술

- **컴퓨터 비전(AI 이미지 분석)**
    - 얼굴 인식, 인물 분류, 표정(감정) 인식
    - **DeepFace, OpenCV, MediaPipe** 등 오픈소스 라이브러리 활용
        - 사진에서 얼굴 검출 및 인식(등록된 가족/지인 구분)
        - 표정 감정 분류(기쁨/슬픔/중립 등)
    - **Google Vision API, Azure Face API** 등 클라우드 서비스 활용
        - API 호출로 얼굴/감정/객체 인식 결과 받아오기
        - 복잡한 모델 학습 없이도 높은 정확도
- **자연어 처리(NLP) 및 대화형 AI**
    - 사진 설명, 퀴즈 질문 생성, 음성/텍스트 기반 대화 및 피드백[3](https://pmc.ncbi.nlm.nih.gov/articles/PMC10848130/)[4](https://www.news-medical.net/news/20230628/CognoSpeak-AI-tool-uses-speech-technology-to-quickly-assess-dementia-risk.aspx)
    - **Dialogflow, Microsoft Bot Framework, Rasa** 등 챗봇 플랫폼 활용
        - 클릭 몇 번, 간단한 스크립트 작성으로 대화형 퀴즈, 피드백 구현[2](https://www.digitalocean.com/resources/articles/ai-side-project-ideas)[4](https://www.upgrad.com/blog/top-artificial-intelligence-project-ideas-topics-for-beginners/)
    - **HuggingFace Transformers**에서 제공하는 사전학습(한국어 지원) 모델 활용
        - 질문 생성, 간단한 답변 평가 등
    - **음성 입출력**은 Google Speech-to-Text, Naver CLOVA Speech 등 API 활용
- **음성 인식 및 합성**
    - 사용자의 음성 답변 인식 및 AI 음성 안내 기능[4](https://www.news-medical.net/news/20230628/CognoSpeak-AI-tool-uses-speech-technology-to-quickly-assess-dementia-risk.aspx)
- **개인화 알고리즘**
    - 환자별 선호도, 인지 수준, 가족 정보 기반 맞춤형 콘텐츠 추천 및 난이도 조정[1](http://www.ella-ai-care.com/)[3](https://pmc.ncbi.nlm.nih.gov/articles/PMC10848130/)
- **데이터베이스 및 개인정보 보호**
    - 사진, 가족 정보, 퀴즈 기록 등 개인정보 안전 저장 및 관리
    
    | **기능** | **구현 방법/도구 예시** |
    | --- | --- |
    | 가족/지인 얼굴 인식 | DeepFace, Google Vision API |
    | 감정 인식 | DeepFace, Azure Face API |
    | 사진 기반 퀴즈 | Python 스크립트 + 챗봇 플랫폼 |
    | 대화형 퀴즈 | Dialogflow, Rasa, HuggingFace |
    | 음성 입출력 | Google Speech-to-Text, TTS API |

<br/>
<br/>
<br/>


# AI 키오스크

## ✅ 기획 배경

- 최근 무인 주문 키오스크는 패스트푸드, 리테일 등 다양한 분야에서 표준이 되고 있으며, 주문 효율성과 고객 편의성을 크게 높이고 있습니다[1](https://triuminfo.com/welcome/kiosk)[6](https://www.trendhunter.com/trends/facial-recognition-kiosk).
- AI와 얼굴 인식 기술을 접목한 키오스크는 고객 식별, 주문 이력 기반 맞춤 추천, 자동 쿠폰 적립 등 기존 키오스크보다 한 단계 진화된 개인화 경험을 제공합니다[2](https://www.businessinsider.com/order-burgers-with-your-face-at-caliburger-2017-12)[3](https://www.infinitebs.net/blog/AI-Powered_Kiosks_Future_Personalized_Customer_Interactions.html)[4](https://www.2077.ai/news/19.html)[8](https://itrexgroup.com/blog/facial-recognition-benefits-applications-challenges/).
- 이러한 AI 키오스크는 반복 방문 고객의 충성도와 만족도를 높이고, 주문 과정의 번거로움을 줄여 매장 운영 효율을 극대화할 수 있습니다[2](https://www.businessinsider.com/order-burgers-with-your-face-at-caliburger-2017-12)[4](https://www.2077.ai/news/19.html)[5](https://www.capillarytech.com/blog/10-powerful-ways-ai-is-revolutionizing-loyalty-in-retail/).

## ✅ 주요 기능

- **얼굴 인식 기반 고객 식별**
    - 고객이 키오스크 앞에 서면 얼굴 인식으로 자동 로그인, 별도 카드나 번호 입력 없이 간편하게 주문 시작[2](https://www.businessinsider.com/order-burgers-with-your-face-at-caliburger-2017-12)[6](https://www.trendhunter.com/trends/facial-recognition-kiosk)[8](https://itrexgroup.com/blog/facial-recognition-benefits-applications-challenges/).
    - 얼굴 등록은 스마트폰 앱에서 진행. 정면 좌/우 위/아래 저장.
- **맞춤형 주문 지원**
    - 최근 주문 내역, 선호 메뉴, 추천 메뉴 자동 제시[2](https://www.businessinsider.com/order-burgers-with-your-face-at-caliburger-2017-12)[3](https://www.infinitebs.net/blog/AI-Powered_Kiosks_Future_Personalized_Customer_Interactions.html)[4](https://www.2077.ai/news/19.html).
    - 고객별 취향·구매 패턴을 분석해 개인화된 메뉴·이벤트 추천[3](https://www.infinitebs.net/blog/AI-Powered_Kiosks_Future_Personalized_Customer_Interactions.html)[5](https://www.capillarytech.com/blog/10-powerful-ways-ai-is-revolutionizing-loyalty-in-retail/).
- **쿠폰 적립 및 멤버십 연동**
    - 얼굴 인식으로 멤버십 자동 적립, 쿠폰·포인트 사용 안내[2](https://www.businessinsider.com/order-burgers-with-your-face-at-caliburger-2017-12)[8](https://itrexgroup.com/blog/facial-recognition-benefits-applications-challenges/).
- **하이퍼퍼스널 인터페이스**
    - AI가 고객 행동·이력 데이터를 분석해 실시간으로 맞춤형 프로모션, 할인, 이벤트 안내[3](https://www.infinitebs.net/blog/AI-Powered_Kiosks_Future_Personalized_Customer_Interactions.html)[4](https://www.2077.ai/news/19.html)[5](https://www.capillarytech.com/blog/10-powerful-ways-ai-is-revolutionizing-loyalty-in-retail/).
- **AI 챗봇/음성 인터페이스**
    - 음성 안내, 대화형 주문 지원