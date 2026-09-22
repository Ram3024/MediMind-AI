package com.example.findx.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ai_matches")
public class AiMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lost_item_id")
    private Long lostItemId;

    @Column(name = "found_item_id")
    private Long foundItemId;

    // Individual factor scores (0-100)
    @Column(name = "text_score")
    private double textScore;

    @Column(name = "category_score")
    private double categoryScore;

    @Column(name = "brand_score")
    private double brandScore;

    @Column(name = "color_score")
    private double colorScore;

    @Column(name = "location_score")
    private double locationScore;

    @Column(name = "date_score")
    private double dateScore;

    @Column(name = "image_score")
    private double imageScore;

    @Column(name = "overall_score")
    private double overallScore;

    @Column(length = 20)
    private String status; // PENDING, NOTIFIED, CLAIMED, REJECTED

    @Column(name = "created_at", length = 30)
    private String createdAt;

    // AI Explainability flags
    @Column(name = "text_match_label", length = 20)
    private String textMatchLabel;    // LOW, MEDIUM, HIGH, VERY HIGH

    @Column(name = "location_match_label", length = 20)
    private String locationMatchLabel;

    @Column(name = "date_match_label", length = 20)
    private String dateMatchLabel;

    // ─── Getters & Setters ───────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLostItemId() { return lostItemId; }
    public void setLostItemId(Long lostItemId) { this.lostItemId = lostItemId; }

    public Long getFoundItemId() { return foundItemId; }
    public void setFoundItemId(Long foundItemId) { this.foundItemId = foundItemId; }

    public double getTextScore() { return textScore; }
    public void setTextScore(double textScore) { this.textScore = textScore; }

    public double getCategoryScore() { return categoryScore; }
    public void setCategoryScore(double categoryScore) { this.categoryScore = categoryScore; }

    public double getBrandScore() { return brandScore; }
    public void setBrandScore(double brandScore) { this.brandScore = brandScore; }

    public double getColorScore() { return colorScore; }
    public void setColorScore(double colorScore) { this.colorScore = colorScore; }

    public double getLocationScore() { return locationScore; }
    public void setLocationScore(double locationScore) { this.locationScore = locationScore; }

    public double getDateScore() { return dateScore; }
    public void setDateScore(double dateScore) { this.dateScore = dateScore; }

    public double getImageScore() { return imageScore; }
    public void setImageScore(double imageScore) { this.imageScore = imageScore; }

    public double getOverallScore() { return overallScore; }
    public void setOverallScore(double overallScore) { this.overallScore = overallScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getTextMatchLabel() { return textMatchLabel; }
    public void setTextMatchLabel(String textMatchLabel) { this.textMatchLabel = textMatchLabel; }

    public String getLocationMatchLabel() { return locationMatchLabel; }
    public void setLocationMatchLabel(String locationMatchLabel) { this.locationMatchLabel = locationMatchLabel; }

    public String getDateMatchLabel() { return dateMatchLabel; }
    public void setDateMatchLabel(String dateMatchLabel) { this.dateMatchLabel = dateMatchLabel; }

    // Overall score as int for display
    public int getOverallScoreInt() {
        return (int) Math.round(overallScore);
    }
    public int getTextScoreInt() { return (int) Math.round(textScore); }
    public int getCategoryScoreInt() { return (int) Math.round(categoryScore); }
    public int getBrandScoreInt() { return (int) Math.round(brandScore); }
    public int getColorScoreInt() { return (int) Math.round(colorScore); }
    public int getLocationScoreInt() { return (int) Math.round(locationScore); }
    public int getDateScoreInt() { return (int) Math.round(dateScore); }
    public int getImageScoreInt() { return (int) Math.round(imageScore); }
}
