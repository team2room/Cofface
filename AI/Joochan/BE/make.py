import qrcode
from PIL import Image

# 웹 링크 URL
url = "https://app.orderme.store"

# QR 코드 생성 - 작은 크기로 생성
qr = qrcode.QRCode(
    version=4,  # 최소 버전 사용
    error_correction=qrcode.constants.ERROR_CORRECT_H,  # 오류 복구 수준 낮게 (크기 감소)
    box_size=1,  # 모듈 크기를 최소화
    border=1,    # 테두리 최소화
)
qr.add_data(url)
qr.make(fit=True)

# QR 코드 이미지 생성
qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")

# 이미지 크기 확인
print(f"생성된 QR 코드 크기: {qr_img.size}")

# 정확히 36x36 크기로 조정 (필요한 경우)
final_size = 35
qr_img_resized = qr_img.resize((final_size, final_size), Image.LANCZOS)

# 배경을 투명하게 만들기
datas = qr_img_resized.getdata()
new_data = []
for item in datas:
    if item[0] == 255 and item[1] == 255 and item[2] == 255:
        new_data.append((255, 255, 255, 0))  # 완전 투명
    else:
        new_data.append(item)  # 그대로 유지
qr_img_resized.putdata(new_data)

# 최종 이미지 저장
qr_img_resized.save("orderme_qrcode_36x36.png")