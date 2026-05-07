package com.kwiasek.sklep_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Float priceAtPurchase;

    private Integer quantity;
}
