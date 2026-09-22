package com.example.findx.repo;

import com.example.findx.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContactMessageRepo extends JpaRepository<ContactMessage, Long> {
    List<ContactMessage> findAllByOrderBySubmittedAtDesc();
    long countByReadFalse();
}
