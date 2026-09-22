package com.example.findx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(length = 100, nullable = false, unique = true)
    private String email;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(length = 15)
    private String phone;

    @Column(length = 10)
    private String gender;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 10)
    private String role; // USER, ADMIN

    @Column(length = 15)
    private String status; // ACTIVE, BLOCKED, SUSPENDED

    @Column(name = "reg_date")
    private LocalDateTime regDate;

    @Column(name = "profile_pic", length = 255)
    private String profilePic;

    @Column(name = "is_email_verified")
    private boolean emailVerified;

    @Column(name = "otp", length = 10)
    private String otp;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    @Column(name = "lost_count")
    private int lostCount;

    @Column(name = "found_count")
    private int foundCount;

    @Column(name = "recovered_count")
    private int recoveredCount;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    public boolean isOnline() {
        if (lastActive == null) return false;
        return lastActive.isAfter(LocalDateTime.now().minusMinutes(5));
    }

    public String getLastActiveFormatted() {
        if (lastActive == null) return "Never";
        LocalDateTime now = LocalDateTime.now();
        java.time.Duration diff = java.time.Duration.between(lastActive, now);
        long seconds = diff.getSeconds();
        if (seconds < 60) return "Just now";
        long minutes = diff.toMinutes();
        if (minutes < 60) return minutes + " min" + (minutes > 1 ? "s" : "") + " ago";
        long hours = diff.toHours();
        if (hours < 24) return hours + " hr" + (hours > 1 ? "s" : "") + " ago";
        long days = diff.toDays();
        if (days == 1) return "Yesterday";
        if (days < 7) return days + " days ago";
        return lastActive.format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
    }

    public String getRegDateFormatted() {
        if (regDate == null) return "N/A";
        return regDate.format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy"));
    }

    public LocalDateTime getLastActive() { return lastActive; }
    public void setLastActive(LocalDateTime lastActive) { this.lastActive = lastActive; }

    // ─── Getters & Setters ───────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRegDate() { return regDate; }
    public void setRegDate(LocalDateTime regDate) { this.regDate = regDate; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public LocalDateTime getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }

    public int getLostCount() { return lostCount; }
    public void setLostCount(int lostCount) { this.lostCount = lostCount; }

    public int getFoundCount() { return foundCount; }
    public void setFoundCount(int foundCount) { this.foundCount = foundCount; }

    public int getRecoveredCount() { return recoveredCount; }
    public void setRecoveredCount(int recoveredCount) { this.recoveredCount = recoveredCount; }
}
