package com.example.findx.controller;

import com.example.findx.model.*;
import com.example.findx.repo.*;
import com.example.findx.service.FileUploadService;
import com.example.findx.service.NotificationService;
import com.example.findx.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/user")
public class UserController {

    @Autowired private LostItemRepo lostRepo;
    @Autowired private FoundItemRepo foundRepo;
    @Autowired private AiMatchRepo matchRepo;
    @Autowired private ClaimRepo claimRepo;
    @Autowired private NotificationService notifService;
    @Autowired private UserService userService;
    @Autowired private FileUploadService fileService;

    // ─── Dashboard ────────────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public String dashboard(Model model, HttpSession session, RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            attrib.addFlashAttribute("error", "Please login first.");
            return "redirect:/login";
        }

        // Refresh user from DB
        user = userService.findById(user.getId());
        session.setAttribute("user", user);

        // User stats
        List<LostItem> myLostItems  = lostRepo.findByUserId(user.getId());
        List<FoundItem> myFoundItems = foundRepo.findByUserId(user.getId());

        long lostCount     = myLostItems.size();
        long foundCount    = myFoundItems.size();
        long recoveredCount = myLostItems.stream().filter(i -> "RECOVERED".equals(i.getStatus())).count();
        long pendingClaims = claimRepo.countByClaimantId(user.getId());

        // AI Matches for user's lost items
        List<AiMatch> recentMatches = new java.util.ArrayList<>();
        for (LostItem li : myLostItems) {
            List<AiMatch> matches = matchRepo.findByLostItemIdOrderByScoreDesc(li.getId());
            recentMatches.addAll(matches);
        }
        recentMatches.sort((a, b) -> Double.compare(b.getOverallScore(), a.getOverallScore()));
        List<AiMatch> topMatches = recentMatches.stream().limit(5).toList();

        long unreadNotifications = notifService.getUnreadCount(user.getId());

        model.addAttribute("user", user);
        model.addAttribute("lostCount", lostCount);
        model.addAttribute("foundCount", foundCount);
        model.addAttribute("recoveredCount", recoveredCount);
        model.addAttribute("pendingClaims", pendingClaims);
        model.addAttribute("unreadNotifications", unreadNotifications);
        model.addAttribute("topMatches", topMatches);
        model.addAttribute("myLostItems", myLostItems.stream().limit(5).toList());
        model.addAttribute("myFoundItems", myFoundItems.stream().limit(5).toList());

        // Build match map for display (lostItemId -> LostItem)
        java.util.Map<Long, LostItem> lostItemMap = new java.util.HashMap<>();
        java.util.Map<Long, FoundItem> foundItemMap = new java.util.HashMap<>();
        for (AiMatch m : topMatches) {
            lostRepo.findById(m.getLostItemId()).ifPresent(li -> lostItemMap.put(li.getId(), li));
            foundRepo.findById(m.getFoundItemId()).ifPresent(fi -> foundItemMap.put(fi.getId(), fi));
        }
        model.addAttribute("lostItemMap", lostItemMap);
        model.addAttribute("foundItemMap", foundItemMap);

        return "dashboard";
    }

    // ─── Profile ──────────────────────────────────────────────────────────
    @GetMapping("/profile")
    public String profile(Model model, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";
        user = userService.findById(user.getId());
        model.addAttribute("user", user);
        return "profile";
    }

    @PostMapping("/profile/update")
    public String updateProfile(@RequestParam String name,
                                @RequestParam String phone,
                                @RequestParam String city,
                                @RequestParam String address,
                                HttpSession session,
                                RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";
        user = userService.findById(user.getId());
        user.setName(name);
        user.setPhone(phone);
        user.setCity(city);
        user.setAddress(address);
        userService.saveUser(user);
        session.setAttribute("user", user);
        attrib.addFlashAttribute("msg", "Profile updated successfully!");
        return "redirect:/user/profile";
    }

    // ─── Profile Photo Upload ─────────────────────────────────────────────
    @PostMapping("/profile/upload-pic")
    public String uploadProfilePic(@RequestParam("profilePic") MultipartFile file,
                                   HttpSession session,
                                   RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";
        try {
            if (file == null || file.isEmpty()) {
                attrib.addFlashAttribute("error", "Please select an image file.");
                return "redirect:/user/profile";
            }
            String fileName = fileService.uploadFile(file);
            user = userService.findById(user.getId());

            // Delete old profile pic if exists
            if (user.getProfilePic() != null && !user.getProfilePic().isEmpty()) {
                fileService.deleteFile(user.getProfilePic());
            }
            user.setProfilePic(fileName);
            userService.saveUser(user);
            session.setAttribute("user", user);
            attrib.addFlashAttribute("msg", "Profile photo updated!");
        } catch (Exception e) {
            attrib.addFlashAttribute("error", "Photo upload failed: " + e.getMessage());
        }
        return "redirect:/user/profile";
    }

    // ─── Change Password ──────────────────────────────────────────────────
    @PostMapping("/change-password")
    public String changePassword(@RequestParam String currentPassword,
                                 @RequestParam String newPassword,
                                 @RequestParam String confirmPassword,
                                 HttpSession session,
                                 RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";
        user = userService.findById(user.getId());

        if (!userService.checkPassword(currentPassword, user.getPassword())) {
            attrib.addFlashAttribute("pwdError", "Current password is incorrect.");
            return "redirect:/user/profile";
        }
        if (!newPassword.equals(confirmPassword)) {
            attrib.addFlashAttribute("pwdError", "New passwords do not match.");
            return "redirect:/user/profile";
        }
        if (newPassword.length() < 6) {
            attrib.addFlashAttribute("pwdError", "New password must be at least 6 characters.");
            return "redirect:/user/profile";
        }
        user.setPassword(userService.encodePassword(newPassword));
        userService.saveUser(user);
        session.setAttribute("user", user);
        attrib.addFlashAttribute("msg", "Password changed successfully!");
        return "redirect:/user/profile";
    }

    // ─── Delete Own Lost Item ─────────────────────────────────────────────
    @PostMapping("/lost/delete/{id}")
    public String deleteOwnLostItem(@PathVariable Long id,
                                    HttpSession session,
                                    RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";

        LostItem item = lostRepo.findById(id).orElse(null);
        if (item != null && item.getUserId().equals(user.getId())) {
            lostRepo.delete(item);
            attrib.addFlashAttribute("msg", "Lost item report deleted.");
        } else {
            attrib.addFlashAttribute("error", "Item not found or access denied.");
        }
        return "redirect:/user/dashboard";
    }

    // ─── Delete Own Found Item ────────────────────────────────────────────
    @PostMapping("/found/delete/{id}")
    public String deleteOwnFoundItem(@PathVariable Long id,
                                     HttpSession session,
                                     RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";

        FoundItem item = foundRepo.findById(id).orElse(null);
        if (item != null && item.getUserId().equals(user.getId())) {
            foundRepo.delete(item);
            attrib.addFlashAttribute("msg", "Found item report deleted.");
        } else {
            attrib.addFlashAttribute("error", "Item not found or access denied.");
        }
        return "redirect:/user/dashboard";
    }
}
