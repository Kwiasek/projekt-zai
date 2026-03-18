package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.model.User;
import com.kwiasek.sklep_backend.model.UserDetails;
import com.kwiasek.sklep_backend.repository.UserDetailsRepository;
import com.kwiasek.sklep_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

    @GetMapping("/user")
    public ResponseEntity<User> getUser(Principal principal) {
        // principal.getName() returns the username extracted from the JWT
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(user);
    }

    @PutMapping("/user/details")
    public ResponseEntity<UserDetails> updateUserDetails(@RequestBody UserDetails userDetails, Principal principal) {
        User user = userRepository.findByUsername(principal.getName());

        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        UserDetails existingDetails = user.getUserDetails();
        if (existingDetails != null) {
            existingDetails.setFirstName(userDetails.getFirstName());
            existingDetails.setLastName(userDetails.getLastName());
            existingDetails.setPhoneNumber(userDetails.getPhoneNumber());
            existingDetails.setEmail(userDetails.getEmail());
            existingDetails.setBirthDate(userDetails.getBirthDate());
            userDetailsRepository.save(existingDetails);
            return ResponseEntity.ok(existingDetails);
        } else {
            userDetails.setUser(user);
            // In a @MapsId one-to-one relationship, the child gets its ID from the parent.
            // When we receive userDetails from the request, its ID might be 0 or null.
            // By setting the user, Hibernate should normally handle the ID mapping, but
            // setting it explicitly ensures consistency before saving.
            userDetails.setId(user.getId());
            user.setUserDetails(userDetails);
            userRepository.save(user); // Saving the parent cascades to the child
            return ResponseEntity.ok(userDetails);
        }
    }
}
