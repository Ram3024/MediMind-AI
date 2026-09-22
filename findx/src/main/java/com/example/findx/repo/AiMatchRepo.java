package com.example.findx.repo;

import com.example.findx.model.AiMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiMatchRepo extends JpaRepository<AiMatch, Long> {
    List<AiMatch> findByLostItemId(Long lostItemId);
    List<AiMatch> findByFoundItemId(Long foundItemId);
    List<AiMatch> findByStatus(String status);

    @Query("SELECT a FROM AiMatch a WHERE a.lostItemId = :lostItemId ORDER BY a.overallScore DESC")
    List<AiMatch> findByLostItemIdOrderByScoreDesc(@Param("lostItemId") Long lostItemId);

    @Query("SELECT a FROM AiMatch a WHERE a.foundItemId = :foundItemId ORDER BY a.overallScore DESC")
    List<AiMatch> findByFoundItemIdOrderByScoreDesc(@Param("foundItemId") Long foundItemId);

    boolean existsByLostItemIdAndFoundItemId(Long lostItemId, Long foundItemId);
    long countByStatus(String status);

    @Query("SELECT a FROM AiMatch a WHERE a.overallScore >= :minScore ORDER BY a.overallScore DESC")
    List<AiMatch> findHighScoreMatches(@Param("minScore") double minScore);
}
