package com.example.findx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lost_item_id")
    private Long lostItemId;

    @Column(name = "found_item_id")
    private Long foundItemId;

    @Column(name = "claimant_id")
    private Long claimantId;

    @Column(name = "ai_match_id")
    private Long aiMatchId;

    @Column(name = "unique_mark", columnDefinition = "TEXT")
    private String uniqueMark;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "purchase_info", columnDefinition = "TEXT")
    private String purchaseInfo;

    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;

    @Column(length = 20)
    private String status; // PENDING, UNDER_REVIEW, VERIFIED, REJECTED, COMPLETED

    @Column(name = "claim_date")
    private LocalDateTime claimDate;

    @Column(name = "review_note", columnDefinition = "TEXT")
    private String reviewNote;

    @Column(name = "reviewed_by", length = 100)
    private String reviewedBy;

    @Column(name = "review_date")
    private LocalDateTime reviewDate;

    // ─── Getters & Setters ───────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLostItemId() { return lostItemId; }
    public void setLostItemId(Long lostItemId) { this.lostItemId = lostItemId; }

    public Long getFoundItemId() { return foundItemId; }
    public void setFoundItemId(Long foundItemId) { this.foundItemId = foundItemId; }

    public Long getClaimantId() { return claimantId; }
    public void setClaimantId(Long claimantId) { this.claimantId = claimantId; }

    public Long getAiMatchId() { return aiMatchId; }
    public void setAiMatchId(Long aiMatchId) { this.aiMatchId = aiMatchId; }

    public String getUniqueMark() { return uniqueMark; }
    public void setUniqueMark(String uniqueMark) { this.uniqueMark = uniqueMark; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getPurchaseInfo() { return purchaseInfo; }
    public void setPurchaseInfo(String purchaseInfo) { this.purchaseInfo = purchaseInfo; }

    public String getAdditionalInfo() { return additionalInfo; }
    public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getClaimDate() { return claimDate; }
    public void setClaimDate(LocalDateTime claimDate) { this.claimDate = claimDate; }

    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewDate() { return reviewDate; }
    public void setReviewDate(LocalDateTime reviewDate) { this.reviewDate = reviewDate; }
}
