package com.kwiasek.sklep_backend.dto;

import com.kwiasek.sklep_backend.model.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private Float price;
    private Integer stockQuantity;
    private Category category;
    private java.util.Map<String, String> attributes;
    private List<ProductImageDTO> images;
}
