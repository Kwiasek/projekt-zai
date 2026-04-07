package com.kwiasek.sklep_backend.controller;

import com.kwiasek.sklep_backend.dto.AuthenticationRequest;
import com.kwiasek.sklep_backend.model.User;
import com.kwiasek.sklep_backend.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldRegisterNewUserSuccessfully() throws Exception {
        User user = new User();
        user.setUsername("test");
        user.setPassword("TrudneHaslo123!");
        user.setRole(UserRole.ROLE_USER);

        mockMvc.perform(post("/api/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user))
                ).andExpect(status().isOk());
    }

    @Test
    void shouldLoginAndReturnJwtToken() throws Exception {
        User user = new User();
        user.setUsername("test");
        user.setPassword("TrudneHaslo123!");
        user.setRole(UserRole.ROLE_USER);

        mockMvc.perform(post("/api/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)));

        AuthenticationRequest request = new AuthenticationRequest();
        request.setUsername("test");
        request.setPassword("TrudneHaslo123!");

        var result = mockMvc.perform(post("/api/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        String token = result.getResponse().getContentAsString();

        assertThat(token).isNotNull();

        assertThat(token).startsWith("eyJ");
    }

    @Test
    void shouldNotRegisterExistingUserSuccessfully() throws Exception {
        User user = new User();
        user.setUsername("test");
        user.setPassword("TrudneHaslo123!");
        user.setRole(UserRole.ROLE_USER);

        mockMvc.perform(post("/api/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk());

        var result = mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                        .andExpect(status().isConflict())
                        .andReturn();

        String message = result.getResponse().getContentAsString();
        assertThat(message).isNotNull();
        assertThat(message).isEqualTo("Error: User already exists.");
    }

    @Test
    void shouldNotLoginUserWithWrongCredentials() throws Exception {
        User user = new User();
        user.setUsername("test");
        user.setPassword("TrudneHaslo123!");
        user.setRole(UserRole.ROLE_USER);

        mockMvc.perform(post("/api/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)));

        AuthenticationRequest request = new AuthenticationRequest();
        request.setUsername("test");
        request.setPassword("ZleHaslo123!");

        var result = mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andReturn();

        String message = result.getResponse().getContentAsString();

        assertThat(message).isNotNull();

        assertThat(message).isEqualTo("Error: Invalid username or password.");
    }
}
