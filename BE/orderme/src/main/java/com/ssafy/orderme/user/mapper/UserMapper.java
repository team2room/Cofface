package com.ssafy.orderme.user.mapper;

import com.ssafy.orderme.user.model.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    User selectById(String id);
    User selectByInternalId(Long internalId);
    User selectByPhoneNumber(String phoneNumber);
    void insert(User user);
    void update(User user);
    void delete(String id);
    boolean existsByPhoneNumber(String phoneNumber);

}
