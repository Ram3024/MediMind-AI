package com.example.findx.repo;

import com.example.findx.model.FoundItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoundItemRepo extends JpaRepository<FoundItem, Long> {
    List<FoundItem> findByUserId(Long userId);
    List<FoundItem> findByStatus(String status);
    List<FoundItem> findByCategory(String category);
    List<FoundItem> findByCity(String city);

    @Query("SELECT f FROM FoundItem f WHERE " +
           "(:keyword IS NULL OR LOWER(f.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:category IS NULL OR f.category = :category) AND " +
           "(:city IS NULL OR LOWER(f.city) LIKE LOWER(CONCAT('%', :city, '%')))")
    List<FoundItem> searchFoundItems(@Param("keyword") String keyword,
                                     @Param("category") String category,
                                     @Param("city") String city);

    long countByStatus(String status);
    long countByUserId(Long userId);

    @Query("SELECT f FROM FoundItem f WHERE f.status = 'ACTIVE' ORDER BY f.reportDate DESC")
    List<FoundItem> findRecentActive();
}
