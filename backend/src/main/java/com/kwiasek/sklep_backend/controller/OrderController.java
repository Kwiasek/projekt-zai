package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.dto.PlaceOrderRequest;
import com.kwiasek.sklep_backend.model.*;
import com.kwiasek.sklep_backend.repository.OrderRepository;
import com.kwiasek.sklep_backend.repository.ProductRepository;
import com.kwiasek.sklep_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.swing.text.html.Option;
import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    public ResponseEntity<List<Order>> getOrders(Principal principal) {
        Optional<User> resp = userRepository.findByUsername(principal.getName());
        if (resp.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = resp.get();

        // If the user is an admin, return all orders in the system
        if ("ROLE_ADMIN".equals(user.getRole().name())) {
            return ResponseEntity.ok(orderRepository.findAll());
        }
        
        // Otherwise, return only the orders belonging to this specific user
        return ResponseEntity.ok(orderRepository.findByUserId(user.getId()));
    }
    
    @PostMapping("/order")
    @Transactional
    public ResponseEntity<?> placeAnOrder(@RequestBody PlaceOrderRequest orderRequest, Principal principal) {
        Optional<User> resp = userRepository.findByUsername(principal.getName());
        if (resp.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }
        User user = resp.get();

        Order newOrder = new Order();
        newOrder.setUser(user);
        newOrder.setStatus(OrderStatus.PENDING);
        
        List<OrderItem> orderItems = new java.util.ArrayList<>();
        
        for (com.kwiasek.sklep_backend.dto.OrderItemRequest itemReq : orderRequest.getItems()) {
            Optional<Product> productOpt = productRepository.findById(itemReq.getProductId());
            if (productOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Product not found: " + itemReq.getProductId()));
            }
            
            Product product = productOpt.get();
            
            if (product.getStockQuantity() == null || product.getStockQuantity() < itemReq.getQuantity()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Insufficient stock for product: " + product.getName()));
            }
            
            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(newOrder);
            orderItem.setProduct(product);
            orderItem.setPriceAtPurchase(product.getPrice());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItems.add(orderItem);
        }

        newOrder.setItems(orderItems);
        Order savedOrder = orderRepository.save(newOrder);

        URI savedOrderUri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(savedOrder.getId())
                .toUri();

        return ResponseEntity.created(savedOrderUri).body(savedOrder);
    }
}
