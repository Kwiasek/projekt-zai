package com.kwiasek.sklep_backend.repository;

import com.kwiasek.sklep_backend.model.Order;
import com.kwiasek.sklep_backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findAllByUser(User user, Pageable p);
}
