import pyglet
import numpy as np
import cv2
import pyrealsense2 as rs
import insightface
from insightface.app import FaceAnalysis
import time
import os
import argparse
import pickle
from datetime import datetime
import threading
import queue
import traceback
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, BackgroundTasks
import uvicorn
import asyncio
from pydantic import BaseModel
from PIL import Image
from io import BytesIO
from urllib.request import urlopen

# API 응답 모델
class FaceRecognitionResponse(BaseModel):
    success: bool
    face_detected: bool
    is_live: Optional[bool] = None
    age: Optional[float] = None
    gender: Optional[str] = None
    confidence: Optional[float] = None
    message: str

def parse_args():
    parser = argparse.ArgumentParser(description='RealSense 얼굴 라이브니스 및 3D 임베딩')
    parser.add_argument('--save_dir', type=str, default='embeddings', 
                        help='임베딩을 저장할 디렉토리')
    parser.add_argument('--width', type=int, default=640, help='카메라 너비')
    parser.add_argument('--height', type=int, default=480, help='카메라 높이')
    parser.add_argument('--fps', type=int, default=30, help='카메라 FPS')
    parser.add_argument('--show_scores', action='store_true', help='라이브니스 점수 표시')
    parser.add_argument('--show_depth', action='store_true', help='깊이 맵 표시')
    parser.add_argument('--save_embeddings', action='store_true', help='3D 임베딩 저장')
    parser.add_argument('--fullscreen', action='store_true', default=False, help='전체화면 모드')
    parser.add_argument('--gpu_id', type=int, default=0, help='사용할 GPU ID')
    parser.add_argument('--rotation', type=int, default=180, choices=[0, 90, 180, 270], 
                        help='소스 영상 회전 각도 (시계 방향)')
    parser.add_argument('--mirror', action='store_true', help='좌우 반전 적용')
    parser.add_argument('--idle_image', type=str, default=None, 
                        help='대기 상태에서 표시할 이미지 파일 경로')
    parser.add_argument('--idle_gif', type=str, default=None, 
                        help='대기 상태에서 표시할 GIF 파일 경로')
    parser.add_argument('--guide_circle', action='store_true', default=True,
                        help='얼굴 인식 가이드 원 표시')
    parser.add_argument('--age_gender', action='store_true', default=True,
                        help='나이 및 성별 추정 사용')
    parser.add_argument('--screen', type=int, default=0, 
                        help='표시할 화면 번호 (0부터 시작)')
    parser.add_argument('--target_width', type=int, default=600, 
                        help='대상 화면 너비')
    parser.add_argument('--target_height', type=int, default=1024, 
                        help='대상 화면 높이')
    parser.add_argument('--min_depth', type=float, default=0.4, 
                        help='감지할 최소 깊이 (미터)')
    parser.add_argument('--api_port', type=int, default=8000, 
                        help='FastAPI 서버 포트')
    parser.add_argument('--no_ui_text', action='store_true', default=True,
                        help='UI 텍스트 숨기기')
    parser.add_argument('--recognition_time', type=float, default=1.0, 
                        help='얼굴 인식 시간 (초)')
    parser.add_argument('--max_fps', type=int, default=15,
                        help='얼굴 인식 최대 처리 FPS (성능 최적화)')
    return parser.parse_args()

class AnimatedGIF:
    def __init__(self, filename):
        self.frames = []
        self.durations = []
        self.current_frame = 0
        self.total_duration = 0
        self.elapsed = 0
        
        try:
            if filename.startswith('http'):
                # URL에서 이미지 로드
                response = urlopen(filename)
                gif = Image.open(BytesIO(response.read()))
            else:
                # 로컬 파일에서 이미지 로드
                gif = Image.open(filename)
                
            # GIF의 모든 프레임 추출
            try:
                while True:
                    # 프레임 정보 추출
                    duration = gif.info.get('duration', 100) / 1000  # 초 단위로 변환
                    self.durations.append(duration)
                    self.total_duration += duration
                    
                    # 프레임을 RGBA로 변환
                    frame = gif.convert('RGBA')
                    frame_data = np.array(frame)
                    
                    # RGB 순서로 변환 (OpenCV BGR에서)
                    frame_data = cv2.cvtColor(frame_data, cv2.COLOR_RGBA2RGB)
                    
                    # Pyglet 텍스처로 변환
                    texture = pyglet.image.ImageData(
                        frame.width, frame.height, 'RGB', 
                        frame_data.tobytes(), pitch=frame_data.shape[1] * 3
                    ).get_texture()
                    
                    self.frames.append(texture)
                    gif.seek(gif.tell() + 1)
            except EOFError:
                pass  # GIF의 끝에 도달
        except Exception as e:
            print(f"GIF 로드 오류: {e}")
            traceback.print_exc()
    
    def get_current_frame(self, dt):
        # 경과 시간 업데이트
        self.elapsed += dt
        if self.elapsed >= self.total_duration:
            self.elapsed = 0
        
        # 현재 표시할 프레임 계산
        elapsed = self.elapsed
        for i, duration in enumerate(self.durations):
            if elapsed < duration:
                return self.frames[i]
            elapsed -= duration
        
        return self.frames[0]  # 기본값 반환

class TextureGenerator:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        
    def create_texture_from_numpy(self, img):
        """종횡비를 유지하며 텍스처 생성"""
        # OpenCV는 BGR 순서, pyglet은 RGB 순서
        if img.shape[2] == 3:  # 컬러 이미지
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
        # 텍스처 생성 (RGB 형식)
        try:
            texture = pyglet.image.ImageData(
                img.shape[1], img.shape[0],
                'RGB', img.tobytes(), pitch=img.shape[1] * 3
            ).get_texture()
            
            return texture
        except Exception as e:
            print(f"텍스처 생성 오류: {e}")
            traceback.print_exc()
            return None

def rotate_image(image, angle, mirror=False):
    """이미지를 지정된 각도로 회전합니다 (종횡비 유지)"""
    # 좌우 반전 적용 (필요시)
    if mirror:
        image = cv2.flip(image, 1)  # 1은 좌우 반전, 0은 상하 반전, -1은 상하좌우 반전
        
    if angle == 0:
        return image
    
    # 이미지 크기
    h, w = image.shape[:2]
    
    # 90도/270도 회전 시 너비와 높이 교환
    if angle in [90, 270]:
        target_h, target_w = w, h
    else:
        target_h, target_w = h, w
    
    # 회전 행렬
    if angle == 90:
        # 90도 회전 (시계 방향)
        M = cv2.getRotationMatrix2D((w/2, h/2), -90, 1)
        # 위치 조정
        M[0, 2] += (target_w - w) / 2
        M[1, 2] += (target_h - h) / 2
        return cv2.warpAffine(image, M, (target_w, target_h))
    elif angle == 180:
        # 180도 회전
        return cv2.flip(image, -1)
    elif angle == 270:
        # 270도 회전 (시계 방향)
        M = cv2.getRotationMatrix2D((w/2, h/2), -270, 1)
        # 위치 조정
        M[0, 2] += (target_w - w) / 2
        M[1, 2] += (target_h - h) / 2
        return cv2.warpAffine(image, M, (target_w, target_h))
    else:
        # 일반적인 회전
        M = cv2.getRotationMatrix2D((w/2, h/2), -angle, 1)
        return cv2.warpAffine(image, M, (w, h))

def draw_guide_circle(image, center=None, radius=None, bg_color=(18, 18, 18)):
    """얼굴 인식을 위한 가이드 원을 그립니다"""
    h, w = image.shape[:2]
    
    # 기본값: 이미지 중앙에 반지름은 너비의 1/4
    if center is None:
        center = (w // 2, h // 2)
    if radius is None:
        radius = min(w, h) // 4
    
    # 원본 이미지 복사
    result = image.copy()
    
    # 마스크 생성 (전체 검정)
    mask = np.zeros((h, w), dtype=np.uint8)
    
    # 가이드 원 그리기
    cv2.circle(mask, center, radius, 255, -1)
    
    # 원 바깥 영역을 완전히 어둡게 만들기 (투명도 0)
    alpha = 0.0  # 투명도 (0: 완전 불투명, 1: 원본 유지)
    
    # 마스크를 사용하여 원 바깥 영역을 어둡게 처리
    result_with_mask = result.copy()
    # 원 바깥 영역을 배경색으로 설정 (완전 불투명)
    result_with_mask[mask == 0] = bg_color
    
    # 가이드 원 테두리 그리기
    cv2.circle(result_with_mask, center, radius, (0, 255, 0), 2)
    
    return result_with_mask

def crop_to_target_ratio(image, target_ratio, rotation):
    """이미지를 대상 종횡비에 맞게 자르기"""
    h, w = image.shape[:2]
    current_ratio = w / h
    
    # 회전 상태가 0도/180도 또는 90도/270도인지 확인
    is_landscape = rotation in [0, 180]
    
    if is_landscape:
        # 가로 화면 - 가운데 부분만 잘라내기
        if current_ratio > target_ratio:
            # 너비가 너무 넓은 경우
            new_w = int(h * target_ratio)
            start_x = (w - new_w) // 2
            image = image[:, start_x:start_x+new_w]
        elif current_ratio < target_ratio:
            # 높이가 너무 높은 경우
            new_h = int(w / target_ratio)
            start_y = (h - new_h) // 2
            image = image[start_y:start_y+new_h, :]
    else:
        # 세로 화면 - 자동 크기 조정 (실제 렌더링에서 처리됨)
        pass
    
    return image

class RealSenseFaceLiveness:
    def __init__(self, args):
        self.args = args
        self.width = args.width
        self.height = args.height
        self.fps = args.fps
        self.save_dir = args.save_dir
        self.show_scores = args.show_scores
        self.show_depth = args.show_depth
        self.save_embeddings = args.save_embeddings
        self.gpu_id = args.gpu_id
        self.rotation = args.rotation
        self.mirror = args.mirror  # 좌우 반전 여부
        self.guide_circle = args.guide_circle
        self.age_gender = args.age_gender
        self.idle_image_path = args.idle_image
        self.idle_gif_path = args.idle_gif
        self.target_width = args.target_width
        self.target_height = args.target_height
        self.min_depth = args.min_depth  # 감지할 최소 깊이 (미터)
        self.no_ui_text = args.no_ui_text
        self.recognition_time = args.recognition_time
        self.max_fps = args.max_fps  # 최대 처리 FPS
        self.last_frame_time = 0  # 마지막 프레임 처리 시간
        
        # 모드 설정 (카메라 모드 또는 유휴 모드)
        self.camera_mode = False  # 기본값은 유휴 모드
        
        # API 요청 처리 중 플래그
        self.processing_api_request = False
        
        # API 요청 결과 저장
        self.api_result = None
        self.api_result_event = threading.Event()
        
        # 인식 프레임 수집
        self.collected_frames = []
        self.collection_start_time = 0
        
        # 유휴 이미지/GIF 로드
        self.idle_image_texture = None
        self.idle_gif = None
        
        if self.idle_gif_path:
            try:
                self.idle_gif = AnimatedGIF(self.idle_gif_path)
                print(f"GIF 로드 완료: {self.idle_gif_path}")
            except Exception as e:
                print(f"GIF 로드 실패: {e}")
        
        if self.idle_image_path and not self.idle_gif:
            try:
                if self.idle_image_path.startswith('http'):
                    # URL에서 이미지 로드
                    response = urlopen(self.idle_image_path)
                    img = Image.open(BytesIO(response.read()))
                    img_array = np.array(img.convert('RGB'))
                else:
                    # 로컬 파일에서 이미지 로드
                    img_array = cv2.imread(self.idle_image_path)
                
                if img_array is not None:
                    texture_generator = TextureGenerator(self.width, self.height)
                    self.idle_image_texture = texture_generator.create_texture_from_numpy(img_array)
                    print(f"이미지 로드 완료: {self.idle_image_path}")
                else:
                    print(f"이미지 로드 실패: {self.idle_image_path}")
            except Exception as e:
                print(f"이미지 로드 오류: {e}")
                traceback.print_exc()
        
        # 저장 디렉토리가 없으면 생성
        if self.save_embeddings and not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)
        
        # 소스 회전 각도에 따라 너비와 높이를 교환
        if self.rotation in [90, 270]:
            self.display_width = self.height
            self.display_height = self.width
        else:
            self.display_width = self.width
            self.display_height = self.height
            
        try:
            # Pyglet 기본 디스플레이와 스크린 가져오기
            display = pyglet.display.get_display()
            screens = display.get_screens()
            
            print(f"감지된 디스플레이 수: {len(screens)}")
            for i, screen in enumerate(screens):
                print(f"스크린 #{i}: {screen.width}x{screen.height} @ ({screen.x}, {screen.y})")
            
            # 화면 인덱스 체크
            if args.screen >= len(screens):
                print(f"경고: 화면 인덱스 {args.screen}가 유효하지 않습니다. 기본 화면을 사용합니다.")
                self.screen_index = 0
            else:
                self.screen_index = args.screen
                
            # 타겟 화면 선택
            target_screen = screens[self.screen_index]
            print(f"화면 #{self.screen_index}에 창을 표시합니다: {target_screen.width}x{target_screen.height}")
            
            # 창 생성
            self.window = pyglet.window.Window(
                width=self.target_width,
                height=self.target_height,
                caption="RealSense 얼굴 인식 결제",
                resizable=True,
            )
            
            # 창 위치 계산 (화면 중앙)
            window_x = target_screen.x + (target_screen.width - self.target_width) // 2
            window_y = target_screen.y + (target_screen.height - self.target_height) // 2
            self.window.set_location(window_x, window_y)
            
            
            # 전체화면 설정 (요청 시)
            if args.fullscreen:
                self.window.set_fullscreen(True, screen=target_screen)
            
            print(f"창 생성 완료: {self.window.width}x{self.window.height} @ {self.window.get_location()}")
        except Exception as e:
            print(f"창 생성 오류: {e}")
            traceback.print_exc()
            # 기본 창으로 대체
            self.window = pyglet.window.Window(
                width=self.target_width, 
                height=self.target_height,
                caption="RealSense 얼굴 인식 결제 (기본)"
            )
            
        # 텍스처 생성기
        self.texture_generator = TextureGenerator(self.width, self.height)
        
        # 키 핸들러 설정
        self.key_handler = pyglet.window.key.KeyStateHandler()
        self.window.push_handlers(self.key_handler)
        self.window.push_handlers(on_key_press=self.on_key_press)
        
        # 텍스트 레이블 초기화 (UI 텍스트 숨김 옵션에 따라)
        if not self.no_ui_text:
            self.labels = []
            self.fps_label = pyglet.text.Label(
                'FPS: 0',
                font_name='Arial',
                font_size=14,
                x=10, y=self.window.height - 20,
                color=(0, 255, 0, 255)
            )
            self.status_label = pyglet.text.Label(
                'Status: 처리 중...',
                font_name='Arial',
                font_size=14,
                x=10, y=10,
                color=(255, 255, 255, 255)
            )
            self.mode_label = pyglet.text.Label(
                '모드: 대기',
                font_name='Arial',
                font_size=14,
                x=10, y=self.window.height - 40,
                color=(255, 255, 0, 255)
            )
        else:
            self.labels = []
            self.fps_label = None
            self.status_label = None
            self.mode_label = None
        
        # Sprite 생성
        self.color_sprite = None
        self.depth_sprite = None
        self.idle_sprite = None
        self.mask_sprite = None  # 가림막 스프라이트
        
        # 가림막 생성 (검은색 배경)
        self.create_mask_sprite()
        
        # RealSense 파이프라인 초기화
        self.pipeline = rs.pipeline()
        self.config = rs.config()
        
        # 스트림 설정
        self.config.enable_stream(rs.stream.depth, self.width, self.height, rs.format.z16, self.fps)
        self.config.enable_stream(rs.stream.color, self.width, self.height, rs.format.bgr8, self.fps)
        
        # 스트리밍 시작
        self.profile = self.pipeline.start(self.config)
        
        # 깊이 측정을 위한 깊이 스케일 가져오기
        self.depth_sensor = self.profile.get_device().first_depth_sensor()
        self.depth_scale = self.depth_sensor.get_depth_scale()
        
        # 깊이 프레임을 컬러 프레임에 정렬하기 위한 객체 생성
        self.align = rs.align(rs.stream.color)
        
        # Insightface 초기화 (별도 스레드에서)
        self.face_app = None
        self.initialization_done = False
        self.initialization_thread = threading.Thread(target=self.initialize_face_app)
        self.initialization_thread.daemon = True
        self.initialization_thread.start()
        
        # 프레임 및 처리 결과를 위한 큐
        self.frame_queue = queue.Queue(maxsize=5)
        self.result_queue = queue.Queue()
        
        # 처리 스레드 생성
        self.processing_thread = threading.Thread(target=self.process_frames)
        self.processing_thread.daemon = True
        self.processing_thread.start()
        
        # 현재 텍스처
        self.color_texture = None
        self.depth_texture = None
        
        # 라이브니스 결과
        self.faces_results = []
        
        # FPS 계산 변수
        self.prev_frame_time = 0
        self.curr_frame_time = 0
        self.fps_value = 0
        self.processing_fps = 0
        
        # UI 숨김 변수
        self.show_ui = not self.no_ui_text
        
        # 이벤트 설정
        pyglet.clock.schedule_interval(self.update, 1/60.0)
        
        self.start_frame_capture_thread()

        # API 요청 후 카메라 모드 자동 종료 타이머
        self.camera_timeout = None
        
        # 타겟 비율 계산
        self.target_ratio = self.target_width / self.target_height
        
        # 윈도우 이벤트 핸들러 설정
        @self.window.event
        def on_draw():
            try:
                self.window.clear()
                
                # 항상 가림막 먼저 그리기
                if self.mask_sprite:
                    self.mask_sprite.draw()
                
                if self.camera_mode:
                    # 카메라 모드: 얼굴 인식 화면 표시
                    # 컬러 이미지 스프라이트 그리기
                    if self.color_sprite:
                        self.color_sprite.draw()
                    
                    # 깊이 이미지 스프라이트 그리기
                    if self.show_depth and self.depth_sprite:
                        self.depth_sprite.draw()
                    
                    # UI 텍스트가 활성화된 경우에만 레이블 렌더링
                    if self.show_ui:
                        for label in self.labels:
                            label.draw()
                else:
                    # 유휴 모드: 대기 화면 표시
                    if self.idle_gif:
                        # GIF 애니메이션 표시
                        current_frame = self.idle_gif.get_current_frame(1/60.0)
                        if current_frame:
                            self.idle_sprite = pyglet.sprite.Sprite(current_frame, x=0, y=0)
                            # 창 크기에 맞게 스케일 조정
                            scale_x = self.window.width / current_frame.width
                            scale_y = self.window.height / current_frame.height
                            scale = min(scale_x, scale_y)
                            self.idle_sprite.scale = scale
                            # 중앙 정렬
                            self.idle_sprite.x = (self.window.width - self.idle_sprite.width) / 2
                            self.idle_sprite.y = (self.window.height - self.idle_sprite.height) / 2
                            self.idle_sprite.draw()
                    elif self.idle_image_texture:
                        # 정적 이미지 표시
                        if not self.idle_sprite and self.idle_image_texture:
                            self.idle_sprite = pyglet.sprite.Sprite(self.idle_image_texture, x=0, y=0)
                            # 창 크기에 맞게 스케일 조정
                            scale_x = self.window.width / self.idle_image_texture.width
                            scale_y = self.window.height / self.idle_image_texture.height
                            scale = min(scale_x, scale_y)
                            self.idle_sprite.scale = scale
                            # 중앙 정렬
                            self.idle_sprite.x = (self.window.width - self.idle_sprite.width) / 2
                            self.idle_sprite.y = (self.window.height - self.idle_sprite.height) / 2
                        if self.idle_sprite:
                            self.idle_sprite.draw()
                    elif self.show_ui:
                        # UI 텍스트가 활성화된 경우에만 텍스트 표시
                        label = pyglet.text.Label(
                            '대기 중...',
                            font_name='Arial',
                            font_size=18,
                            x=self.window.width // 2,
                            y=self.window.height // 2,
                            anchor_x='center', 
                            anchor_y='center',
                            color=(255, 255, 255, 255)
                        )
                        label.draw()
                
                # UI 텍스트가 활성화된 경우에만 FPS 및 상태 표시
                if self.show_ui:
                    if self.fps_label:
                        self.fps_label.text = f'FPS: {self.fps_value:.1f} | 처리 FPS: {self.processing_fps:.1f}'
                        self.fps_label.draw()
                    
                    if self.status_label:
                        status_text = "준비됨" if self.initialization_done else "모델 로딩 중..."
                        mirror_status = "켜짐" if self.mirror else "꺼짐"
                        self.status_label.text = f'상태: {status_text} | 점수 표시: {"켜짐" if self.show_scores else "꺼짐"} | 깊이: {"켜짐" if self.show_depth else "꺼짐"} | 좌우반전: {mirror_status} | 가이드: {"켜짐" if self.guide_circle else "꺼짐"}'
                        self.status_label.draw()
                    
                    if self.mode_label:
                        self.mode_label.text = f'모드: {"카메라" if self.camera_mode else "대기"}'
                        self.mode_label.draw()
            except Exception as e:
                print(f"화면 그리기 오류 (무시됨): {e}")
    
    def create_mask_sprite(self):
        """가림막 스프라이트 생성/갱신 - 검은색 배경"""
        try:
            # 안전하게 크기 확인
            width = max(2, self.window.width)   # 최소 2 픽셀
            height = max(2, self.window.height) # 최소 2 픽셀
            
            # 가림막 생성 (검은색 배경)
            mask_image = np.ones((height, width, 3), dtype=np.uint8) * 18  # 다크 모드 배경색
            self.mask_texture = self.texture_generator.create_texture_from_numpy(mask_image)
            if self.mask_texture:
                self.mask_sprite = pyglet.sprite.Sprite(self.mask_texture, x=0, y=0)
        except Exception as e:
            print(f"마스크 생성 오류 (무시됨): {e}")
            self.mask_sprite = None
    
    def initialize_face_app(self):
        """별도 스레드에서 Insightface 모델 초기화"""
        try:
            print("Insightface 모델 로딩 중...")
            self.face_app = FaceAnalysis(
                name='buffalo_l',  # Buffalo-L 모델 사용 (성별, 나이 추정 지원)
                providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
            )
            self.face_app.prepare(ctx_id=self.gpu_id, det_size=(self.width, self.height))
            self.initialization_done = True
            print("Insightface 모델 로딩 완료!")
        except Exception as e:
            print(f"Insightface 초기화 오류: {e}")
            traceback.print_exc()
    
    def on_key_press(self, symbol, modifiers):
        """키 입력 처리"""
        if symbol == pyglet.window.key.Q:
            pyglet.app.exit()
        elif symbol == pyglet.window.key.C:
            # 카메라/유휴 모드 전환
            self.set_camera_mode(not self.camera_mode)
        elif symbol == pyglet.window.key.S:
            self.show_scores = not self.show_scores
        elif symbol == pyglet.window.key.D:
            self.show_depth = not self.show_depth
        elif symbol == pyglet.window.key.G:
            # 가이드 원 토글
            self.guide_circle = not self.guide_circle
            print(f"가이드 원 {'활성화' if self.guide_circle else '비활성화'}")
        elif symbol == pyglet.window.key.E:
            self.save_embeddings = not self.save_embeddings
            print(f"임베딩 저장 {'활성화' if self.save_embeddings else '비활성화'}")
        elif symbol == pyglet.window.key.A:
            # 나이/성별 추정 토글
            self.age_gender = not self.age_gender
            print(f"나이/성별 추정 {'활성화' if self.age_gender else '비활성화'}")
        elif symbol == pyglet.window.key.F:
            # 전체화면 전환
            display = pyglet.display.get_display()
            screens = display.get_screens()
            target_screen = screens[self.screen_index] if self.screen_index < len(screens) else screens[0]
            
            self.window.set_fullscreen(not self.window.fullscreen, screen=target_screen)
            print(f"전체화면 모드: {'켜짐' if self.window.fullscreen else '꺼짐'}")
        elif symbol == pyglet.window.key.T:
            # UI 텍스트 토글
            self.show_ui = not self.show_ui
            print(f"UI 텍스트 {'표시' if self.show_ui else '숨김'}")
        elif symbol == pyglet.window.key.R:
            # 회전 각도 변경
            old_rotation = self.rotation
            self.rotation = (self.rotation + 90) % 360
            print(f"소스 회전 각도: {self.rotation}도")
        elif symbol == pyglet.window.key.M:
            # 좌우 반전 토글
            self.mirror = not self.mirror
            print(f"좌우 반전 {'활성화' if self.mirror else '비활성화'}")
        elif pyglet.window.key._1 <= symbol <= pyglet.window.key._9:
            display = pyglet.display.get_display()
            screens = display.get_screens()
            index = symbol - pyglet.window.key._1  # 0부터 시작
            if index < len(screens):
                self.screen_index = index
                target_screen = screens[self.screen_index]
                # 전체화면 여부 기억
                was_fullscreen = self.window.fullscreen
                if was_fullscreen:
                    self.window.set_fullscreen(False)
                # 창 위치 재설정
                window_x = target_screen.x + (target_screen.width - self.window.width) // 2
                window_y = target_screen.y + (target_screen.height - self.window.height) // 2
                self.window.set_location(window_x, window_y)
                if was_fullscreen:
                    self.window.set_fullscreen(True, screen=target_screen)
                print(f"스크린 #{self.screen_index}로 이동: {target_screen.width}x{target_screen.height} @ ({window_x}, {window_y})")

    
    def set_camera_mode(self, enabled, timeout=None):
        """카메라 모드 설정 (타임아웃 옵션 포함)"""
        # 모드 변경 시 이미지 처리 큐를 즉시 비워 딜레이 방지
        if self.camera_mode != enabled:
            try:
                # 큐 비우기
                while not self.frame_queue.empty():
                    self.frame_queue.get_nowait()
                while not self.result_queue.empty():
                    self.result_queue.get_nowait()
            except:
                pass
        
        self.camera_mode = enabled
        print(f"카메라 모드: {'활성화' if enabled else '비활성화'}")
        
        # 타임아웃 설정
        if enabled and timeout is not None:
            if self.camera_timeout:
                pyglet.clock.unschedule(self.camera_timeout)
            self.camera_timeout = pyglet.clock.schedule_once(
                lambda dt: self.set_camera_mode(False), timeout
            )
            print(f"{timeout}초 후 카메라 모드 자동 종료 예약됨")
        elif not enabled and self.camera_timeout:
            pyglet.clock.unschedule(self.camera_timeout)
            self.camera_timeout = None
    
    def start_frame_collection(self):
        """얼굴 인식 데이터 수집 시작"""
        self.collected_frames = []
        self.collection_start_time = time.time()
        self.processing_api_request = True
        self.api_result = None
        self.api_result_event.clear()
        print(f"얼굴 인식 데이터 수집 시작 ({self.recognition_time}초 동안)")
    
    # 멀티스레드 구조로 개선된 update 함수 (렌더링 전용으로 분리)
    def update(self, dt):
        try:
            if not self.camera_mode:
                return

            # 최신 결과만 가져오기
            latest_result = None
            while not self.result_queue.empty():
                latest_result = self.result_queue.get_nowait()

            if latest_result:
                display_image, self.faces_results, self.processing_fps = latest_result
                tex = self.texture_generator.create_texture_from_numpy(display_image)
                if tex:
                    if not self.color_sprite:
                        self.color_sprite = pyglet.sprite.Sprite(tex, x=0, y=0)
                    else:
                        self.color_sprite.image = tex
                    scale_x = self.window.width / tex.width
                    scale_y = self.window.height / tex.height
                    scale = min(scale_x, scale_y)
                    self.color_sprite.scale = scale
                    self.color_sprite.x = (self.window.width - self.color_sprite.width) / 2
                    self.color_sprite.y = (self.window.height - self.color_sprite.height) / 2
                self.update_labels()

            # 깊이 이미지도 결과에 포함시키고 싶다면 별도 result_queue에 추가하거나 프레임 저장 시 처리

        except Exception as e:
            print(f"[update] 오류: {e}")
            traceback.print_exc()


    # 새로운 카메라 캡처 전용 쓰레드 함수
    def start_frame_capture_thread(self):
        def capture_loop():
            while True:
                try:
                    if not self.camera_mode:
                        time.sleep(0.1)
                        continue

                    frames = self.pipeline.wait_for_frames()
                    aligned_frames = self.align.process(frames)
                    depth_frame = aligned_frames.get_depth_frame()
                    color_frame = aligned_frames.get_color_frame()
                    if not depth_frame or not color_frame:
                        continue

                    depth_image = np.asanyarray(depth_frame.get_data())
                    color_image = np.asanyarray(color_frame.get_data())

                    if self.rotation != 0 or self.mirror:
                        color_image = rotate_image(color_image, self.rotation, self.mirror)
                        depth_image = rotate_image(depth_image, self.rotation, self.mirror)

                    if self.guide_circle:
                        center = (color_image.shape[1] // 2, color_image.shape[0] // 2)
                        radius = min(color_image.shape[1], color_image.shape[0]) // 4
                        color_image = draw_guide_circle(color_image, center, radius)

                    color_image = crop_to_target_ratio(color_image, self.target_ratio, self.rotation)

                    if self.initialization_done:
                        original_color = np.asanyarray(color_frame.get_data())
                        original_depth = np.asanyarray(depth_frame.get_data())
                        if self.mirror:
                            original_color = cv2.flip(original_color, 1)
                            original_depth = cv2.flip(original_depth, 1)
                        while not self.frame_queue.empty():
                            self.frame_queue.get_nowait()
                        self.frame_queue.put_nowait((original_color, original_depth, color_image.copy(), depth_image.copy()))

                except Exception as e:
                    print(f"[capture_loop] 오류: {e}")
                    traceback.print_exc()
                    time.sleep(0.1)

        self.capture_thread = threading.Thread(target=capture_loop, daemon=True)
        self.capture_thread.start()


    def create_api_result(self):
        """수집된 프레임에서 API 결과 생성"""
        print(f"프레임 수집 완료: {len(self.collected_frames)}개 프레임")
        
        if not self.collected_frames:
            # 얼굴 감지 실패
            self.api_result = {
                "success": True,
                "face_detected": False,
                "message": "얼굴이 감지되지 않았습니다."
            }
            self.api_result_event.set()
            return
        
        # 모든 프레임의 얼굴 결과 분석
        all_face_results = []
        
        for frame_results in self.collected_frames:
            for face_result in frame_results:
                # 깊이 기반 필터링 - 깊이 정보 없는 경우 제외
                if face_result[1] is not None:  # 라이브니스 결과가 있는 경우만
                    all_face_results.append(face_result)
        
        if not all_face_results:
            # 유효한 얼굴 감지 실패
            self.api_result = {
                "success": True,
                "face_detected": False,
                "message": "유효한 얼굴이 감지되지 않았습니다."
            }
            self.api_result_event.set()
            return
        
        # 라이브니스 결과 집계
        live_count = sum(1 for result in all_face_results if result[1])
        live_ratio = live_count / len(all_face_results)
        
        # 나이 및 성별 집계
        ages = [result[3] for result in all_face_results if result[3] is not None]
        genders = [result[4] for result in all_face_results if result[4] is not None]
        
        avg_age = sum(ages) / len(ages) if ages else None
        
        # 성별 결정 (다수결)
        gender = None
        if genders:
            male_count = sum(1 for g in genders if g == 1)
            female_count = len(genders) - male_count
            gender = "남성" if male_count > female_count else "여성"
        
        # 최종 결과 생성
        self.api_result = {
            "success": True,
            "face_detected": True,
            "is_live": live_ratio > 0.5,  # 50% 이상이 실제 얼굴이면 실제로 판단
            "age": avg_age,
            "gender": gender,
            "confidence": live_ratio,
            "message": f"얼굴 인식 성공 (신뢰도: {live_ratio:.2f})"
        }
        
        print(f"API 결과: {self.api_result}")
        self.api_result_event.set()
    
    def update_labels(self):
        """얼굴 레이블 업데이트"""
        self.labels = []
        
        if not self.show_ui:
            return
        
        # 스프라이트 오프셋 계산
        offset_x = (self.window.width - self.color_sprite.width) / 2 if self.color_sprite else 0
        offset_y = (self.window.height - self.color_sprite.height) / 2 if self.color_sprite else 0
        
        for i, (face_bbox, is_live, liveness_scores, age, gender) in enumerate(self.faces_results):
            x1, y1, x2, y2 = [int(val) for val in face_bbox]
            
            # 스프라이트 크기를 고려하여 좌표 조정
            if self.color_sprite:
                scale = self.color_sprite.scale
                x1 = int(x1 * scale + offset_x)
                y1 = int(y1 * scale + offset_y)
                x2 = int(x2 * scale + offset_x)
                y2 = int(y2 * scale + offset_y)
            
            # 라이브니스 상태 레이블
            liveness_text = "실제" if is_live else "가짜"
            self.labels.append(pyglet.text.Label(
                liveness_text,
                font_name='Arial',
                font_size=12,
                x=x1, y=y1 - 10,
                color=(0, 255, 0, 255) if is_live else (255, 0, 0, 255)
            ))
            
            # 나이 및 성별 표시
            if self.age_gender:
                gender_str = "남성" if gender == 1 else "여성"
                age_gender_text = f"나이: {age:.0f}세, 성별: {gender_str}"
                self.labels.append(pyglet.text.Label(
                    age_gender_text,
                    font_name='Arial',
                    font_size=12,
                    x=x1, y=y2 + 10,
                    color=(255, 255, 0, 255)
                ))
            
            # 활성화된 경우 라이브니스 점수 표시
            if self.show_scores:
                y_offset = y2 + (30 if self.age_gender else 20)
                for key, value in liveness_scores.items():
                    if isinstance(value, bool):
                        text = f"{key}: {'✓' if value else '✗'}"
                    elif isinstance(value, float):
                        text = f"{key}: {value:.2f}"
                    else:
                        text = f"{key}: {value}"
                    
                    self.labels.append(pyglet.text.Label(
                        text,
                        font_name='Arial',
                        font_size=10,
                        x=x1, y=y_offset,
                        color=(255, 255, 255, 255)
                    ))
                    y_offset += 20
    
    def process_frames(self):
        process_time = 0
        frame_count = 0
        start_time = time.time()

        while True:
            try:
                if not self.initialization_done:
                    time.sleep(0.1)
                    continue

                if not self.camera_mode and not self.processing_api_request:
                    try:
                        while True:
                            self.frame_queue.get_nowait()
                    except queue.Empty:
                        pass
                    time.sleep(0.1)
                    continue

                try:
                    original_color, original_depth, rotated_color, rotated_depth = self.frame_queue.get(timeout=0.1)
                except queue.Empty:
                    continue

                process_start = time.time()
                faces = self.face_app.get(original_color)
                display_image = rotated_color.copy()
                faces_results = []
                valid_faces = []

                for face in faces:
                    bbox = face.bbox
                    landmarks = face.kps
                    avg_depth, is_valid_depth = self.get_face_depth(original_depth, bbox, landmarks)
                    if is_valid_depth and avg_depth >= self.min_depth:
                        valid_faces.append((face, avg_depth))

                if valid_faces:
                    valid_faces.sort(key=lambda x: x[1])
                    closest_face, closest_depth = valid_faces[0]
                    bbox = closest_face.bbox
                    landmarks = closest_face.kps
                    embedding = closest_face.embedding
                    is_live, liveness_scores = self.check_liveness(original_depth, bbox, landmarks)
                    embedding_3d = self.get_3d_face_embedding(embedding, original_depth, bbox, landmarks)
                    age = closest_face.age if hasattr(closest_face, 'age') else 0
                    gender = closest_face.gender if hasattr(closest_face, 'gender') else 0

                    if self.save_embeddings and is_live:
                        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                        filename = self.save_embedding(embedding_3d, is_live, age, gender, timestamp_str)
                        print(f"임베딩을 {filename}에 저장했습니다")

                    if self.rotation != 0:
                        rotated_bbox, rotated_landmarks = self.rotate_detection_results(
                            bbox, landmarks, original_color.shape, rotated_color.shape
                        )
                    else:
                        rotated_bbox, rotated_landmarks = bbox, landmarks

                    faces_results.append((rotated_bbox, is_live, liveness_scores, age, gender))

                    gender_str = "남성" if gender == 1 else "여성"
                    print(f"얼굴 감지: 라이브니스: {'실제' if is_live else '가짜'}, 깊이: {closest_depth:.2f}m, 나이: {age:.1f}세, 성별: {gender_str}")

                process_time += time.time() - process_start
                frame_count += 1

                if frame_count >= 10:
                    processing_fps = frame_count / process_time
                    process_time = 0
                    frame_count = 0
                else:
                    processing_fps = frame_count / (time.time() - start_time)

                # 타임스탬프 없이 단순히 결과만 전달
                self.result_queue.put((display_image, faces_results, processing_fps))

            except Exception as e:
                print(f"[process_frames] 오류: {e}")
                traceback.print_exc()
                time.sleep(0.1)



    def get_face_depth(self, depth_frame, face_bbox, landmarks):
        """얼굴의 평균 깊이 계산"""
        x1, y1, x2, y2 = [int(val) for val in face_bbox]
        
        # 경계 상자가 프레임 경계 내에 있는지 확인
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(depth_frame.shape[1] - 1, x2)
        y2 = min(depth_frame.shape[0] - 1, y2)
        
        if x1 >= x2 or y1 >= y2:
            return 0, False
        
        # 얼굴에 해당하는 깊이 영역 추출
        face_depth = depth_frame[y1:y2, x1:x2].copy().astype(float)
        
        # 깊이 값을 미터로 변환
        face_depth = face_depth * self.depth_scale
        
        # 제로(깊이 데이터 없음)를 NaN으로 대체하여 더 나은 처리
        face_depth[face_depth == 0] = np.nan
        
        # 유효한 깊이 데이터가 충분하지 않으면 False 반환
        valid_depth_percentage = np.sum(~np.isnan(face_depth)) / face_depth.size
        if valid_depth_percentage < 0.5:  # 얼굴의 최소 50%에 유효한 깊이가 있어야 함
            return 0, False
        
        # 평균 깊이 계산
        avg_depth = np.nanmean(face_depth)
        
        return avg_depth, True
    
    def rotate_detection_results(self, bbox, landmarks, src_shape, dst_shape):
        """
        회전된 좌표계로 변환
        src_shape: 원본 이미지 크기 (회전되지 않은)
        dst_shape: 대상 이미지 크기 (회전된)
        """
        src_h, src_w = src_shape[:2]
        dst_h, dst_w = dst_shape[:2]
        
        # 박스 좌표
        x1, y1, x2, y2 = bbox
        
        # 회전에 따른 좌표 변환
        if self.rotation == 0:
            # 회전 없음
            rotated_bbox = bbox
            rotated_landmarks = landmarks
        elif self.rotation == 90:
            # 90도 회전 (시계 방향)
            rotated_bbox = [src_h - y2, x1, src_h - y1, x2]
            rotated_landmarks = np.array([[src_h - landmark[1], landmark[0]] for landmark in landmarks])
        elif self.rotation == 180:
            # 180도 회전
            rotated_bbox = [src_w - x2, src_h - y2, src_w - x1, src_h - y1]
            rotated_landmarks = np.array([[src_w - landmark[0], src_h - landmark[1]] for landmark in landmarks])
        elif self.rotation == 270:
            # 270도 회전 (시계 방향)
            rotated_bbox = [y1, src_w - x2, y2, src_w - x1]
            rotated_landmarks = np.array([[landmark[1], src_w - landmark[0]] for landmark in landmarks])
        
        return rotated_bbox, rotated_landmarks
    
    def check_liveness(self, depth_frame, face_bbox, landmarks, threshold_distance=10.0):
        """
        깊이 정보를 분석하여 얼굴이 실제인지 확인합니다.
        보다 강력한 감지를 위해 여러 방법을 결합합니다.
        """
        x1, y1, x2, y2 = [int(val) for val in face_bbox]
        
        # 경계 상자가 프레임 경계 내에 있는지 확인
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(depth_frame.shape[1] - 1, x2)
        y2 = min(depth_frame.shape[0] - 1, y2)
        
        if x1 >= x2 or y1 >= y2:
            return False, {"error": "유효하지 않은 경계 상자"}
        
        # 얼굴에 해당하는 깊이 영역 추출
        face_depth = depth_frame[y1:y2, x1:x2].copy().astype(float)
        
        # 깊이 값을 미터로 변환
        face_depth = face_depth * self.depth_scale
        
        # 제로(깊이 데이터 없음)를 NaN으로 대체하여 더 나은 처리
        face_depth[face_depth == 0] = np.nan
        
        # 유효한 깊이 데이터가 충분하지 않으면 False 반환
        valid_depth_percentage = np.sum(~np.isnan(face_depth)) / face_depth.size
        if valid_depth_percentage < 0.5:  # 얼굴의 최소 50%에 유효한 깊이가 있어야 함
            return False, {"valid_depth_percentage": valid_depth_percentage}
        
        # 방법 1: 얼굴 전체의 깊이 변화
        depth_variation = np.nanmax(face_depth) - np.nanmin(face_depth)
        depth_variation_score = depth_variation > threshold_distance / 1000.0  # 미터 단위로 변환
        
        # 방법 2: 코 돌출 검사 (실제 얼굴은 돌출된 코가 있음)
        nose_point = landmarks[2]  # 코 끝 랜드마크
        nose_x, nose_y = int(nose_point[0]), int(nose_point[1])
        
        # 코 주변의 작은 영역 정의
        nose_region_size = 5
        nose_region_x1 = max(0, nose_x - nose_region_size)
        nose_region_y1 = max(0, nose_y - nose_region_size)
        nose_region_x2 = min(depth_frame.shape[1] - 1, nose_x + nose_region_size)
        nose_region_y2 = min(depth_frame.shape[0] - 1, nose_y + nose_region_size)
        
        if nose_region_x1 >= nose_region_x2 or nose_region_y1 >= nose_region_y2:
            nose_prominence_score = False
        else:
            nose_depth = depth_frame[nose_region_y1:nose_region_y2, nose_region_x1:nose_region_x2].copy().astype(float)
            nose_depth = nose_depth * self.depth_scale  # 미터로 변환
            nose_depth[nose_depth == 0] = np.nan
            
            if np.sum(~np.isnan(nose_depth)) > 0:
                # 얼굴 둘레의 평균 깊이 가져오기
                perimeter_depths = []
                
                # 상단 모서리
                if y1 + 5 < depth_frame.shape[0]:
                    top_edge = depth_frame[y1:y1+5, x1:x2].copy().astype(float) * self.depth_scale
                    top_edge[top_edge == 0] = np.nan
                    if np.sum(~np.isnan(top_edge)) > 0:
                        perimeter_depths.append(np.nanmean(top_edge))
                
                # 하단 모서리
                if y2 - 5 >= 0:
                    bottom_edge = depth_frame[y2-5:y2, x1:x2].copy().astype(float) * self.depth_scale
                    bottom_edge[bottom_edge == 0] = np.nan
                    if np.sum(~np.isnan(bottom_edge)) > 0:
                        perimeter_depths.append(np.nanmean(bottom_edge))
                
                # 왼쪽 모서리
                if x1 + 5 < depth_frame.shape[1]:
                    left_edge = depth_frame[y1:y2, x1:x1+5].copy().astype(float) * self.depth_scale
                    left_edge[left_edge == 0] = np.nan
                    if np.sum(~np.isnan(left_edge)) > 0:
                        perimeter_depths.append(np.nanmean(left_edge))
                
                # 오른쪽 모서리
                if x2 - 5 >= 0:
                    right_edge = depth_frame[y1:y2, x2-5:x2].copy().astype(float) * self.depth_scale
                    right_edge[right_edge == 0] = np.nan
                    if np.sum(~np.isnan(right_edge)) > 0:
                        perimeter_depths.append(np.nanmean(right_edge))
                    
                if len(perimeter_depths) > 0:
                    avg_perimeter_depth = np.mean(perimeter_depths)
                    nose_depth_avg = np.nanmean(nose_depth)
                    nose_prominence = avg_perimeter_depth - nose_depth_avg
                    nose_prominence_score = nose_prominence > 0.005  # 5mm (미터 단위)
                else:
                    nose_prominence_score = False
            else:
                nose_prominence_score = False
        
        # 방법 3: 얼굴 곡률 확인 - 실제 얼굴은 평평하지 않음
        if valid_depth_percentage > 0.7:  # 좋은 깊이 커버리지 필요
            # 좌표 그리드 생성
            y_indices, x_indices = np.indices(face_depth.shape)
            x_indices = x_indices.flatten()
            y_indices = y_indices.flatten()
            z_values = face_depth.flatten()
            
            # NaN 값 제거
            valid_mask = ~np.isnan(z_values)
            x_valid = x_indices[valid_mask]
            y_valid = y_indices[valid_mask]
            z_valid = z_values[valid_mask]
            
            if len(z_valid) > 10:  # 평면 피팅에 충분한 포인트 필요
                # 점들에 평면 피팅
                try:
                    A = np.column_stack((x_valid, y_valid, np.ones_like(x_valid)))
                    plane_coeffs, residuals, rank, s = np.linalg.lstsq(A, z_valid, rcond=None)
                    
                    # 평면으로부터의 잔차 계산 (얼굴이 얼마나 평평하지 않은지)
                    fitted_z = A @ plane_coeffs
                    residuals = z_valid - fitted_z
                    curvature_score = np.std(residuals) > 0.003  # 3mm (미터 단위)
                except:
                    curvature_score = False
            else:
                curvature_score = False
        else:
            curvature_score = False
        
        # 점수 결합 (보안을 위해 AND 로직 사용)
        is_live = depth_variation_score and (nose_prominence_score or curvature_score)
        
        # 디버깅을 위한 상세 점수 반환
        scores = {
            "depth_variation": depth_variation * 1000,  # 표시를 위해 mm로 변환
            "depth_variation_score": depth_variation_score,
            "nose_prominence_score": nose_prominence_score,
            "curvature_score": curvature_score,
            "valid_depth_percentage": valid_depth_percentage
        }
        
        return is_live, scores
    
    def get_3d_face_embedding(self, face_embedding, depth_frame, face_bbox, landmarks):
        """
        깊이 특성으로 2D 얼굴 임베딩을 강화하여 "3D 임베딩" 생성
        """
        x1, y1, x2, y2 = [int(val) for val in face_bbox]
        
        # 경계 상자가 프레임 경계 내에 있는지 확인
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(depth_frame.shape[1] - 1, x2)
        y2 = min(depth_frame.shape[0] - 1, y2)
        
        # 랜드마크 위치에서 깊이 값 가져오기
        landmark_depths = []
        for landmark in landmarks:
            x, y = int(landmark[0]), int(landmark[1])
            if 0 <= x < depth_frame.shape[1] and 0 <= y < depth_frame.shape[0]:
                depth = depth_frame[y, x] * self.depth_scale  # 미터로 변환
                landmark_depths.append(depth)
            else:
                landmark_depths.append(0)
        
        # 얼굴 깊이에서 통계적 특성 추출
        if x1 < x2 and y1 < y2:
            face_depth = depth_frame[y1:y2, x1:x2].copy().astype(float) * self.depth_scale
            face_depth[face_depth == 0] = np.nan
            
            depth_features = []
            if np.sum(~np.isnan(face_depth)) > 0:
                depth_features = [
                    np.nanmean(face_depth),        # 평균 깊이
                    np.nanstd(face_depth),         # 깊이 표준 편차
                    np.nanmax(face_depth) - np.nanmin(face_depth)  # 깊이 범위
                ]
            else:
                depth_features = [0, 0, 0]
        else:
            depth_features = [0, 0, 0]
        
        # 원본 임베딩과 깊이 특성 결합
        depth_features = np.array(landmark_depths + depth_features)
        
        # 깊이 특성 정규화
        if np.std(depth_features) > 0:
            depth_features = (depth_features - np.mean(depth_features)) / (np.std(depth_features) + 1e-6)
        
        # 원본 임베딩과 결합
        enhanced_embedding = np.concatenate([face_embedding, depth_features])
        
        return enhanced_embedding
    
    def save_embedding(self, embedding, liveness, age, gender, timestamp=None):
        """3D 얼굴 임베딩을 파일에 저장"""
        if timestamp is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        
        filename = os.path.join(self.save_dir, f"face_embedding_{timestamp}.pkl")
        data = {
            "embedding": embedding,
            "liveness": liveness,
            "age": age,
            "gender": gender,
            "timestamp": timestamp
        }
        
        with open(filename, "wb") as f:
            pickle.dump(data, f)
        
        return filename
    
    def run(self):
        """Pyglet 애플리케이션 실행"""
        try:
            pyglet.app.run()
        except Exception as e:
            print(f"Pyglet 실행 오류: {e}")
            traceback.print_exc()
        finally:
            self.cleanup()
    
    def cleanup(self):
        """리소스 정리"""
        try:
            self.pipeline.stop()
        except:
            pass

# FastAPI 서버 클래스
class FaceRecognitionServer:
    def __init__(self, app_instance, port=8000):
        self.app_instance = app_instance
        self.port = port
        self.api = FastAPI(title="RealSense 얼굴 인식 API")
        self.setup_routes()
        self.server_thread = None
    
    def setup_routes(self):
        @self.api.get("/")
        def root():
            return {"message": "RealSense 얼굴 인식 API 서버"}
        
        @self.api.post("/genderage")
        async def recognize(background_tasks: BackgroundTasks):
            # 이미 처리 중인지 확인
            if self.app_instance.processing_api_request:
                return {
                    "success": False,
                    "message": "이미 처리 중인 요청이 있습니다. 잠시 후 다시 시도하세요."
                }
            
            # 카메라 모드 활성화
            self.app_instance.set_camera_mode(True)
            
            # 프레임 수집 시작
            self.app_instance.start_frame_collection()
            
            # 결과 대기
            await asyncio.get_event_loop().run_in_executor(
                None, self.app_instance.api_result_event.wait
            )
            
            # 결과 가져오기
            result = self.app_instance.api_result
            
            # 배경 작업으로 2초 후 카메라 모드 종료
            background_tasks.add_task(self.delayed_camera_off, 2.0)
            
            return result
        
        @self.api.post("/camera")
        def camera_control(enable: bool = True, timeout: Optional[float] = None):
            self.app_instance.set_camera_mode(enable, timeout)
            return {
                "success": True,
                "camera_mode": enable,
                "timeout": timeout,
                "message": f"카메라 모드 {'활성화' if enable else '비활성화'} 성공"
            }
    
    async def delayed_camera_off(self, delay: float):
        """지정된 시간 후 카메라 모드 종료"""
        await asyncio.sleep(delay)
        self.app_instance.set_camera_mode(False)
    
    def start_server(self):
        """별도 스레드에서 FastAPI 서버 시작"""
        def run_server():
            uvicorn.run(self.api, host="0.0.0.0", port=self.port)
        
        self.server_thread = threading.Thread(target=run_server)
        self.server_thread.daemon = True
        self.server_thread.start()
        print(f"FastAPI 서버가 시작되었습니다 (포트: {self.port})")

if __name__ == "__main__":
    args = parse_args()
    app = RealSenseFaceLiveness(args)
    
    # API 서버 시작
    server = FaceRecognitionServer(app, port=args.api_port)
    server.start_server()
    # Pyglet 애플리케이션 실행
    app.run()