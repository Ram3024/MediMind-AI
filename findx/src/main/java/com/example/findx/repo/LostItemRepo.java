package com.example.findx.repo;

import com.example.findx.model.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LostItemRepo extends JpaRepository<LostItem, Long> {
    List<LostItem> findByUserId(Long userId);
    List<LostItem> findByStatus(String status);
    List<LostItem> findByCategory(String category);
    List<LostItem> findByCity(String city);

    @Query("SELECT l FROM LostItem l WHERE " +
           "(:keyword IS NULL OR LOWER(l.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:category IS NULL OR l.category = :category) AND " +
           "(:city IS NULL OR LOWER(l.city) LIKE LOWER(CONCAT('%', :city, '%')))")
    List<LostItem> searchLostItems(@Param("keyword") String keyword,
                                   @Param("category") String category,
                                   @Param("city") String city);

    long countByStatus(String status);
    long countByUserId(Long userId);

    @Query("SELECT l FROM LostItem l WHERE l.status = 'ACTIVE' ORDER BY l.reportDate DESC")
    List<LostItem> findRecentActive();
}
