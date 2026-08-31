package com.docuflow.config;

import com.docuflow.entity.*;
import com.docuflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Creates a development administrator only when explicit seed credentials are provided. */
@Configuration
public class DataInitializer {
  @Bean CommandLineRunner seedAdmin(UserRepository users, PasswordEncoder encoder, @Value("${SEED_ADMIN_EMAIL:}") String email, @Value("${SEED_ADMIN_PASSWORD:}") String password) { return args -> { if(!email.isBlank() && !password.isBlank() && !users.existsByEmailIgnoreCase(email)) users.save(new User("System Administrator",email,encoder.encode(password),Role.ADMINISTRATOR)); }; }
}
