package com.example.findx.dto;

public class ClaimDto {
    private Long lostItemId;
    private Long foundItemId;
    private Long aiMatchId;
    private String uniqueMark;
    private String serialNumber;
    private String purchaseInfo;
    private String additionalInfo;

    public Long getLostItemId() { return lostItemId; }
    public void setLostItemId(Long lostItemId) { this.lostItemId = lostItemId; }
    public Long getFoundItemId() { return foundItemId; }
    public void setFoundItemId(Long foundItemId) { this.foundItemId = foundItemId; }
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
}
