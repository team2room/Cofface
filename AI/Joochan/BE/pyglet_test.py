import pyglet

def main():
    # 기본 디스플레이와 사용 가능한 모든 스크린 정보 가져오기
    display = pyglet.display.get_display()
    screens = display.get_screens()
    
    print(f"감지된 디스플레이 수: {len(screens)}")
    for i, screen in enumerate(screens):
        print(f"스크린 #{i}: {screen.width}x{screen.height} @ ({screen.x}, {screen.y})")
    
    # 기본 창 생성 (960x540이 기본값이지만 명시적으로 지정)
    window = pyglet.window.Window(600, 1024, caption='다중 모니터 테스트', resizable=True)
    
    # 현재 스크린 인덱스 추적
    current_screen = 0
    
    # 사용법 레이블 생성
    instruction_labels = []
    for i in range(len(screens)):
        label = pyglet.text.Label(
            f'스크린 #{i}로 이동하려면 {i+1} 키를 누르세요',
            font_name='Arial',
            font_size=14,
            x=window.width//2, 
            y=window.height//2 - i*30,
            anchor_x='center', 
            anchor_y='center'
        )
        instruction_labels.append(label)
    
    # 현재 화면 정보 표시용 레이블
    info_label = pyglet.text.Label(
        'Screen info',
        font_name='Arial',
        font_size=16,
        x=window.width//2, 
        y=window.height - 50,
        anchor_x='center', 
        anchor_y='center'
    )
    
    # 추가 사용법
    keys_label = pyglet.text.Label(
        'F: 전체화면 전환, ESC: 종료',
        font_name='Arial',
        font_size=14,
        x=window.width//2, 
        y=30,
        anchor_x='center', 
        anchor_y='center'
    )
    
    @window.event
    def on_key_press(symbol, modifiers):
        nonlocal current_screen
        
        # 숫자 키 1-9는 49-57 (ASCII)
        if 49 <= symbol <= 49 + len(screens) - 1:
            display_num = symbol - 49  # 1키는 0번 스크린
            current_screen = display_num
            
            # 선택한 스크린 정보 가져오기
            screen = screens[current_screen]
            
            # 창 위치 설정 (스크린 중앙에 배치)
            x = screen.x + (screen.width - window.width) // 2
            y = screen.y + (screen.height - window.height) // 2
            
            # 현재 전체화면 상태 저장
            is_fullscreen = window.fullscreen
            
            # 전체화면이었다면 일단 windowed 모드로 전환
            if is_fullscreen:
                window.set_fullscreen(False)
            
            # 위치 설정
            window.set_location(x, y)
            
            # 전체화면이었다면 새 스크린에서 다시 전체화면으로
            if is_fullscreen:
                window.set_fullscreen(True, screen=screen)
            
            print(f"스크린 #{current_screen}로 이동: {screen.width}x{screen.height} @ {x},{y}")
        
        # F 키: 전체화면 전환
        if symbol == pyglet.window.key.F:
            window.set_fullscreen(not window.fullscreen, screen=screens[current_screen])
        
        # ESC 키: 종료
        if symbol == pyglet.window.key.ESCAPE:
            pyglet.app.exit()
    
    @window.event
    def on_draw():
        window.clear()
        
        # 현재 스크린 정보 업데이트 및 표시
        screen = screens[current_screen]
        info_label.text = (f'현재 스크린: #{current_screen} ({screen.width}x{screen.height}), '
                          f'창 위치: {window.get_location()}, 창 크기: {window.width}x{window.height}')
        
        # 레이블 그리기
        info_label.draw()
        keys_label.draw()
        
        # 사용 지침 표시
        for label in instruction_labels:
            label.draw()
    
    @window.event
    def on_resize(width, height):
        # 레이블 위치 업데이트
        info_label.x = width // 2
        info_label.y = height - 50
        
        keys_label.x = width // 2
        keys_label.y = 30
        
        for i, label in enumerate(instruction_labels):
            label.x = width // 2
            label.y = height // 2 - i * 30
        
        print(f'창 크기가 {width}x{height}로 변경되었습니다')
    
    # 애플리케이션 실행
    pyglet.app.run()

if __name__ == '__main__':
    main()