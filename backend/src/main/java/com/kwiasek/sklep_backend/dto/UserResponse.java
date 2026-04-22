package com.kwiasek.sklep_backend.dto;

import com.kwiasek.sklep_backend.model.User;
import com.kwiasek.sklep_backend.model.UserDetails;
import com.kwiasek.sklep_backend.model.UserRole;
import lombok.Data;

import java.util.List;

@Data
public class UserResponse {
    private Long id;
    private String username;
    private UserRole role;
    private UserDetails userDetails;
    private List<?> deliveryAddresses;

    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        if (user.getRole() != null) {
            this.role = user.getRole();
        }
        this.userDetails = user.getUserDetails();
        this.deliveryAddresses = user.getDeliveryAddresses();
    }
}