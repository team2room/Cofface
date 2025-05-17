package com.ssafy.orderme.notification.mapper;

import com.ssafy.orderme.notification.model.FcmToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FcmTokenMapper {
    FcmToken findByUserId(@Param("userId") String userId);
    void saveToken(FcmToken fcmToken);
    void updateToken(FcmToken fcmToken);
}
