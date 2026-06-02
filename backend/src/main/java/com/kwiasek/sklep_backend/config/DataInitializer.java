package com.kwiasek.sklep_backend.config;

import com.kwiasek.sklep_backend.model.User;
import com.kwiasek.sklep_backend.model.UserDetails;
import com.kwiasek.sklep_backend.model.UserRole;
import com.kwiasek.sklep_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ROLE_ADMIN);

            UserDetails details = new UserDetails();
            details.setFirstName("Admin");
            details.setLastName("User");
            details.setEmail("admin@example.com");
            details.setUser(admin);
            admin.setUserDetails(details);

            userRepository.save(admin);
            System.out.println("Default admin account created: admin/admin123");
        }
    }
}
