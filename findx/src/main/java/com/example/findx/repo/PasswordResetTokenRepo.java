package com.example.findx.repo;

import com.example.findx.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PasswordResetTokenRepo extends JpaRepository<PasswordResetToken, Long> {
    PasswordResetToken findByToken(String token);

    @Transactional
    void deleteByUserId(Long userId);
}
