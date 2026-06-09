package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.dto.PlaceOrderRequest;
import com.kwiasek.sklep_backend.model.Product;
import com.kwiasek.sklep_backend.repository.ProductRepository;
import com.kwiasek.sklep_backend.service.StripeService;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
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

            String clientSecret = stripeService.createCheckoutSession(amountInCents, "usd");
            return ResponseEntity.ok(Map.of("clientSecret", clientSecret));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
