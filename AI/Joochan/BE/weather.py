import requests, public_ip, os
from dotenv import load_dotenv
from pprint import pprint

load_dotenv()

def analyze_weather_feeling(weather_data):
    """
    날씨 데이터를 분석하여 사람이 느끼는 날씨를 반환
    """
    # 관련 데이터 추출
    temp_celsius = weather_data['main']['temp']
    feels_like_celsius = weather_data['main']['feels_like']
    humidity = weather_data['main']['humidity']
    wind_speed = weather_data['wind']['speed']
    weather_condition = weather_data['weather'][0]['main']
    weather_description = weather_data['weather'][0]['description']
    clouds_percentage = weather_data['clouds']['all']  # 구름 비율(%)
    
    # 온도와 습도를 함께 고려한 체감 온도 결정
    # 불쾌지수 계산 (간단한 버전)
    discomfort_index = 0.81 * temp_celsius + 0.01 * humidity * (0.99 * temp_celsius - 14.3) + 46.3
    
    # 온도 느낌 결정 (불쾌지수와 습도를 고려)
    if feels_like_celsius < 5:
        temp_feeling = "매우 추움"
    elif feels_like_celsius < 12:
        temp_feeling = "추움"
    elif feels_like_celsius < 18:
        temp_feeling = "서늘함"
    elif feels_like_celsius < 22:
        # 쾌적함 범위에서 습도 고려
        if humidity > 70:
            temp_feeling = "후덥지근함"  # 습도가 높으면 쾌적하지 않음
        else:
            temp_feeling = "쾌적함"
    elif feels_like_celsius < 26:
        if humidity > 65:
            temp_feeling = "무더움"  # 습도가 높으면 더 덥게 느껴짐
        else:
            temp_feeling = "따뜻함"
    elif feels_like_celsius < 30:
        if humidity > 60:
            temp_feeling = "매우 더움"
        else:
            temp_feeling = "더움"
    else:
        if humidity > 55:
            temp_feeling = "극도로 더움"
        else:
            temp_feeling = "매우 더움"
    
    # 날씨 상태 느낌 결정 - 구름 상태를 더 세분화
    if weather_condition == 'Clear':
        weather_feeling = "맑음"
    elif weather_condition == 'Clouds':
        # 구름 양에 따라 더 세분화
        if clouds_percentage >= 90 or weather_description == 'overcast clouds':
            weather_feeling = "흐림"
        elif clouds_percentage >= 70 or weather_description == 'broken clouds':
            weather_feeling = "구름 많음"
        elif clouds_percentage >= 30 or weather_description == 'scattered clouds':
            weather_feeling = "구름 조금"
        else:
            weather_feeling = "맑음, 구름 약간"
    elif weather_condition == 'Rain':
        if 'light' in weather_description:
            weather_feeling = "가벼운 비"
        elif 'heavy' in weather_description:
            weather_feeling = "폭우"
        else:
            weather_feeling = "비"
    elif weather_condition == 'Snow':
        if 'light' in weather_description:
            weather_feeling = "가벼운 눈"
        elif 'heavy' in weather_description:
            weather_feeling = "폭설"
        else:
            weather_feeling = "눈"
    elif weather_condition == 'Thunderstorm':
        weather_feeling = "천둥번개"
    elif weather_condition == 'Drizzle':
        weather_feeling = "이슬비"
    elif weather_condition in ['Mist', 'Fog']:
        weather_feeling = "안개"
    elif weather_condition == 'Haze':
        weather_feeling = "연무"
    elif weather_condition == 'Dust' or 'sand' in weather_description:
        weather_feeling = "먼지"
    else:
        weather_feeling = weather_description
    
    # 추가 느낌 (바람만 고려 - 습도는 이미 온도 느낌에 반영됨)
    additional_feelings = []
    
    if wind_speed > 13.8:  # 약 50km/h
        additional_feelings.append("강풍")
    elif wind_speed > 10.7:  # 약 39km/h
        additional_feelings.append("강한 바람")
    elif wind_speed > 5.5:  # 약 20km/h
        additional_feelings.append("바람 많음")
    
    # 느낌들 조합
    feelings = [temp_feeling, weather_feeling]
    feelings.extend(additional_feelings)
    
    return feelings

# 주요 날씨 느낌만 반환하는 함수
def get_dominant_weather_feeling(weather_data):
    """
    가장 두드러진 날씨 특성을 파악하여 대표적인 느낌을 반환
    """
    temp_celsius = weather_data['main']['temp']
    feels_like_celsius = weather_data['main']['feels_like']
    humidity = weather_data['main']['humidity']
    wind_speed = weather_data['wind']['speed']
    weather_condition = weather_data['weather'][0]['main']
    weather_description = weather_data['weather'][0]['description']
    clouds_percentage = weather_data['clouds']['all']
    
    # 불쾌지수 계산 (간단한 버전)
    discomfort_index = 0.81 * temp_celsius + 0.01 * humidity * (0.99 * temp_celsius - 14.3) + 46.3
    
    # 우선순위: 극단적 날씨 > 강한 바람 > 극단적 온도 > 일반적 상태
    
    # 극단적 날씨 확인
    if weather_condition in ['Thunderstorm', 'Tornado']:
        return "위험한 날씨"
    elif weather_condition == 'Snow':
        if 'heavy' in weather_description:
            return "폭설"
        return "눈"
    elif weather_condition == 'Rain':
        if 'heavy' in weather_description:
            return "폭우"
        return "비"
    
    # 강한 바람 확인
    if wind_speed > 13.8:
        return "강풍"
    elif wind_speed > 10.7:
        return "강한 바람"
    
    # 극단적 온도와 습도 확인
    if discomfort_index > 80:
        return "매우 더움"
    elif feels_like_celsius > 29:
        if humidity > 60:
            return "극도로 더움"
        return "매우 더움"
    elif feels_like_celsius < 5:
        return "매우 추움"
    
    # 일반적 온도 확인 (습도 고려)
    if feels_like_celsius > 26:
        if humidity > 60:
            return "무더움"
        return "더움"
    elif feels_like_celsius < 12:
        return "추움"
    elif feels_like_celsius >= 22 and feels_like_celsius <= 26:
        if humidity > 70:
            return "후덥지근함"
    
    # 맑음 vs 흐림 확인
    if weather_condition == 'Clear':
        return "맑음"
    elif weather_condition == 'Clouds':
        if clouds_percentage >= 90 or weather_description == 'overcast clouds':
            return "흐림"
        elif clouds_percentage >= 70 or weather_description == 'broken clouds':
            return "구름 많음"
        elif clouds_percentage >= 30 or weather_description == 'scattered clouds':
            return "구름 조금"
        else:
            return "맑음, 구름 약간"
    
    # 기본 쾌적한 느낌
    return "쾌적함"

def get_weather(city=None):
    api_key = os.getenv('OPEN_WEATHER_API_KEY')
    geo_api_key = os.getenv('GEO_API_KEY')
    
    if city == None:
        myip=showpublicIp()
        geourl=f'https://geo.ipify.org/api/v2/country,city?apiKey={geo_api_key}&ipAddress={myip}'
    
        response = requests.get(geourl)
        parsed_data = response.json()
    
        city = parsed_data['location']['region']
    
    url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric'

    response = requests.get(url)
    weather_data = response.json()
    
    detailed_feeling = analyze_weather_feeling(weather_data)
    dominant_feeling = get_dominant_weather_feeling(weather_data)
    
    dic={
        'dominant' : dominant_feeling,
        'detail' : detailed_feeling
    }
    return dic

def showpublicIp():
    ip = public_ip.get()
    return ip

if __name__ == '__main__':
    result = get_weather()
    pprint(result)