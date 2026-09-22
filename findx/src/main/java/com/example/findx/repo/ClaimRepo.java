package com.example.findx.repo;

import com.example.findx.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaimRepo extends JpaRepository<Claim, Long> {
    List<Claim> findByClaimantId(Long claimantId);
    List<Claim> findByLostItemId(Long lostItemId);
    List<Claim> findByFoundItemId(Long foundItemId);
    List<Claim> findByStatus(String status);
    long countByStatus(String status);
    long countByClaimantId(Long claimantId);
    boolean existsByLostItemIdAndClaimantId(Long lostItemId, Long claimantId);
}
