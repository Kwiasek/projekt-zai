package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.dto.*;
import com.kwiasek.sklep_backend.model.*;
import com.kwiasek.sklep_backend.repository.OrderRepository;
import com.kwiasek.sklep_backend.repository.ProductRepository;
import com.kwiasek.sklep_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
    @Transactional(readOnly = true)
    public ResponseEntity<List<OrderDTO>> getOrders(Principal principal) {
        Optional<User> resp = userRepository.findByUsername(principal.getName());
        if (resp.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = resp.get();
        List<Order> orders;

        // If the user is an admin, return all orders in the system
        if (UserRole.ROLE_ADMIN.equals(user.getRole())) {
            orders = orderRepository.findAll();
        } else {
            // Otherwise, return only the orders belonging to this specific user
            orders = orderRepository.findByUserId(user.getId());
        }
        
        return ResponseEntity.ok(orders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()));
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
        
        if (orderRequest.getStatus() != null) {
            try {
                newOrder.setStatus(OrderStatus.valueOf(orderRequest.getStatus()));
            } catch (IllegalArgumentException e) {
                newOrder.setStatus(OrderStatus.PENDING);
            }
        } else {
            newOrder.setStatus(OrderStatus.PENDING);
        }
        
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

        return ResponseEntity.created(savedOrderUri).body(convertToDto(savedOrder));
    }

    @PutMapping("/order/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            String statusStr = statusMap.get("status");
            try {
                order.setStatus(OrderStatus.valueOf(statusStr));
                orderRepository.save(order);
                return ResponseEntity.ok(convertToDto(order));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private OrderDTO convertToDto(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUser(new UserResponse(order.getUser()));
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private OrderItemDTO convertToDto(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setPriceAtPurchase(item.getPriceAtPurchase());
        dto.setQuantity(item.getQuantity());
        dto.setProduct(convertToDto(item.getProduct()));
        return dto;
    }

    private ProductDTO convertToDto(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setCategory(product.getCategory());
        dto.setAttributes(product.getAttributes());
        if (product.getImages() != null) {
            dto.setImages(product.getImages().stream()
                    .map(img -> new ProductImageDTO(img.getId(), img.getContentType(), img.getDisplayOrder()))
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
