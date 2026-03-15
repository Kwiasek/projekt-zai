package com.kwiasek.sklep_backend.repository;

import com.kwiasek.sklep_backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
