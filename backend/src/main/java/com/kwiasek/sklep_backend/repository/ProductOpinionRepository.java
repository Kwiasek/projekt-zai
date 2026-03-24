package com.kwiasek.sklep_backend.repository;

import com.kwiasek.sklep_backend.model.ProductOpinion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductOpinionRepository extends JpaRepository<ProductOpinion, Long> {
}
