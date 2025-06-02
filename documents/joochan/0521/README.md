

# 6주차

## 25.05.21



## DB

### MySQL

DB 내의 모든 테이블 날리기

```bash
SELECT CONCAT('DROP TABLE IF EXISTS `', table_name, '`;')
FROM information_schema.tables
WHERE table_schema = 'orderme';
```

### Qdrant

#### DB 클러스터링

얼굴 인식 데이터는 보안을 위해서 DB를 분산하여 저장하도록 해야하기 때문에, 클러스터링을 적용하였음.

각 Qdrant 서버는 물리적으로 분리된 서버 인스턴스에서 동작하고, WireGuard를 사용해 가상 사설망으로 연결하여 외부 망에서 접근이 힘들게 하였다.



##### 1. WireGuard 설치

```bash
# 사용할 모든 서버에 설치
sudo apt-get update && sudo apt-get install wireguard -y

# 각 서버에서 키 발급
wg genkey | tee privatekey | wg pubkey > publickey
```



##### 2. WireGaurd 세팅

```bash
[Interface]
PrivateKey = <1번 노드에서 발급한 개인키>
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = <2번 노드에서 발급한 공개키>
AllowedIPs = 10.0.0.2/32
Endpoint = <2번 노드 (공인) IP 또는 도메인>:51820
PersistentKeepalive = 25

[Peer]
PublicKey = <3번 노드에서 발급한 공개키>
AllowedIPs = 10.0.0.3/32
Endpoint = <3번 노드 (공인) IP 또는 도메인>:51820
PersistentKeepalive = 25

[Peer]
PublicKey = <4번 노드에서 발급한 공개키>
AllowedIPs = 10.0.0.4/32
Endpoint = <4번 노드 (공인) IP 또는 도메인>:51820
PersistentKeepalive = 25
```

이 세팅을 사용할 모든 서버에 동일하게 적용, 이때 각 노드에 맞춰서 인터페이스와 피어 수정 필요.

설정 작성이 끝났으면 적용시켜 준다.

```bash
# 모든 서버에서 WireGuard 시작
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0

# 연결 테스트
ping 10.0.0.2

# 암호화 키 발급
openssl rand -hex 32
```



##### 3. Qdrant 설치

수동으로 빌드하는 방법과 Docker로 실행하는 방법이 있는데, 여기서는 Docker로 이미지 가져와서 실행한다.

만약 사용하고 있던 Qdrant가 있다면 스냅샷 남긴 후 제거해주고 시작한다.



먼저 리더가 될 첫 번째 노드를 실행시켜 준다. 이때 자기 자신만 피어 목록으로 잡아 준다. 미리 모두 선언해주면 찾지 못하며, 이후에 선언될 노드들에서 피어를 지정해주면 자동으로 인식하기 때문이다.

```bash
docker run -d --name qdrant \
-p 6333:6333 -p 6334:6334 -p 6335:6335 \ # 6333(REST API), 6334(gRPC), 6335(P2P 통신)
-v $(pwd)/qdrant_storage:/qdrant/storage \ # 데이터를 저장할 로컬 디렉토리, 도커에 마운트
-e QDRANT__CLUSTER__ENABLED=true \ # 클러스터 모드 활성화
-e QDRANT__CLUSTER__DISCOVERY_METHOD=static \ # 정적 피어 목록을 사용
-e QDRANT__CLUSTER__P2P__PORT=6335 \ # P2P 통신에 사용할 포트 번호
-e QDRANT__CLUSTER__STATIC__PEERS=10.0.0.1:6335 \ # 클러스터 피어 목록
-e QDRANT__SERVICE__API_KEY="API 키" \ # REST API 요청 인증용
qdrant/qdrant \ # 사용할 도커 이미지 - 최신 1.14.0
./qdrant --uri http://10.0.0.1:6335 # 이 노드의 URI 주소 지정 (클러스터 내에서 이 노드를 식별하는 주소)
```



이후 나머지 노드들을 실행시켜준다. 이때, 클러스터 피어 목록을 계속 갱신시켜 줘야 한다.

###### 2

```bash
docker run -d --name qdrant \ # 같은 서버 인스턴스에서 여러 개의 도커로 할 경우 이름 다르게.
-p 6333:6333 -p 6334:6334 -p 6335:6335 \ # 6333(REST API), 6334(gRPC), 6335(P2P 통신)
-v $(pwd)/qdrant_storage:/qdrant/storage \
-e QDRANT__CLUSTER__ENABLED=true \
-e QDRANT__CLUSTER__DISCOVERY_METHOD=static \
-e QDRANT__CLUSTER__P2P__PORT=6335 \
-e QDRANT__CLUSTER__STATIC__PEERS=10.0.0.1:6335,10.0.0.2:6335 \ # 클러스터 피어 목록 갱신
-e QDRANT__SERVICE__API_KEY="API 키" \
qdrant/qdrant \
./qdrant --bootstrap http://10.0.0.1:6335 --uri http://10.0.0.2:6335 # 첫 번째 노드에 연결(bootstrap)하고 자신의 URI 지정
```

###### 3

```bash
docker run -d --name qdrant \ # 같은 서버 인스턴스에서 여러 개의 도커로 할 경우 이름 다르게.
-p 6333:6333 -p 6334:6334 -p 6335:6335 \
-v $(pwd)/qdrant_storage:/qdrant/storage \
-e QDRANT__CLUSTER__ENABLED=true \
-e QDRANT__CLUSTER__DISCOVERY_METHOD=static \
-e QDRANT__CLUSTER__P2P__PORT=6335 \
-e QDRANT__CLUSTER__STATIC__PEERS=10.0.0.1:6335,10.0.0.2:6335,10.0.0.3:6335 \ # 클러스터 피어 목록 갱신
-e QDRANT__SERVICE__API_KEY="API 키" \
qdrant/qdrant \
./qdrant --bootstrap http://10.0.0.1:6335 --uri http://10.0.0.3:6335 # 첫 번째 노드에 연결(bootstrap)하고 자신의 URI 지정
```

###### 4

```bash
docker run -d --name qdrant \ 
-p 6333:6333 -p 6334:6334 -p 6335:6335 \
-v $(pwd)/qdrant_storage:/qdrant/storage \
-e QDRANT__CLUSTER__ENABLED=true \
-e QDRANT__CLUSTER__DISCOVERY_METHOD=static \
-e QDRANT__CLUSTER__P2P__PORT=6335 \
-e QDRANT__CLUSTER__STATIC__PEERS=10.0.0.1:6335,10.0.0.2:6335,10.0.0.3:6335,10.0.0.4:6335 \
-e QDRANT__SERVICE__API_KEY="API 키" \
qdrant/qdrant \
./qdrant --bootstrap http://10.0.0.1:6335 --uri http://10.0.0.4:6335
```



#### 4. 설치 확인

```bash
curl -H "api-key: API 키" http://localhost:6333/cluster
```

정상 응답

```json
{
  "result":{
    "status":"enabled",
    "peer_id":2688715334810444,
    "peers":{
      "3338640081498217":{"uri":"http://10.0.0.4:6335/"},
      "5094325737698394":{"uri":"http://10.0.0.2:6335/"},
      "2688715334810444":{"uri":"http://10.0.0.1:6335/"},
      "517720741566645":{"uri":"http://10.0.0.3:6335/"}
    },
    "raft_info":{
      "term":2,
      "commit":17,
      "pending_operations":0,
      "leader":2688715334810444,
      "role":"Leader",
      "is_voter":true
    },
    "consensus_thread_status":{
      "consensus_thread_status":"working",
      "last_update":"2025-05-20T18:23:22.788794737Z"
    },
    "message_send_failures":{}
  },
  "status":"ok",
  "time":5.066e-6
}
```

