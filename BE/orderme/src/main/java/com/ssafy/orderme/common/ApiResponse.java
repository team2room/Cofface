package com.ssafy.orderme.common;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private int status;
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(String message, T data){
        return ApiResponse.<T>builder()
                .status(200)
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data){
        return success("요청이 성공했습니다.",data);
    }

    public static ApiResponse<?> success(String message) {
        return success(message, null);
    }

    public static ApiResponse<?> error(int statusCode, String message) {
        return ApiResponse.builder()
                .status(statusCode)
                .success(false)
                .message(message)
                .data(null)
                .build();
    }

    public static ApiResponse<?> error(int statusCode, String message, Object errorData) {
        return ApiResponse.builder()
                .status(statusCode)
                .success(false)
                .message(message)
                .data(errorData)
                .build();
    }
}
