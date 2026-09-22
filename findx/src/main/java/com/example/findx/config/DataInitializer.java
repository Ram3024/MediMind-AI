package com.example.findx.config;

import com.example.findx.model.AdminLogin;
import com.example.findx.model.Category;
import com.example.findx.repo.AdminLoginRepo;
import com.example.findx.repo.CategoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminLoginRepo adminRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Override
    public void run(String... args) throws Exception {
        // Seed default Admin if not exists
        if (adminRepo.count() == 0) {
            AdminLogin admin = new AdminLogin();
            admin.setAdminid("admin");
            admin.setName("Super Admin");
            admin.setPassword("admin123");
            admin.setEmail("admin@findx.in");
            adminRepo.save(admin);
            System.out.println("✅ Initialized default Admin: admin / admin123");
        }

        // Seed default Categories if empty
        if (categoryRepo.count() == 0) {
            List<Category> defaultCategories = List.of(
                createCategory("Electronics", "bi-laptop-fill"),
                createCategory("Mobile Phone", "bi-phone-fill"),
                createCategory("Laptop", "bi-laptop-fill"),
                createCategory("Wallet", "bi-wallet-fill"),
                createCategory("Bag", "bi-bag-fill"),
                createCategory("Backpack", "bi-bag-fill"),
                createCategory("Keys", "bi-key-fill"),
                createCategory("Watch", "bi-watch"),
                createCategory("Jewelry", "bi-gem"),
                createCategory("Documents", "bi-file-earmark-text-fill"),
                createCategory("ID Card", "bi-person-badge-fill"),
                createCategory("Passport", "bi-passport"),
                createCategory("Glasses", "bi-eyeglasses"),
                createCategory("Headphones", "bi-headphones"),
                createCategory("Camera", "bi-camera-fill"),
                createCategory("Bicycle", "bi-bicycle"),
                createCategory("Books", "bi-book-fill"),
                createCategory("Clothes", "bi-bag-heart-fill"),
                createCategory("Toys", "bi-controller"),
                createCategory("Other", "bi-question-circle-fill")
            );
            categoryRepo.saveAll(defaultCategories);
            System.out.println("✅ Initialized 20 default categories");
        }
    }

    private Category createCategory(String name, String icon) {
        Category cat = new Category();
        cat.setName(name);
        cat.setIconClass(icon);
        return cat;
    }
}
