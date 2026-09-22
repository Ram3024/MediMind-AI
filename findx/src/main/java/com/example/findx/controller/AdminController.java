package com.example.findx.controller;

import com.example.findx.model.*;
import com.example.findx.repo.*;
import com.example.findx.service.NotificationService;
import com.example.findx.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired private UserService userService;
    @Autowired private LostItemRepo lostRepo;
    @Autowired private FoundItemRepo foundRepo;
    @Autowired private AiMatchRepo matchRepo;
    @Autowired private ClaimRepo claimRepo;
    @Autowired private NotificationService notifService;
    @Autowired private CategoryRepo categoryRepo;
    @Autowired private AdminLoginRepo adminLoginRepo;
    @Autowired private ContactMessageRepo contactMessageRepo;

    private boolean isAdmin(HttpSession session) {
        return session.getAttribute("admin") != null;
    }

    // ─── Admin Dashboard ──────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public String dashboard(Model model, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) { attrib.addFlashAttribute("error", "Admin login required."); return "redirect:/adminlogin"; }

        long totalUsers     = userService.getUserCount();
        long activeUsers    = userService.getActiveUserCount();
        long onlineUsers    = userService.getOnlineUserCount();
        long totalLost      = lostRepo.count();
        long totalFound     = foundRepo.count();
        long totalMatches   = matchRepo.count();
        long recoveredItems = lostRepo.countByStatus("RECOVERED");
        long pendingClaims  = claimRepo.countByStatus("PENDING");
        long totalClaims    = claimRepo.count();
        long highMatches    = matchRepo.findHighScoreMatches(80.0).size();

        // Recent data for dashboard
        List<LostItem> recentLost   = lostRepo.findAll().stream()
                .sorted((a, b) -> b.getReportDate().compareTo(a.getReportDate())).limit(5).toList();
        List<FoundItem> recentFound = foundRepo.findAll().stream()
                .sorted((a, b) -> b.getReportDate().compareTo(a.getReportDate())).limit(5).toList();
        List<AiMatch> topMatches    = matchRepo.findHighScoreMatches(70.0).stream().limit(5).toList();
        List<Claim> recentClaims    = claimRepo.findByStatus("PENDING").stream().limit(5).toList();

        model.addAttribute("totalUsers", totalUsers);
        model.addAttribute("activeUsers", activeUsers);
        model.addAttribute("onlineUsers", onlineUsers);
        model.addAttribute("totalLost", totalLost);
        model.addAttribute("totalFound", totalFound);
        model.addAttribute("totalMatches", totalMatches);
        model.addAttribute("recoveredItems", recoveredItems);
        model.addAttribute("pendingClaims", pendingClaims);
        model.addAttribute("totalClaims", totalClaims);
        model.addAttribute("highMatches", highMatches);
        model.addAttribute("recentLost", recentLost);
        model.addAttribute("recentFound", recentFound);
        model.addAttribute("topMatches", topMatches);
        model.addAttribute("recentClaims", recentClaims);
        model.addAttribute("admin", session.getAttribute("admin"));
        return "admin/admindash";
    }

    // ─── Manage Users ─────────────────────────────────────────────────────
    @GetMapping("/users")
    public String manageUsers(Model model, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        model.addAttribute("users", userService.getAllUsers());
        model.addAttribute("onlineUsers", userService.getOnlineUserCount());
        model.addAttribute("activeUsers", userService.getActiveUserCount());
        model.addAttribute("admin", session.getAttribute("admin"));
        return "admin/manageusers";
    }

    @GetMapping("/users/block/{id}")
    public String blockUser(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        User user = userService.findById(id);
        if (user != null) {
            user.setStatus("BLOCKED".equals(user.getStatus()) ? "ACTIVE" : "BLOCKED");
            userService.saveUser(user);
            attrib.addFlashAttribute("msg", "User status updated.");
        }
        return "redirect:/admin/users";
    }

    // ─── Manage Lost Items ────────────────────────────────────────────────
    @GetMapping("/lost")
    public String manageLost(Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        model.addAttribute("items", lostRepo.findAll());
        model.addAttribute("admin", session.getAttribute("admin"));
        return "admin/managelost";
    }

    @GetMapping("/lost/delete/{id}")
    public String deleteLost(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        lostRepo.deleteById(id);
        attrib.addFlashAttribute("msg", "Lost item report deleted.");
        return "redirect:/admin/lost";
    }

    // ─── Manage Found Items ───────────────────────────────────────────────
    @GetMapping("/found")
    public String manageFound(Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        model.addAttribute("items", foundRepo.findAll());
        model.addAttribute("admin", session.getAttribute("admin"));
        return "admin/managefound";
    }

    @GetMapping("/found/delete/{id}")
    public String deleteFound(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        foundRepo.deleteById(id);
        attrib.addFlashAttribute("msg", "Found item report deleted.");
        return "redirect:/admin/found";
    }

    // ─── Manage Claims ────────────────────────────────────────────────────
    @GetMapping("/claims")
    public String manageClaims(Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        List<Claim> claims = claimRepo.findAll();
        java.util.Map<Long, LostItem> lostMap = new java.util.HashMap<>();
        java.util.Map<Long, FoundItem> foundMap = new java.util.HashMap<>();
        for (Claim c : claims) {
            lostRepo.findById(c.getLostItemId()).ifPresent(li -> lostMap.put(li.getId(), li));
            foundRepo.findById(c.getFoundItemId()).ifPresent(fi -> foundMap.put(fi.getId(), fi));
        }
        model.addAttribute("claims", claims);
        model.addAttribute("lostMap", lostMap);
        model.addAttribute("foundMap", foundMap);
        model.addAttribute("admin", session.getAttribute("admin"));
        return "admin/manageclaims";
    }

    @GetMapping("/claims/approve/{id}")
    public String approveClaim(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        claimRepo.findById(id).ifPresent(claim -> {
            claim.setStatus("VERIFIED");
            claim.setReviewedBy(((AdminLogin) session.getAttribute("admin")).getName());
            claim.setReviewDate(LocalDateTime.now());
            claim.setReviewNote("Claim approved by admin after verification.");
            claimRepo.save(claim);
            // Mark lost item as RECOVERED
            lostRepo.findById(claim.getLostItemId()).ifPresent(li -> {
                li.setStatus("RECOVERED");
                lostRepo.save(li);
            });
            // Notify claimant
            notifService.createGeneralNotification(claim.getClaimantId(),
                    "✅ Claim Approved!",
                    "Your claim has been verified and approved! Please coordinate with the finder to collect your item.",
                    "/claims/status/" + id, "bi-check-circle-fill");
        });
        attrib.addFlashAttribute("msg", "Claim approved and item marked as recovered!");
        return "redirect:/admin/claims";
    }

    @GetMapping("/claims/reject/{id}")
    public String rejectClaim(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        claimRepo.findById(id).ifPresent(claim -> {
            claim.setStatus("REJECTED");
            claim.setReviewedBy(((AdminLogin) session.getAttribute("admin")).getName());
            claim.setReviewDate(LocalDateTime.now());
            claim.setReviewNote("Claim rejected. Insufficient verification information.");
            claimRepo.save(claim);
            notifService.createGeneralNotification(claim.getClaimantId(),
                    "❌ Claim Rejected",
                    "Your claim was rejected due to insufficient verification details. Please re-submit with more information.",
                    "/claims/status/" + id, "bi-x-circle-fill");
        });
        attrib.addFlashAttribute("msg", "Claim rejected.");
        return "redirect:/admin/claims";
    }

    // ─── Manage AI Matches ────────────────────────────────────────────────
    @GetMapping("/matches")
    public String manageMatches(Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        List<AiMatch> matches = matchRepo.findAll();
        matches.sort((a, b) -> Double.compare(b.getOverallScore(), a.getOverallScore()));
        java.util.Map<Long, LostItem> lostMap = new java.util.HashMap<>();
        java.util.Map<Long, FoundItem> foundMap = new java.util.HashMap<>();
        for (AiMatch m : matches) {
            lostRepo.findById(m.getLostItemId()).ifPresent(li -> lostMap.put(li.getId(), li));
            foundRepo.findById(m.getFoundItemId()).ifPresent(fi -> foundMap.put(fi.getId(), fi));
        }
        model.addAttribute("matches", matches);
        model.addAttribute("lostMap", lostMap);
        model.addAttribute("foundMap", foundMap);
        model.addAttribute("admin", session.getAttribute("admin"));
        return "admin/managematches";
    }

    // ─── Categories ───────────────────────────────────────────────────────
    @GetMapping("/categories")
    public String categories(Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        model.addAttribute("categories", categoryRepo.findAll());
        model.addAttribute("admin", session.getAttribute("admin"));
        return "admin/managecat";
    }

    @PostMapping("/categories/add")
    public String addCategory(@RequestParam String name,
                              @RequestParam(required = false) String iconClass,
                              HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        Category cat = new Category();
        cat.setName(name);
        cat.setIconClass(iconClass != null ? iconClass : "bi-tag");
        categoryRepo.save(cat);
        attrib.addFlashAttribute("msg", "Category added: " + name);
        return "redirect:/admin/categories";
    }

    @GetMapping("/categories/delete/{id}")
    public String deleteCategory(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        categoryRepo.deleteById(id);
        attrib.addFlashAttribute("msg", "Category deleted.");
        return "redirect:/admin/categories";
    }

    // ─── Delete User ──────────────────────────────────────────────────────
    @GetMapping("/users/delete/{id}")
    public String deleteUser(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        userService.deleteById(id);
        attrib.addFlashAttribute("msg", "User deleted successfully.");
        return "redirect:/admin/users";
    }

    // ─── Delete AI Match ──────────────────────────────────────────────────
    @GetMapping("/matches/delete/{id}")
    public String deleteMatch(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        matchRepo.deleteById(id);
        attrib.addFlashAttribute("msg", "AI Match deleted.");
        return "redirect:/admin/matches";
    }

    // ─── Admin Change Password ────────────────────────────────────────────
    @GetMapping("/settings")
    public String adminSettings(Model model, HttpSession session) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        model.addAttribute("admin", session.getAttribute("admin"));
        return "admin/adminsettings";
    }

    @PostMapping("/change-password")
    public String adminChangePassword(@RequestParam String currentPassword,
                                      @RequestParam String newPassword,
                                      @RequestParam String confirmPassword,
                                      HttpSession session,
                                      RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        AdminLogin admin = (AdminLogin) session.getAttribute("admin");
        admin = adminLoginRepo.findById(admin.getAdminid()).orElse(null);
        if (admin == null) return "redirect:/adminlogin";

        if (!admin.getPassword().equals(currentPassword)) {
            attrib.addFlashAttribute("pwdError", "Current password is incorrect.");
            return "redirect:/admin/settings";
        }
        if (!newPassword.equals(confirmPassword)) {
            attrib.addFlashAttribute("pwdError", "New passwords do not match.");
            return "redirect:/admin/settings";
        }
        if (newPassword.length() < 6) {
            attrib.addFlashAttribute("pwdError", "Password must be at least 6 characters.");
            return "redirect:/admin/settings";
        }
        admin.setPassword(newPassword);
        adminLoginRepo.save(admin);
        session.setAttribute("admin", admin);
        attrib.addFlashAttribute("msg", "Admin password changed successfully!");
        return "redirect:/admin/settings";
    }

    // ─── Contact Messages ──────────────────────────────────────────────────
    @GetMapping("/contact-messages")
    public String contactMessages(Model model, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) { attrib.addFlashAttribute("error", "Admin login required."); return "redirect:/adminlogin"; }
        model.addAttribute("messages", contactMessageRepo.findAllByOrderBySubmittedAtDesc());
        model.addAttribute("unreadCount", contactMessageRepo.countByReadFalse());
        return "admin/contactmessages";
    }

    @GetMapping("/contact-messages/read/{id}")
    public String markContactRead(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        contactMessageRepo.findById(id).ifPresent(cm -> {
            cm.setRead(true);
            contactMessageRepo.save(cm);
        });
        return "redirect:/admin/contact-messages";
    }

    @GetMapping("/contact-messages/delete/{id}")
    public String deleteContactMessage(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        if (!isAdmin(session)) return "redirect:/adminlogin";
        contactMessageRepo.deleteById(id);
        attrib.addFlashAttribute("msg", "Message deleted.");
        return "redirect:/admin/contact-messages";
    }
}
