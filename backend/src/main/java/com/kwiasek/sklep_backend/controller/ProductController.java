package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.model.Product;
import com.kwiasek.sklep_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/products")
    public Iterable<Product> getProductsList() {
        return productRepository.findAll();
    }

}
