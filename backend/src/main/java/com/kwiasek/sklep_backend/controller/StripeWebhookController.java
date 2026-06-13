package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.model.Order;
import com.kwiasek.sklep_backend.model.OrderStatus;
import com.kwiasek.sklep_backend.repository.OrderRepository;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/webhook")
public class StripeWebhookController {

    @Autowired
    private OrderRepository orderRepository;

    @Value("${stripe.webhook.secret:}")
    private String endpointSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        
        Event event;
        try {
            if (endpointSecret == null || endpointSecret.isEmpty() || sigHeader == null) {
                // In dev mode without webhook secret or signature, parse event without verifying
                event = com.stripe.net.ApiResource.GSON.fromJson(payload, Event.class);
            } else {
                event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error: " + e.getMessage());
        }

        // Handle the checkout.session.completed event
        if ("checkout.session.completed".equals(event.getType())) {
            Optional<com.stripe.model.StripeObject> objectOpt = event.getDataObjectDeserializer().getObject();
            if (objectOpt.isPresent()) {
                Session session = (Session) objectOpt.get();
                String sessionId = session.getId();
                
                // Find order by stripe session ID and update status to PAID
                Optional<Order> orderOpt = orderRepository.findByStripeSessionId(sessionId);
                if (orderOpt.isPresent()) {
                    Order order = orderOpt.get();
                    order.setStatus(OrderStatus.PAID);
                    orderRepository.save(order);
                    System.out.println("Webhook: Order #" + order.getId() + " status updated to PAID");
                } else {
                    System.out.println("Webhook: No order found for Stripe Session ID: " + sessionId);
                }
            }
        }

        return ResponseEntity.ok("Success");
    }
}
