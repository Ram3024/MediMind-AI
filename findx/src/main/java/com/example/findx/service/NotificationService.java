package com.example.findx.service;

import com.example.findx.model.Notification;
import com.example.findx.model.LostItem;
import com.example.findx.model.FoundItem;
import com.example.findx.model.AiMatch;
import com.example.findx.repo.NotificationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;

    public void createMatchNotification(Long userId, LostItem lostItem, FoundItem foundItem, AiMatch match) {
        Notification notif = new Notification();
        notif.setUserId(userId);
        notif.setTitle("🎯 AI Match Found!");
        notif.setMessage("Your lost item '" + lostItem.getItemName() + "' has a " +
                         match.getOverallScoreInt() + "% match with a found item: '" +
                         foundItem.getItemName() + "' in " + foundItem.getCity() + ".");
        notif.setType("MATCH_FOUND");
        notif.setRead(false);
        notif.setCreatedAt(LocalDateTime.now());
        notif.setLinkUrl("/matches/detail/" + match.getId());
        notif.setIconClass("bi-robot");
        notificationRepo.save(notif);
    }

    public void createClaimNotification(Long userId, String itemName, String message, String linkUrl) {
        Notification notif = new Notification();
        notif.setUserId(userId);
        notif.setTitle("📋 Claim Update: " + itemName);
        notif.setMessage(message);
        notif.setType("CLAIM_SUBMITTED");
        notif.setRead(false);
        notif.setCreatedAt(LocalDateTime.now());
        notif.setLinkUrl(linkUrl);
        notif.setIconClass("bi-file-check");
        notificationRepo.save(notif);
    }

    public void createGeneralNotification(Long userId, String title, String message, String linkUrl, String icon) {
        Notification notif = new Notification();
        notif.setUserId(userId);
        notif.setTitle(title);
        notif.setMessage(message);
        notif.setType("GENERAL");
        notif.setRead(false);
        notif.setCreatedAt(LocalDateTime.now());
        notif.setLinkUrl(linkUrl != null ? linkUrl : "/notifications");
        notif.setIconClass(icon != null ? icon : "bi-bell");
        notificationRepo.save(notif);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepo.countByUserIdAndReadFalse(userId);
    }

    public void markAllRead(Long userId) {
        List<Notification> unread = notificationRepo.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(unread);
    }

    public void markRead(Long notifId) {
        notificationRepo.findById(notifId).ifPresent(n -> {
            n.setRead(true);
            notificationRepo.save(n);
        });
    }
}
