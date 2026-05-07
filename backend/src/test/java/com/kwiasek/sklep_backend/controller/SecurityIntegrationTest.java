package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.model.*;
import com.kwiasek.sklep_backend.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.kwiasek.sklep_backend.repository.UserRepository userRepository;

    @Autowired
    private com.kwiasek.sklep_backend.repository.ProductRepository productRepository;

    @Autowired
    private com.kwiasek.sklep_backend.repository.OrderRepository orderRepository;

    @Test
    void shouldAllowAccessToPublicEndpoints() throws Exception {
        // Now public endpoints return 200 OK
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldDenyAccessToUserEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/user"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowAccessToUserEndpointWithValidToken() throws Exception {
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("password");
        user.setRole(UserRole.ROLE_USER);
        userRepository.save(user);

        String token = jwtUtil.generateAccessToken(user);

        mockMvc.perform(get("/api/user")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void shouldDenyAdminEndpointForRegularUser() throws Exception {
        User user = new User();
        user.setUsername("regularuser");
        user.setPassword("password");
        user.setRole(UserRole.ROLE_USER);
        userRepository.save(user);

        String token = jwtUtil.generateAccessToken(user);

        mockMvc.perform(post("/api/product")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowAdminEndpointForAdminUser() throws Exception {
        User admin = new User();
        admin.setUsername("adminuser");
        admin.setPassword("password");
        admin.setRole(UserRole.ROLE_ADMIN);
        userRepository.save(admin);

        String token = jwtUtil.generateAccessToken(admin);

        mockMvc.perform(post("/api/product")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test Product\", \"price\": 10.0}"))
                .andExpect(status().isCreated());
    }

    @Test
    void shouldAllowAccessToOrdersForAuthenticatedUser() throws Exception {
        User user = new User();
        user.setUsername("orderuser");
        user.setPassword("password");
        user.setRole(UserRole.ROLE_USER);
        userRepository.save(user);

        String token = jwtUtil.generateAccessToken(user);

        mockMvc.perform(get("/api/orders")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void shouldDenyAccessToOrdersWithoutToken() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldDeductInventoryAndSnapshotPriceOnOrder() throws Exception {
        // 1. Create Product
        Product product = new Product();
        product.setName("Snap Product");
        product.setPrice(50.0f);
        product.setStockQuantity(10);
        product = productRepository.save(product);

        // 2. Create User
        User user = new User();
        user.setUsername("buyer");
        user.setPassword("password");
        user.setRole(UserRole.ROLE_USER);
        userRepository.save(user);
        String token = jwtUtil.generateAccessToken(user);

        // 3. Place Order
        com.kwiasek.sklep_backend.dto.OrderItemRequest itemReq = new com.kwiasek.sklep_backend.dto.OrderItemRequest();
        itemReq.setProductId(product.getId());
        itemReq.setQuantity(2);

        com.kwiasek.sklep_backend.dto.PlaceOrderRequest orderReq = new com.kwiasek.sklep_backend.dto.PlaceOrderRequest();
        orderReq.setItems(List.of(itemReq));

        mockMvc.perform(post("/api/order")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated());

        // 4. Verify Inventory
        Product updatedProduct = productRepository.findById(product.getId()).orElseThrow();
        assertThat(updatedProduct.getStockQuantity()).isEqualTo(8);

        // 5. Verify Order Snapshot
        List<Order> userOrders = orderRepository.findByUserId(user.getId());
        assertThat(userOrders).hasSize(1);
        Order savedOrder = userOrders.get(0);
        assertThat(savedOrder.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(savedOrder.getItems()).hasSize(1);
        assertThat(savedOrder.getItems().get(0).getPriceAtPurchase()).isEqualTo(50.0f);
        assertThat(savedOrder.getItems().get(0).getQuantity()).isEqualTo(2);
    }
}
