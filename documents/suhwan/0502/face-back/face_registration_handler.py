# face_registration_handler.py
import cv2
import numpy as np
import time
from insightface.app import FaceAnalysis
from fastapi import WebSocket
import json
import base64
import asyncio
from typing import Dict, List, Tuple, Optional


class FaceRegistrationHandler:
    def __init__(self, face_app: FaceAnalysis):
        self.face_app = face_app
        self.stable_time_required = 3.0  # 안정화에 필요한 시간 (초)
        self.angle_threshold = 15.0  # 각도 허용 오차 (도)

        # 등록 방향 정의
        self.directions = ["front", "left", "right", "up", "down"]
        self.target_angles = {
            "front": (0, 0),  # (yaw, pitch) - 정면
            "left": (-30, 0),  # 좌측 30도
            "right": (30, 0),  # 우측 30도
            "up": (0, -20),  # 위쪽 20도
            "down": (0, 20)  # 아래쪽 20도
        }

        # 기준 랜드마크
        self.reference_landmarks = None

    async def process_websocket(self, websocket: WebSocket, user_id: str):
        """WebSocket 연결 처리"""
        await websocket.accept()

        try:
            # 등록 진행 상태
            registration_status = {direction: False for direction in self.directions}
            current_direction = "front"

            # 안정화 시간 추적
            stable_start_time = None

            await websocket.send_json({
                "type": "instruction",
                "direction": current_direction,
                "message": "얼굴을 원 안에 맞춰주세요"
            })

            while True:
                # 클라이언트로부터 이미지 수신
                message = await websocket.receive_json()

                if message["type"] == "frame":
                    # 이미지 디코딩
                    img_data = base64.b64decode(message["image"])
                    nparr = np.frombuffer(img_data, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                    # 얼굴 감지
                    faces = self.face_app.get(frame)

                    if not faces:
                        # 얼굴이 감지되지 않음
                        await websocket.send_json({
                            "type": "feedback",
                            "status": "error",
                            "message": "얼굴이 감지되지 않습니다"
                        })
                        stable_start_time = None
                        continue

                    # 가장 큰 얼굴 선택
                    face = max(faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]))

                    # 얼굴 위치 및 크기 검증
                    face_center_x = (face.bbox[0] + face.bbox[2]) / 2
                    face_center_y = (face.bbox[1] + face.bbox[3]) / 2
                    face_width = face.bbox[2] - face.bbox[0]

                    frame_center_x = frame.shape[1] / 2
                    frame_center_y = frame.shape[0] / 2

                    # 원 중심으로부터의 거리
                    distance_from_center = np.sqrt(
                        (face_center_x - frame_center_x) ** 2 +
                        (face_center_y - frame_center_y) ** 2
                    )

                    # 원 반지름의 약 40%이내에 위치하는지 확인
                    max_distance = min(frame.shape[0], frame.shape[1]) * 0.2

                    # 얼굴 크기가 적절한지 확인 (화면 너비의 30~70%)
                    min_face_width = frame.shape[1] * 0.3
                    max_face_width = frame.shape[1] * 0.7

                    is_position_valid = distance_from_center <= max_distance
                    is_size_valid = min_face_width <= face_width <= max_face_width

                    # 현재 방향에 따른 각도 계산
                    if current_direction == "front" and self.reference_landmarks is None:
                        # 정면 촬영일 때는 위치와 크기만 검증
                        is_angle_valid = True
                    else:
                        # 다른 방향일 때는 기준점 대비 각도 계산
                        yaw, pitch = self._calculate_head_pose(face.kps)
                        target_yaw, target_pitch = self.target_angles[current_direction]

                        # 목표 각도와의 차이 확인
                        yaw_diff = abs(yaw - target_yaw)
                        pitch_diff = abs(pitch - target_pitch)

                        is_angle_valid = (yaw_diff <= self.angle_threshold and
                                          pitch_diff <= self.angle_threshold)

                    # 모든 조건이 만족되는지 확인
                    is_valid = is_position_valid and is_size_valid and is_angle_valid

                    if is_valid:
                        # 안정화 시간 계산
                        if stable_start_time is None:
                            stable_start_time = time.time()

                        stable_duration = time.time() - stable_start_time

                        # 진행률 업데이트
                        progress = min(1.0, stable_duration / self.stable_time_required)

                        # 클라이언트에 피드백 전송
                        await websocket.send_json({
                            "type": "feedback",
                            "status": "stable",
                            "progress": progress,
                            "message": f"유지해주세요... ({int(progress * 100)}%)"
                        })

                        # 안정화 시간이 충족되면 촬영
                        if stable_duration >= self.stable_time_required:
                            # 얼굴 임베딩 추출
                            embedding = face.embedding

                            # 첫 번째 촬영(정면)일 경우 기준점 저장
                            if current_direction == "front":
                                self.reference_landmarks = face.kps

                            # 서버에 데이터 저장
                            registration_status[current_direction] = True

                            # 클라이언트에 성공 메시지 전송
                            await websocket.send_json({
                                "type": "capture_success",
                                "direction": current_direction,
                                "message": f"{current_direction} 방향 촬영 완료!"
                            })

                            # 다음 방향 설정
                            current_direction = self._get_next_direction(registration_status)
                            stable_start_time = None

                            if current_direction:
                                # 다음 방향 안내
                                await websocket.send_json({
                                    "type": "instruction",
                                    "direction": current_direction,
                                    "message": self._get_direction_message(current_direction)
                                })
                            else:
                                # 모든 방향 완료
                                await websocket.send_json({
                                    "type": "registration_complete",
                                    "message": "얼굴 등록이 완료되었습니다!"
                                })
                                break
                    else:
                        # 조건이 맞지 않으면 타이머 리셋
                        stable_start_time = None

                        # 피드백 메시지 생성
                        feedback_message = ""
                        if not is_position_valid:
                            feedback_message = "얼굴을 중앙에 위치시켜주세요"
                        elif not is_size_valid:
                            if face_width < min_face_width:
                                feedback_message = "얼굴을 더 가까이 해주세요"
                            else:
                                feedback_message = "얼굴을 더 멀리 해주세요"
                        elif not is_angle_valid:
                            feedback_message = f"{current_direction} 방향으로 더 돌려주세요"

                        # 클라이언트에 피드백 전송
                        await websocket.send_json({
                            "type": "feedback",
                            "status": "unstable",
                            "message": feedback_message
                        })

        except Exception as e:
            print(f"WebSocket 오류: {str(e)}")
        finally:
            # 연결 종료
            await websocket.close()

    def _calculate_head_pose(self, landmarks):
        """랜드마크를 기반으로 머리 포즈(각도) 추정"""
        if self.reference_landmarks is None:
            return 0, 0

        # 눈, 코, 입 위치 활용
        left_eye = landmarks[0]
        right_eye = landmarks[1]
        nose = landmarks[2]
        left_mouth = landmarks[3]
        right_mouth = landmarks[4]

        # 기준 랜드마크
        ref_left_eye = self.reference_landmarks[0]
        ref_right_eye = self.reference_landmarks[1]
        ref_nose = self.reference_landmarks[2]

        # 눈 사이 거리 계산 (X축 변화로 Yaw 추정)
        eye_distance = np.linalg.norm(right_eye - left_eye)
        ref_eye_distance = np.linalg.norm(ref_right_eye - ref_left_eye)

        # X축 변화로 Yaw(좌우) 각도 추정
        eye_center = (left_eye + right_eye) / 2
        ref_eye_center = (ref_left_eye + ref_right_eye) / 2

        x_shift = (eye_center[0] - ref_eye_center[0]) / ref_eye_distance
        yaw = x_shift * 90  # 스케일링

        # Y축 변화로 Pitch(상하) 각도 추정
        nose_to_eye_y = eye_center[1] - nose[1]
        ref_nose_to_eye_y = ref_eye_center[1] - ref_nose[1]

        y_shift = (nose_to_eye_y - ref_nose_to_eye_y) / ref_nose_to_eye_y
        pitch = y_shift * 90  # 스케일링

        return yaw, pitch

    def _get_next_direction(self, registration_status):
        """다음 등록할 방향 결정"""
        for direction in self.directions:
            if not registration_status[direction]:
                return direction
        return None

    def _get_direction_message(self, direction):
        """방향에 따른 안내 메시지"""
        messages = {
            "front": "얼굴을 원 안에 맞춰주세요",
            "left": "고개를 왼쪽으로 살짝 돌려주세요",
            "right": "고개를 오른쪽으로 살짝 돌려주세요",
            "up": "고개를 위로 살짝 들어주세요",
            "down": "고개를 아래로 살짝 숙여주세요"
        }
        return messages.get(direction, "얼굴을 원 안에 맞춰주세요")