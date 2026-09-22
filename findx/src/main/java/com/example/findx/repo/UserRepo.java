package com.example.findx.repo;

import com.example.findx.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    User findByEmail(String email);
    User findByEmailIgnoreCase(String email);
    User findByEmailAndPassword(String email, String password);
    List<User> findByRole(String role);
    List<User> findByStatus(String status);
    long countByRole(String role);
    long countByStatus(String status);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByLastActiveAfter(java.time.LocalDateTime threshold);
    List<User> findByLastActiveAfterOrderByLastActiveDesc(java.time.LocalDateTime threshold);
}
