# main.py
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional, List, Any
import numpy as np
import base64
import cv2, os
import logging
from datetime import datetime
import json
import asyncio
import pyrealsense2 as rs
from contextlib import asynccontextmanager

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("realsense_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("realsense_server")




# 데이터 모델
class LivenessCheckRequest(BaseModel):
    rgb_image: str  # Base64 인코딩된 RGB 이미지

class LivenessResponse(BaseModel):
    is_live: bool
    depth_variation: float
    reason: str
    confidence: float
    min_depth: Optional[float] = None
    max_depth: Optional[float] = None
    mean_depth: Optional[float] = None
    std_depth: Optional[float] = None
    processing_time: float


# 웹소켓 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket 연결 생성: {websocket.client}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket 연결 종료: {websocket.client}")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        await websocket.send_json(message)

manager = ConnectionManager()


# RealSense 깊이 카메라 클래스
class RealSenseDepthCamera:
    def __init__(self):
        self.pipeline = None
        self.config = None
        self.is_running = False
        self.last_depth_frame = None
        self.last_color_frame = None
        self.last_frame_time = None

    def start(self):
        try:
            logger.info("RealSense 카메라 초기화 시도 중...")

            # RealSense 파이프라인 설정
            self.pipeline = rs.pipeline()
            self.config = rs.config()

            # RGB와 Depth 스트림 설정 (해상도와 FPS 조정)
            self.config.enable_stream(rs.stream.color, 640, 480, rs.format.bgr8, 30)
            self.config.enable_stream(rs.stream.depth, 640, 480, rs.format.z16, 30)

            # 파이프라인 시작
            self.pipeline.start(self.config)
            self.is_running = True
            logger.info("RealSense 카메라 초기화 완료")

            # 테스트용: 첫 프레임 확인
            frames = self.pipeline.wait_for_frames(timeout_ms=1000)
            if frames:
                logger.info("첫 프레임 획득 성공")
                # 프레임 저장
                depth_frame = frames.get_depth_frame()
                color_frame = frames.get_color_frame()

                if depth_frame and color_frame:
                    self.last_depth_frame = np.asanyarray(depth_frame.get_data())
                    self.last_color_frame = np.asanyarray(color_frame.get_data())
                    self.last_frame_time = datetime.now()
                    logger.info(f"RGB 프레임 크기: {self.last_color_frame.shape}, 깊이 프레임 크기: {self.last_depth_frame.shape}")
            else:
                logger.warning("첫 프레임 획득 실패")

            # 백그라운드에서 프레임 지속적으로 획득
            asyncio.create_task(self._capture_frames_continuously())

        except RuntimeError as e:
            logger.error(f"RealSense 런타임 오류: {e}")
            self.is_running = False
            if self.pipeline:
                try:
                    self.pipeline.stop()
                except:
                    pass
        except Exception as e:
            logger.error(f"RealSense 카메라 초기화 실패: {e}")
            logger.error(f"오류 타입: {type(e)}")
            self.is_running = False
            if self.pipeline:
                try:
                    self.pipeline.stop()
                except:
                    pass

    async def _capture_frames_continuously(self):
        """백그라운드에서 지속적으로 프레임을 획득하는 비동기 작업"""
        while self.is_running:
            try:
                # RealSense에서 프레임 획득
                frames = self.pipeline.wait_for_frames(timeout_ms=100)
                if not frames:
                    await asyncio.sleep(0.01)
                    continue

                # Depth 프레임과 Color 프레임 분리
                depth_frame = frames.get_depth_frame()
                color_frame = frames.get_color_frame()

                if depth_frame and color_frame:
                    # 프레임 저장 (스레드 안전을 위해 단순 대입 연산만 사용)
                    self.last_depth_frame = np.asanyarray(depth_frame.get_data())
                    self.last_color_frame = np.asanyarray(color_frame.get_data())
                    self.last_frame_time = datetime.now()

                # 잠시 대기 (CPU 과부하 방지)
                await asyncio.sleep(0.01)

            except Exception as e:
                logger.error(f"프레임 획득 중 오류: {e}")
                await asyncio.sleep(0.1)

    def get_frames(self):
        """현재 저장된 가장 최신 프레임 반환"""
        if not self.is_running:
            logger.debug("RealSense가 실행 중이지 않음")
            return None, None

        # 프레임 데이터가 없는 경우
        if self.last_color_frame is None or self.last_depth_frame is None:
            logger.debug("RealSense 프레임 데이터 없음")
            return None, None

        # 마지막 프레임 너무 오래되었을 경우 (500ms 이상)
        if self.last_frame_time and (datetime.now() - self.last_frame_time).total_seconds() > 0.5:
            logger.debug("RealSense 프레임이 너무 오래됨")
            return None, None

        return self.last_color_frame.copy(), self.last_depth_frame.copy()

    def get_depth_stats(self):
        """현재 깊이 프레임의 통계 정보 반환"""
        if self.last_depth_frame is None:
            return None

        depth_frame = self.last_depth_frame.copy()

        # 유효한 깊이 값만 필터링 (0이 아닌 값)
        valid_depths = depth_frame[depth_frame > 0]

        if len(valid_depths) < 100:  # 최소한의 유효 깊이 포인트
            return None

        # 통계 계산 (Python 기본 타입으로 변환)
        stats = {
            "min": float(np.min(valid_depths)),
            "max": float(np.max(valid_depths)),
            "mean": float(np.mean(valid_depths)),
            "median": float(np.median(valid_depths)),
            "std": float(np.std(valid_depths))
        }

        return stats

    def stop(self):
        self.is_running = False  # 먼저 플래그 변경하여 백그라운드 작업 중지

        if self.pipeline:
            try:
                self.pipeline.stop()
                logger.info("RealSense 카메라 종료")
            except Exception as e:
                logger.error(f"RealSense 종료 중 오류: {e}")


manager = ConnectionManager()


# 깊이 기반 라이브니스 체크 함수
def simple_liveness_check(depth_image: np.ndarray, face_bbox: tuple) -> dict:
    """
    간단한 입체감 기반 라이브니스 검사 (Passive 방식)
    """
    x1, y1, x2, y2 = face_bbox

    # 유효한 좌표로 변환
    height, width = depth_image.shape
    x1 = max(0, min(x1, width - 1))
    y1 = max(0, min(y1, height - 1))
    x2 = max(0, min(x2, width - 1))
    y2 = max(0, min(y2, height - 1))

    # 좌표가 뒤집힌 경우 수정
    if x1 > x2:
        x1, x2 = x2, x1
    if y1 > y2:
        y1, y2 = y2, y1

    # 영역이 너무 작으면 유효하지 않음
    if (x2 - x1) < 10 or (y2 - y1) < 10:
        return {
            "is_live": False,
            "reason": "얼굴 영역이 너무 작습니다",
            "depth_variation": 0,
            "confidence": 0
        }

    # 얼굴 영역의 깊이 값 추출
    face_depth = depth_image[y1:y2, x1:x2]

    # 유효한 깊이 값만 필터링
    valid_depths = face_depth[face_depth > 0]

    if len(valid_depths) < 100:  # 최소한의 유효 깊이 포인트
        return {
            "is_live": False,
            "reason": "유효한 깊이 데이터가 부족합니다",
            "depth_variation": 0,
            "confidence": 0
        }

    # 깊이 값의 범위 계산
    min_depth = float(np.min(valid_depths))
    max_depth = float(np.max(valid_depths))
    depth_variation = float(max_depth - min_depth)

    # 통계 계산
    mean_depth = float(np.mean(valid_depths))
    std_depth = float(np.std(valid_depths))

    # 깊이 변화가 100mm를 초과하면 비정상으로 판단
    MAX_DEPTH_THRESHOLD = 100  # mm
    MIN_DEPTH_THRESHOLD = 15  # mm

    # 깊이 변화가 15mm 이상, 100mm 이하여야 통과
    is_live = (depth_variation >= MIN_DEPTH_THRESHOLD) and (depth_variation <= MAX_DEPTH_THRESHOLD)

    # 신뢰도 계산 (깊이 변화를 기준으로)
    confidence = 0.0
    if is_live:
        # 15mm~100mm 사이에서 최적의 값은 50mm 정도로 설정
        if depth_variation < 50:
            confidence = float(depth_variation / 50)  # 15mm~50mm 사이는 0.3~1.0
        else:
            confidence = float(1.0 - ((depth_variation - 50) / 50))  # 50mm~100mm 사이는 1.0~0.0

    reason = "실제 얼굴로 판단됨"
    if not is_live:
        if depth_variation < MIN_DEPTH_THRESHOLD:
            reason = "평면 이미지로 판단됨 (깊이 변화 부족)"
        elif depth_variation > MAX_DEPTH_THRESHOLD:
            reason = "비정상적인 깊이 변화 감지됨 (과도한 깊이 변화)"

    return {
        "is_live": is_live,
        "depth_variation": depth_variation,
        "min_depth": min_depth,
        "max_depth": max_depth,
        "mean_depth": mean_depth,
        "std_depth": std_depth,
        "reason": reason,
        "confidence": confidence
    }


# 얼굴 위치 추정 함수 (단순 OpenCV Haar 캐스케이드 사용)
def detect_face(image):
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return None

    # 가장 큰 얼굴 선택
    faces = sorted(faces, key=lambda x: x[2] * x[3], reverse=True)
    x, y, w, h = faces[0]
    return (x, y, x + w, y + h)

# Base64 디코딩 함수
def base64_to_image(base64_str):
    """Base64 문자열을 OpenCV 이미지로 변환"""
    try:
        # "data:image/jpeg;base64," 프리픽스 제거
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]

        img_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        logger.error(f"Base64 디코딩 오류: {e}")
        return None


# 시스템 인스턴스 생성
realsense_camera = RealSenseDepthCamera()

# 시스템 초기화 미들웨어
@asynccontextmanager
async def lifespan(app: FastAPI):
    # RealSense 카메라 시작
    try:
        realsense_camera.start()
        logger.info("RealSense 카메라 초기화 완료")
    except Exception as e:
        logger.warning(f"RealSense 카메라 초기화 실패: {e}")

    yield

    # 종료 시 RealSense 정리
    realsense_camera.stop()

# 앱 초기화
app = FastAPI(title="RealSense 라이브니스 서버", lifespan=lifespan)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API 엔드포인트: 라이브니스 검사
@app.post("/check_liveness", response_model=LivenessResponse)
async def check_liveness(request: LivenessCheckRequest):
    """RGB 이미지를 받아 라이브니스 검사 수행"""
    start_time = datetime.now()
    try:
        # RGB 이미지 디코딩
        rgb_img = base64_to_image(request.rgb_image)
        if rgb_img is None:
            raise HTTPException(status_code=400, detail="RGB 이미지 디코딩 실패")

        # 얼굴 검출 (opencv 간단 검출 사용)
        face_bbox = detect_face(rgb_img)
        if face_bbox is None:
            raise HTTPException(status_code=400, detail="얼굴을 찾을 수 없음")

        # 라이브니스 검사 (RealSense 사용)
        liveness_result = None
        if realsense_camera.is_running:
            # RealSense 프레임 획득
            _, depth_frame = realsense_camera.get_frames()

            # 깊이 데이터가 있으면 라이브니스 검사 수행
            if depth_frame is not None and face_bbox is not None:
                liveness_result = simple_liveness_check(depth_frame, face_bbox)
                logger.info(f"라이브니스 검사 결과: {liveness_result}")
            else:
                raise HTTPException(status_code=500, detail="깊이 프레임을 가져올 수 없음")
        else:
            raise HTTPException(status_code=500, detail="RealSense 카메라가 작동 중이 아님")

        processing_time = (datetime.now() - start_time).total_seconds()

        # 원래 딕셔너리에 processing_time 추가
        liveness_result["processing_time"] = processing_time

        return liveness_result

    except Exception as e:
        logger.error(f"라이브니스 검사 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"라이브니스 검사 실패: {str(e)}")


# 웹소켓 엔드포인트: RealSense 영상 스트리밍
@app.websocket("/ws/realsense")
async def websocket_realsense(websocket: WebSocket):
    """RealSense 카메라 프레임을 실시간으로 전송"""
    await manager.connect(websocket)

    logger.info("RealSense 웹소켓 연결 시작")

    # RealSense가 제대로 초기화되었는지 확인
    if not realsense_camera.is_running:
        logger.warning("RealSense 카메라가 실행 중이지 않습니다. 시작 시도 중...")
        realsense_camera.start()

    try:
        while True:
            try:
                # 클라이언트로부터 메시지 수신 (라이브니스 체크 요청 대응)
                message_data = None
                try:
                    message_data = await asyncio.wait_for(websocket.receive_json(), timeout=0.01)
                except asyncio.TimeoutError:
                    # 타임아웃이 지나면 그냥 계속 진행
                    pass

                # 메시지가 있으면 처리
                if message_data and message_data.get('type') == 'check_liveness':
                    rgb_image = message_data.get('rgb_image')
                    if rgb_image:
                        rgb_img = base64_to_image(rgb_image)
                        face_bbox = detect_face(rgb_img)

                        if face_bbox and realsense_camera.is_running:
                            _, depth_frame = realsense_camera.get_frames()
                            if depth_frame is not None:
                                liveness_result = simple_liveness_check(depth_frame, face_bbox)
                                await manager.send_personal_message({
                                    "type": "liveness_result",
                                    "result": liveness_result
                                }, websocket)

                # RealSense에서 프레임 획득
                color_frame, depth_frame = realsense_camera.get_frames()

                if color_frame is None:
                    await asyncio.sleep(0.1)
                    continue

                # 색상 이미지를 JPEG로 인코딩
                _, buffer = cv2.imencode('.jpg', color_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                img_base64 = base64.b64encode(buffer).decode('utf-8')

                # 깊이 이미지도 시각화하여 전송
                depth_base64 = None
                depth_stats = None
                if depth_frame is not None:
                    # 깊이 시각화 (컬러맵 적용)
                    depth_colormap = cv2.applyColorMap(
                        cv2.convertScaleAbs(depth_frame, alpha=0.03),
                        cv2.COLORMAP_JET
                    )
                    _, depth_buffer = cv2.imencode('.jpg', depth_colormap, [cv2.IMWRITE_JPEG_QUALITY, 75])
                    depth_base64 = base64.b64encode(depth_buffer).decode('utf-8')

                    # 깊이 통계 계산
                    depth_stats = realsense_camera.get_depth_stats()

                # 프레임 전송
                message = {
                    "type": "frame",
                    "rgb_image": f"data:image/jpeg;base64,{img_base64}",
                    "timestamp": datetime.now().isoformat()
                }

                if depth_base64:
                    message["depth_image"] = f"data:image/jpeg;base64,{depth_base64}"

                if depth_stats:
                    message["depth_stats"] = depth_stats

                await manager.send_personal_message(message, websocket)

                # FPS 제한 (15fps - 네트워크 부하 고려)
                await asyncio.sleep(1 / 15)

            except Exception as e:
                logger.error(f"프레임 전송 중 오류: {e}")
                await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("RealSense 웹소켓 연결 종료")
    except Exception as e:
        logger.error(f"RealSense 웹소켓 치명적 오류: {e}")
        manager.disconnect(websocket)


@app.websocket("/ws/motion")
async def websocket_motion(websocket: WebSocket):
    """머리 움직임 모션 이벤트 처리를 위한 웹소켓"""
    await manager.connect(websocket)
    logger.info("모션 이벤트 웹소켓 연결 시작")

    try:
        while True:
            # 클라이언트로부터 메시지 수신
            message_data = await websocket.receive_json()

            if message_data.get('type') == 'motion_event':
                # 모션 이벤트 처리
                motion_type = message_data.get('motion_type')
                timestamp = message_data.get('timestamp')
                rotation = message_data.get('rotation', {})
                details = message_data.get('details', {})

                logger.info(f"모션 이벤트 감지: {motion_type}, yaw: {rotation.get('yaw')}, timestamp: {timestamp}")

                # 이벤트 처리 결과 응답
                await manager.send_personal_message({
                    "type": "motion_processed",
                    "motion_type": motion_type,
                    "processed_timestamp": datetime.now().isoformat(),
                    "success": True,
                    "message": f"모션 '{motion_type}' 처리 완료"
                }, websocket)

            elif message_data.get('type') == 'ping':
                # 연결 유지를 위한 ping-pong
                await manager.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                }, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("모션 이벤트 웹소켓 연결 종료")
    except Exception as e:
        logger.error(f"모션 웹소켓 처리 오류: {e}")
        try:
            await manager.send_personal_message({
                "type": "error",
                "message": f"서버 오류: {str(e)}"
            }, websocket)
        except:
            pass
        manager.disconnect(websocket)


# REST API 엔드포인트 추가
@app.post("/api/motion-event")
async def handle_motion_event(request: Request):
    """모션 이벤트 처리 REST API"""
    try:
        event_data = await request.json()
        motion_type = event_data.get('type')
        timestamp = event_data.get('timestamp', datetime.now().timestamp())

        logger.info(f"REST API로 모션 이벤트 수신: {motion_type}, timestamp: {timestamp}")

        # 간단한 로깅만 수행하거나 추가 처리 로직 구현
        event_time = datetime.fromtimestamp(timestamp / 1000.0).isoformat() if timestamp else "알 수 없음"

        return {
            "success": True,
            "message": f"모션 '{motion_type}' 이벤트가 {event_time}에 처리되었습니다",
            "processed_timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"모션 이벤트 처리 오류: {e}")
        return {
            "success": False,
            "message": f"처리 중 오류 발생: {str(e)}",
            "processed_timestamp": datetime.now().isoformat()
        }

# 서버 상태 확인
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    # RealSense 상태 확인
    realsense_info = {
        "realsense_available": realsense_camera.is_running,
        "realsense_status": "연결됨" if realsense_camera.is_running else "연결 안됨"
    }

    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "type": "local_liveness_server",
        **realsense_info
    }

@app.get("/test-realsense")
async def test_realsense():
    """RealSense 테스트 엔드포인트"""
    try:
        if not realsense_camera.is_running:
            return {
                "status": "error",
                "message": "RealSense가 실행 중이지 않습니다",
                "is_running": False
            }

        # 프레임 획득 시도
        color, depth = realsense_camera.get_frames()

        if color is None or depth is None:
            return {
                "status": "error",
                "message": "프레임 획득 실패",
                "is_running": realsense_camera.is_running
            }

        # 기본 통계 정보
        depth_stats = realsense_camera.get_depth_stats()

        return {
            "status": "success",
            "message": "RealSense 작동 중",
            "is_running": True,
            "color_shape": list(color.shape) if color is not None else None,
            "depth_shape": list(depth.shape) if depth is not None else None,
            "depth_stats": depth_stats
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"테스트 중 오류: {str(e)}",
            "is_running": realsense_camera.is_running
        }

# 메인 실행
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)