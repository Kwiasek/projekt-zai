package com.kwiasek.sklep_backend.service;

import com.kwiasek.sklep_backend.dto.ProductOpinionDTO;
import com.kwiasek.sklep_backend.exception.ResourceNotFoundException;
import com.kwiasek.sklep_backend.model.Order;
import com.kwiasek.sklep_backend.model.Product;
import com.kwiasek.sklep_backend.model.ProductOpinion;
import com.kwiasek.sklep_backend.model.User;
import com.kwiasek.sklep_backend.repository.OrderRepository;
import com.kwiasek.sklep_backend.repository.ProductOpinionRepository;
import com.kwiasek.sklep_backend.repository.ProductRepository;
import com.kwiasek.sklep_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductOpinionService {

    private final ProductOpinionRepository opinionRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public ProductOpinion addOpinion(Long productId, ProductOpinionDTO opinionDTO, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!hasUserPurchasedProduct(user, product)) {
            throw new AccessDeniedException("You can only review products you have purchased.");
        }

        if (hasUserAlreadyReviewedProduct(user, product)) {
            throw new IllegalStateException("You have already reviewed this product.");
        }

        ProductOpinion opinion = ProductOpinion.builder()
                .user(user)
                .product(product)
                .rating(opinionDTO.getRating())
                .comment(opinionDTO.getComment())
                .build();

        return opinionRepository.save(opinion);
    }

    private boolean hasUserPurchasedProduct(User user, Product product) {
        List<Order> userOrders = orderRepository.findByUserId(user.getId());
        return userOrders.stream()
                .anyMatch(order -> order.getProducts().contains(product));
    }

    private boolean hasUserAlreadyReviewedProduct(User user, Product product) {
        return product.getOpinions().stream()
                .anyMatch(opinion -> opinion.getUser().equals(user));
    }
}
