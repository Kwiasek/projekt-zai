package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.dto.PlaceOrderRequest;
import com.kwiasek.sklep_backend.model.Product;
import com.kwiasek.sklep_backend.model.Order;
import com.kwiasek.sklep_backend.model.OrderStatus;
import com.kwiasek.sklep_backend.repository.ProductRepository;
import com.kwiasek.sklep_backend.repository.OrderRepository;
import com.kwiasek.sklep_backend.service.StripeService;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class PaymentController {

    @Autowired
    private StripeService stripeService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PlaceOrderRequest orderRequest) {
        try {
            double total = 0;
            for (var itemReq : orderRequest.getItems()) {
                Optional<Product> productOpt = productRepository.findById(itemReq.getProductId());
                if (productOpt.isPresent()) {
                    total += productOpt.get().getPrice() * itemReq.getQuantity();
                }
            }

            // Stripe expects amount in cents
            long amountInCents = Math.round(total * 100);
            
            if (amountInCents <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid order amount"));
            }

            com.stripe.model.checkout.Session session = stripeService.createCheckoutSession(amountInCents, "usd");
            return ResponseEntity.ok(Map.of(
                "clientSecret", session.getClientSecret(),
                "sessionId", session.getId()
            ));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/payment/verify")
    public ResponseEntity<?> verifyPayment(@RequestParam String sessionId) {
        try {
            com.stripe.model.checkout.Session session = com.stripe.model.checkout.Session.retrieve(sessionId);
            if ("paid".equals(session.getPaymentStatus())) {
                Optional<Order> orderOpt = orderRepository.findByStripeSessionId(sessionId);
                if (orderOpt.isPresent()) {
                    Order order = orderOpt.get();
                    if (order.getStatus() == OrderStatus.PENDING) {
                        order.setStatus(OrderStatus.PAID);
                        orderRepository.save(order);
                    }
                    return ResponseEntity.ok(Map.of("status", "PAID", "orderId", order.getId()));
                }
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Order not found for session"));
            }
            return ResponseEntity.ok(Map.of("status", "UNPAID"));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
