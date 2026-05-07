package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.model.Product;
import com.kwiasek.sklep_backend.model.ProductImage;
import com.kwiasek.sklep_backend.repository.ProductImageRepository;
import com.kwiasek.sklep_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ImageController {

    @Autowired
    private ProductImageRepository imageRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/product/{productId}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder) {
        
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            ProductImage image = new ProductImage();
            image.setProduct(productOpt.get());
            image.setImageData(file.getBytes());
            image.setContentType(file.getContentType());
            image.setDisplayOrder(displayOrder);
            
            ProductImage savedImage = imageRepository.save(image);
            return ResponseEntity.status(HttpStatus.CREATED).body("Image uploaded with ID: " + savedImage.getId());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload image.");
        }
    }

    @GetMapping("/image/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long imageId) {
        Optional<ProductImage> imageOpt = imageRepository.findById(imageId);
        if (imageOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ProductImage image = imageOpt.get();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"image-" + imageId + "\"")
                .body(image.getImageData());
    }

    @DeleteMapping("/image/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        if (imageRepository.existsById(imageId)) {
            imageRepository.deleteById(imageId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
