package com.kwiasek.sklep_backend.repository;

import com.kwiasek.sklep_backend.model.Product;
import org.springframework.data.repository.CrudRepository;

public interface ProductRepository extends CrudRepository<Product, Long> {
}
