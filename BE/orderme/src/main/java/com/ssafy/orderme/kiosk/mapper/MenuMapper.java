package com.ssafy.orderme.kiosk.mapper;

import com.ssafy.orderme.kiosk.model.Menu;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MenuMapper {
    Menu findById(Integer menuId);
}
