package com.kwiasek.sklep_backend.repository;

import com.kwiasek.sklep_backend.model.DeliveryAddress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryAdressRepository extends JpaRepository<DeliveryAddress, Long> {
}
