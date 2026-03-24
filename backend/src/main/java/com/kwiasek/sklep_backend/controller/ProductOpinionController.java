package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.dto.ProductOpinionDTO;
import com.kwiasek.sklep_backend.model.ProductOpinion;
import com.kwiasek.sklep_backend.service.ProductOpinionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/opinions")
@RequiredArgsConstructor
public class ProductOpinionController {

    private final ProductOpinionService productOpinionService;

    @PostMapping("/product/{productId}")
    public ResponseEntity<ProductOpinion> addOpinion(
            @PathVariable Long productId,
            @Valid @RequestBody ProductOpinionDTO opinionDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ProductOpinion newOpinion = productOpinionService.addOpinion(productId, opinionDTO, userDetails.getUsername());
        return new ResponseEntity<>(newOpinion, HttpStatus.CREATED);
    }
}
