package com.example.findx.service;

import com.example.findx.model.User;
import com.example.findx.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public boolean checkPassword(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) return false;
        if (rawPassword.equals(encodedPassword)) return true;
        try {
            return passwordEncoder.matches(rawPassword, encodedPassword);
        } catch (Exception e) {
            return false;
        }
    }

    public User findByEmail(String email) {
        if (email == null || email.trim().isEmpty()) return null;
        return userRepo.findByEmailIgnoreCase(email.trim());
    }

    public boolean emailExists(String email) {
        if (email == null || email.trim().isEmpty()) return false;
        return userRepo.existsByEmailIgnoreCase(email.trim());
    }

    public User saveUser(User user) {
        return userRepo.save(user);
    }

    public User findById(Long id) {
        return userRepo.findById(id).orElse(null);
    }

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public List<User> getUsersByStatus(String status) {
        return userRepo.findByStatus(status);
    }

    public long getUserCount() {
        return userRepo.count();
    }

    public long getActiveUserCount() {
        return userRepo.countByStatus("ACTIVE");
    }

    public long getOnlineUserCount() {
        return userRepo.countByLastActiveAfter(java.time.LocalDateTime.now().minusMinutes(5));
    }

    public User updateLastActive(User user) {
        if (user == null || user.getId() == null) return user;
        user.setLastActive(java.time.LocalDateTime.now());
        return userRepo.save(user);
    }

    public void updateLastActiveById(Long id) {
        if (id == null) return;
        userRepo.findById(id).ifPresent(u -> {
            u.setLastActive(java.time.LocalDateTime.now());
            userRepo.save(u);
        });
    }

    public void deleteById(Long id) {
        userRepo.deleteById(id);
    }
}
