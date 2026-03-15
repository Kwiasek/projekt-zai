package com.kwiasek.sklep_backend.repository;

import com.kwiasek.sklep_backend.model.UserDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDetailsRepository extends JpaRepository<UserDetails, Long> {
}
