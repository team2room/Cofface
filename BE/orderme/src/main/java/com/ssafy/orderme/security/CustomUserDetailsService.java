package com.ssafy.orderme.security;

import com.ssafy.orderme.user.mapper.UserMapper;
import com.ssafy.orderme.user.model.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserMapper userMapper;

    public CustomUserDetailsService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        // userId로 사용자를 찾고 UserDetails로 변환
        User user = userMapper.selectById(userId);

        if (user == null) {
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + userId);
        }

        return new org.springframework.security.core.userdetails.User(
                user.getId(),
                user.getPassword(),
                Collections.emptyList() // 필요한 경우 권한 설정
        );
    }
}
