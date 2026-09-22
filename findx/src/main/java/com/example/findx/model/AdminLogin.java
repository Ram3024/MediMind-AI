package com.example.findx.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admin_login")
public class AdminLogin {

    @Id
    @Column(name = "adminid", length = 50)
    private String adminid;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(length = 100)
    private String name;

    @Column(length = 100)
    private String email;

    // ─── Getters & Setters ───────────────────────────────────────────────

    public String getAdminid() { return adminid; }
    public void setAdminid(String adminid) { this.adminid = adminid; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
