package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.dto.ProductDTO;
import com.kwiasek.sklep_backend.dto.ProductImageDTO;
import com.kwiasek.sklep_backend.model.Product;
import com.kwiasek.sklep_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.security.access.prepost.PreAuthorize;

import java.net.URI;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/products")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<ProductDTO>> getProductsList(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            Pageable p) {
        Page<Product> products;
        if (name != null && categoryId != null) {
            products = productRepository.findByNameContainingIgnoreCaseAndCategoryId(name, categoryId, p);
        } else if (name != null) {
            products = productRepository.findByNameContainingIgnoreCase(name, p);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId, p);
        } else {
            products = productRepository.findAll(p);
        }
        return ResponseEntity.ok(products.map(this::convertToDto));
    }

    @GetMapping("/product/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(p -> ResponseEntity.ok(convertToDto(p)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/product")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ProductDTO> addProduct(@RequestBody Product product) {
        Product savedProduct = productRepository.save(product);
        URI savedProductUri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(savedProduct.getId())
                .toUri();
        return ResponseEntity.created(savedProductUri).body(convertToDto(savedProduct));
    }

    @PutMapping("/product/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product updatedProduct = existingProduct.get();
            updatedProduct.setName(product.getName());
            updatedProduct.setDescription(product.getDescription());
            updatedProduct.setPrice(product.getPrice());
            updatedProduct.setStockQuantity(product.getStockQuantity());
            updatedProduct.setCategory(product.getCategory());
            updatedProduct.setAttributes(product.getAttributes());
            productRepository.save(updatedProduct);
            return ResponseEntity.ok(convertToDto(updatedProduct));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/product/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            productRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
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
