package com.kwiasek.sklep_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDTO {
    private Long id;
    private ProductDTO product;
    private Float priceAtPurchase;
    private Integer quantity;
}
