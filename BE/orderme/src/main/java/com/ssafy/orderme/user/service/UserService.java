package com.ssafy.orderme.user.service;

import com.ssafy.orderme.user.mapper.UserMapper;
import com.ssafy.orderme.user.model.Gender;
import com.ssafy.orderme.user.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    // 사용자 기본 정보 검증
    public boolean validateUserBasicInfo(String name, String idNumberFront, String idNumberGender) {
        // 간단한 검증 로직
        return name != null && !name.isBlank() &&
                idNumberFront != null && idNumberFront.length() == 6 &&
                idNumberGender != null && idNumberGender.length() == 1 &&
                (idNumberGender.equals("1") || idNumberGender.equals("2") || idNumberGender.equals("3") || idNumberGender.equals("4"));
    }

    // 전화번호 중복 확인
    public boolean isPhoneNumberRegistered(String phoneNumber) {
        return userMapper.existsByPhoneNumber(phoneNumber);
    }

    // 전화번호로 사용자 조회
    public User findByPhoneNumber(String phoneNumber) {
        return userMapper.selectByPhoneNumber(phoneNumber);
    }

    // 사용자 ID로 사용자 조회
    public User findById(String userId){ return userMapper.selectById(userId); }

    // 회원가입
    @Transactional
    public User createUser(String name, String idNumberFront, String idNumberGender,
                           String phoneNumber, String password) {
        // idNumberGender 값에 따라 세기 결정 (1,2: 1900년대, 3,4: 2000년대)
        String century = (idNumberGender.equals("1") || idNumberGender.equals("2")) ? "19" : "20";
        String birthYear = century + idNumberFront.substring(0, 2);
        String birthMonth = idNumberFront.substring(2, 4);
        String birthDay = idNumberFront.substring(4, 6);

        // MySQL DATETIME 형식의 문자열 생성: YYYY-MM-DD 00:00:00
        String birthDateStr = birthYear + "-" + birthMonth + "-" + birthDay + " 00:00:00";
        Date birthDate;

        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            birthDate = dateFormat.parse(birthDateStr);
        } catch (ParseException e) {
            log.error("생년월일 파싱 오류", e);
            // 오류 발생 시 현재 날짜 사용 (또는 다른 오류 처리 방식 선택)
            birthDate = new Date();
        }

        Gender gender = idNumberGender.equals("1") || idNumberGender.equals("3") ? Gender.MALE : Gender.FEMALE;

        // 비밀번호 암호화
        String encryptedPassword = passwordEncoder.encode(password);

        // UUID 생성
        String userId = UUID.randomUUID().toString();

        User user = User.builder()
                .id(userId)
                .name(name)
                .phoneNumber(phoneNumber)
                .birthDate(birthDate)  // 변환된 Date 객체 사용
                .password(encryptedPassword)  // 암호화된 비밀번호 저장
                .gender(gender)
                .build();

        userMapper.insert(user);
        return user;
    }
}
