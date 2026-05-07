package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.model.Category;
import com.kwiasek.sklep_backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/category/{id}")
    public ResponseEntity<Category> getCategory(@PathVariable Long id) {
        Optional<Category> category = categoryRepository.findById(id);
        return category.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/category")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> addCategory(@RequestBody Category category) {
        Category savedCategory = categoryRepository.save(category);
        URI savedCategoryUri = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(savedCategory.getId())
                .toUri();
        return ResponseEntity.created(savedCategoryUri).body(savedCategory);
    }

    @PutMapping("/category/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        Optional<Category> existingCategory = categoryRepository.findById(id);
        if (existingCategory.isPresent()) {
            Category updatedCategory = existingCategory.get();
            updatedCategory.setName(category.getName());
            updatedCategory.setDescription(category.getDescription());
            categoryRepository.save(updatedCategory);
            return ResponseEntity.ok(updatedCategory);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/category/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        Optional<Category> category = categoryRepository.findById(id);
        if (category.isPresent()) {
            categoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
