package com.example.findx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lost_items")
public class LostItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "item_name", length = 150, nullable = false)
    private String itemName;

    @Column(length = 100)
    private String category;

    @Column(name = "sub_category", length = 100)
    private String subCategory;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String model;

    @Column(length = 60)
    private String color;

    @Column(name = "unique_features", columnDefinition = "TEXT")
    private String uniqueFeatures;

    @Column(length = 1000) // comma-separated image filenames
    private String images;

    @Column(name = "lost_location", length = 300)
    private String lostLocation;

    @Column(length = 100)
    private String city;

    @Column(length = 20)
    private String latitude;

    @Column(length = 20)
    private String longitude;

    @Column(name = "lost_date", length = 20)
    private String lostDate;

    @Column(name = "lost_time", length = 20)
    private String lostTime;

    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;

    @Column(length = 20)
    private String status; // ACTIVE, MATCHED, RECOVERED, CLOSED

    @Column(name = "report_date")
    private LocalDateTime reportDate;

    @Column(name = "match_count")
    private int matchCount;

    // ─── Getters & Setters ───────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getUniqueFeatures() { return uniqueFeatures; }
    public void setUniqueFeatures(String uniqueFeatures) { this.uniqueFeatures = uniqueFeatures; }

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public String getLostLocation() { return lostLocation; }
    public void setLostLocation(String lostLocation) { this.lostLocation = lostLocation; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLatitude() { return latitude; }
    public void setLatitude(String latitude) { this.latitude = latitude; }

    public String getLongitude() { return longitude; }
    public void setLongitude(String longitude) { this.longitude = longitude; }

    public String getLostDate() { return lostDate; }
    public void setLostDate(String lostDate) { this.lostDate = lostDate; }

    public String getLostTime() { return lostTime; }
    public void setLostTime(String lostTime) { this.lostTime = lostTime; }

    public String getAdditionalInfo() { return additionalInfo; }
    public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getReportDate() { return reportDate; }
    public void setReportDate(LocalDateTime reportDate) { this.reportDate = reportDate; }

    public int getMatchCount() { return matchCount; }
    public void setMatchCount(int matchCount) { this.matchCount = matchCount; }

    // Helper: first image
    public String getFirstImage() {
        if (images != null && !images.isEmpty()) {
            return images.split(",")[0].trim();
        }
        return null;
    }
}
