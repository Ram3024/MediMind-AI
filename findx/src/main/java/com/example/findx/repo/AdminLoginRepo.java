package com.example.findx.repo;

import com.example.findx.model.AdminLogin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminLoginRepo extends JpaRepository<AdminLogin, String> {
    AdminLogin findByAdminidAndPassword(String adminid, String password);
}
