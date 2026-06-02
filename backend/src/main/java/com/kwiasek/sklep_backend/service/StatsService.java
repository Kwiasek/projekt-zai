package com.kwiasek.sklep_backend.service;

import com.kwiasek.sklep_backend.dto.DashboardStatsDTO;
import com.kwiasek.sklep_backend.model.Order;
import com.kwiasek.sklep_backend.model.OrderItem;
import com.kwiasek.sklep_backend.repository.CategoryRepository;
import com.kwiasek.sklep_backend.repository.OrderRepository;
import com.kwiasek.sklep_backend.repository.ProductRepository;
import com.kwiasek.sklep_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
public class StatsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public DashboardStatsDTO getDashboardStats() {
        List<Order> orders = orderRepository.findAll();
        
        float totalRevenue = 0;
        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                totalRevenue += item.getPriceAtPurchase() * item.getQuantity();
            }
        }

        long totalOrders = orders.size();
        long totalUsers = userRepository.count();
        long lowStockProducts = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() < 5)
                .count();

        // Sales trend (last 7 days - simplified)
        Map<String, Float> salesTrend = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (Order order : orders) {
            if (order.getCreatedAt() != null) {
                String date = order.getCreatedAt().format(formatter);
                float orderTotal = 0;
                for (OrderItem item : order.getItems()) {
                    orderTotal += item.getPriceAtPurchase() * item.getQuantity();
                }
                salesTrend.put(date, salesTrend.getOrDefault(date, 0f) + orderTotal);
            }
        }

        List<DashboardStatsDTO.SalesDataDTO> salesData = salesTrend.entrySet().stream()
                .map(e -> new DashboardStatsDTO.SalesDataDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Category distribution
        List<DashboardStatsDTO.CategoryDataDTO> categoryData = categoryRepository.findAll().stream()
                .map(c -> {
                    long count = productRepository.findAll().stream()
                            .filter(p -> p.getCategory() != null && p.getCategory().getId().equals(c.getId()))
                            .count();
                    return new DashboardStatsDTO.CategoryDataDTO(c.getName(), count);
                })
                .collect(Collectors.toList());

        return new DashboardStatsDTO(
                totalRevenue,
                totalOrders,
                totalUsers,
                lowStockProducts,
                salesData,
                categoryData
        );
    }
}
