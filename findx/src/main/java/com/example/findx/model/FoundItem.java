package com.example.findx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "found_items")
public class FoundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "item_name", length = 150, nullable = false)
    private String itemName;

    @Column(length = 100)
    private String category;

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

    @Column(length = 1000)
    private String images; // comma-separated filenames

    @Column(name = "found_location", length = 300)
    private String foundLocation;

    @Column(length = 100)
    private String city;

    @Column(length = 20)
    private String latitude;

    @Column(length = 20)
    private String longitude;

    @Column(name = "found_date", length = 20)
    private String foundDate;

    @Column(name = "found_time", length = 20)
    private String foundTime;

    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;

    @Column(length = 20)
    private String status; // ACTIVE, CLAIMED, RETURNED, CLOSED

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

    public String getFoundLocation() { return foundLocation; }
    public void setFoundLocation(String foundLocation) { this.foundLocation = foundLocation; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLatitude() { return latitude; }
    public void setLatitude(String latitude) { this.latitude = latitude; }

    public String getLongitude() { return longitude; }
    public void setLongitude(String longitude) { this.longitude = longitude; }

    public String getFoundDate() { return foundDate; }
    public void setFoundDate(String foundDate) { this.foundDate = foundDate; }

    public String getFoundTime() { return foundTime; }
    public void setFoundTime(String foundTime) { this.foundTime = foundTime; }

    public String getAdditionalInfo() { return additionalInfo; }
    public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getReportDate() { return reportDate; }
    public void setReportDate(LocalDateTime reportDate) { this.reportDate = reportDate; }

    public int getMatchCount() { return matchCount; }
    public void setMatchCount(int matchCount) { this.matchCount = matchCount; }

    public String getFirstImage() {
        if (images != null && !images.isEmpty()) {
            return images.split(",")[0].trim();
        }
        return null;
    }
}
