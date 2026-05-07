package com.kwiasek.sklep_backend.repository;

import com.kwiasek.sklep_backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndCategoryId(String name, Long categoryId, Pageable pageable);
}
