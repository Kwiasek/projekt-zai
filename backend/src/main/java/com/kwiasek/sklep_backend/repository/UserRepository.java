package com.kwiasek.sklep_backend.repository;

import com.kwiasek.sklep_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
