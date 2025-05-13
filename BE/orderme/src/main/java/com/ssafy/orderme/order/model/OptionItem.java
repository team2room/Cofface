package com.ssafy.orderme.order.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionItem {
    private Integer itemId;
    private Integer categoryId;
    private String optionName;
    private Integer additionalPrice;
    private Boolean isDefault;
    private Integer displayOrder;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
}
