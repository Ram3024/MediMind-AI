package com.example.hrapp.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hrapp.model.AdminLogin;

public interface AdminLoginRepo extends JpaRepository<AdminLogin, String> {

	AdminLogin findByAdminidAndPassword(String adminid, String password);

}
