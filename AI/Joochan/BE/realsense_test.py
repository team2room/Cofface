import pyrealsense2 as rs
import eddmPrint
try:
    ctx = rs.context()
    devices = ctx.query_devices()
    if len(devices) == 0:
        raise RuntimeError("RealSense 장치가 감지되지 않았습니다.")
    print(f"감지된 장치: {devices[0].get_info(rs.camera_info.name)}")

    device = devices[0]

    sensors = device.query_sensors()
    for sensor in sensors:
        print(f"\n센서: {sensor.get_info(rs.camera_info.name)}")
        for profile in sensor.get_stream_profiles():
            try:
                video_profile = profile.as_video_stream_profile()
                fmt = profile.format()
                w, h = video_profile.width(), video_profile.height()
                fps = video_profile.fps()
                print(f"  - {fmt} : {w}x{h} @ {fps}fps")
            except Exception as e:
                continue
    
    pipeline = rs.pipeline()
    config = rs.config()


    # 문제의 원인을 알아내기 위한 스트림 설정
    config.enable_stream(rs.stream.depth, 1280, 720, rs.format.z16, 30)
    config.enable_stream(rs.stream.color, 1280, 720, rs.format.bgr8, 30)


    # ✨ 에러 위치 디버깅을 위해 resolve 먼저 시도
    profile = config.resolve(pipeline)
    print("스트림 config.resolve()")

    pipeline.start(config)
    print("pipeline.start()")

    pipeline.stop()

except Exception as e:
    print(f"오류 발생: {e}")
