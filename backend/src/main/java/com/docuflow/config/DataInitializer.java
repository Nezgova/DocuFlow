package com.docuflow.config;

import com.docuflow.entity.*;
import com.docuflow.repository.CategoryRepository;
import com.docuflow.repository.DepartmentRepository;
import com.docuflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Configuration
public class DataInitializer {
  @Bean
  CommandLineRunner seedData(UserRepository users, DepartmentRepository departments, CategoryRepository categories, PasswordEncoder encoder,
                             @Value("${SEED_ADMIN_EMAIL:}") String email,
                             @Value("${SEED_ADMIN_PASSWORD:}") String password) {
    return args -> {
      if (departments.count() == 0) {
        departments.saveAll(List.of(
          new Department("Human Resources", "Personnel management, recruitment, and employee relations"),
          new Department("Finance", "Accounting, budgeting, and financial reporting"),
          new Department("Legal", "Contracts, compliance, and regulatory matters"),
          new Department("IT", "Information technology, systems, and security"),
          new Department("Marketing", "Brand management, advertising, and communications")
        ));
      }

      if (categories.count() == 0) {
        categories.saveAll(List.of(
          new Category("Contract", "Legal agreements and binding contracts"),
          new Category("Invoice", "Billing, invoices, and financial payment requests"),
          new Category("Policy", "Company policies, handbooks, and guidelines"),
          new Category("Report", "Business, performance, and audit reports"),
          new Category("Meeting Minutes", "Official notes and minutes from meetings"),
          new Category("Purchase Order", "Procurement and purchase order documents"),
          new Category("Internship Convention", "Student internship agreements and conventions"),
          new Category("Technical Documentation", "Technical specifications, architectures, and manuals")
        ));
      }

      Department defaultDept = departments.findAll().stream().findFirst().orElse(null);

      if (!email.isBlank() && !password.isBlank() && !users.existsByEmailIgnoreCase(email)) {
        users.save(new User("System Administrator", email, encoder.encode(password), Role.ADMINISTRATOR, defaultDept));
      }

      users.findAll().forEach(u -> {
        if (u.getDepartment() == null && defaultDept != null) {
          u.setDepartment(defaultDept);
          users.save(u);
        }
      });
    };
  }
}
