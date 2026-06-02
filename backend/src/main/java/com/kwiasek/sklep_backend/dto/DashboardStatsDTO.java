package com.kwiasek.sklep_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Float totalRevenue;
    private Long totalOrders;
    private Long totalUsers;
    private Long lowStockProducts;
    private List<SalesDataDTO> salesData;
    private List<CategoryDataDTO> categoryData;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesDataDTO {
        private String date;
        private Float amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryDataDTO {
        private String name;
        private Long count;
    }
}
