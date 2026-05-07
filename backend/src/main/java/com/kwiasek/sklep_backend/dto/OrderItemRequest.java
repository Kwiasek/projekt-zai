package com.kwiasek.sklep_backend.dto;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Long productId;
    private Integer quantity;
}
