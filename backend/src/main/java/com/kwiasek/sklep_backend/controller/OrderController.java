package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.dto.PlaceOrderRequest;
import com.kwiasek.sklep_backend.model.Order;
import com.kwiasek.sklep_backend.model.Product;
import com.kwiasek.sklep_backend.model.User;
import com.kwiasek.sklep_backend.repository.OrderRepository;
import com.kwiasek.sklep_backend.repository.ProductRepository;
import com.kwiasek.sklep_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/orders")
    public ResponseEntity<Page<Order>> getOrders(Pageable p, Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // If the user is an admin, return all orders in the system
        if ("ROLE_ADMIN".equals(user.getRole().name())) {
            return ResponseEntity.ok(orderRepository.findAll(p));
        }
        
        // Otherwise, return only the orders belonging to this specific user
        return ResponseEntity.ok(orderRepository.findAllByUser(user, p));
    }
    
    @PostMapping("/order")
    public ResponseEntity<?> placeAnOrder(@RequestBody PlaceOrderRequest orderRequest, Principal principal) {
        // principal.getName() returns the username extracted from the JWT
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            // This should not happen if the JWT filter is working, but it's a good safeguard.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        // Fetch all products from the database based on the IDs in the request
        List<Product> products = productRepository.findAllById(orderRequest.getProductIds());

        // Optional but recommended: Check if all requested products were found.
        // This prevents placing an order for products that don't exist.
        if (products.size() != orderRequest.getProductIds().size()) {
            return ResponseEntity.badRequest().body("One or more product IDs are invalid.");
        }

        // Create a new order and set its properties
        Order newOrder = new Order();
        newOrder.setUser(user);
        newOrder.setProducts(products);

        Order savedOrder = orderRepository.save(newOrder);

        // Return 201 Created with the proper Location header
        URI savedOrderUri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(savedOrder.getId())
                .toUri();

        return ResponseEntity.created(savedOrderUri).body(savedOrder);
    }
}
