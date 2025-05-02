package com.ssafy.orderme.user.service;

import com.ssafy.orderme.user.mapper.AdminMapper;
import com.ssafy.orderme.user.mapper.UserMapper;
import com.ssafy.orderme.user.model.Admin;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {
    private final PasswordEncoder passwordEncoder;
    private final AdminMapper adminMapper;

    // 아이디로 관리자 조회
    public Admin findById(String id) {
        return adminMapper.selectById(id);
    }

    // 비밀번호 검증
    public boolean validatePassword(String rawPassword, String encodePassword){
        return passwordEncoder.matches(rawPassword, encodePassword);
    }

    // 아이디 중복 확인
    public boolean isIdRegistered(String id){
        return adminMapper.existsById(id);
    }

    // 회원가입
    @Transactional
    public Admin createAdmin(String id, String password, Long storeId){
        // 비밀번호 암호화
        String encryptedPassword = passwordEncoder.encode(password);

        Admin admin = Admin.builder()
                .id(id)
                .password(encryptedPassword)
                .storeId(storeId)
                .build();

        adminMapper.insert(admin);
        return admin;
    }
}
