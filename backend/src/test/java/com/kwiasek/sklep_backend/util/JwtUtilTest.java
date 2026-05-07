package com.kwiasek.sklep_backend.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secret = "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTA=";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
        jwtUtil.init();
    }

    @Test
    void shouldGenerateAccessToken() {
        UserDetails userDetails = new User("testuser", "password", new ArrayList<>());
        String token = jwtUtil.generateAccessToken(userDetails);

        assertThat(token).isNotNull();
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("testuser");
    }

    @Test
    void shouldGenerateRefreshToken() {
        UserDetails userDetails = new User("testuser", "password", new ArrayList<>());
        String token = jwtUtil.generateRefreshToken(userDetails);

        assertThat(token).isNotNull();
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("testuser");
    }

    @Test
    void shouldValidateCorrectToken() {
        UserDetails userDetails = new User("testuser", "password", new ArrayList<>());
        String token = jwtUtil.generateAccessToken(userDetails);

        assertThat(jwtUtil.validateToken(token, userDetails)).isTrue();
    }

    @Test
    void shouldNotValidateTokenForDifferentUser() {
        UserDetails userDetails = new User("testuser", "password", new ArrayList<>());
        UserDetails otherUser = new User("otheruser", "password", new ArrayList<>());
        String token = jwtUtil.generateAccessToken(userDetails);

        assertThat(jwtUtil.validateToken(token, otherUser)).isFalse();
    }

    @Test
    void shouldExtractExpirationDate() {
        UserDetails userDetails = new User("testuser", "password", new ArrayList<>());
        String token = jwtUtil.generateAccessToken(userDetails);
        Date expiration = jwtUtil.extractExpiration(token);

        assertThat(expiration).isAfter(new Date());
    }
}
