package com.kwiasek.sklep_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class PlaceOrderRequest {
    private List<OrderItemRequest> items;
    private String status;
}
