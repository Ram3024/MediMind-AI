package com.example.findx.controller;

import com.example.findx.dto.UserDto;
import com.example.findx.model.*;
import com.example.findx.repo.*;
import com.example.findx.service.EmailService;
import com.example.findx.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Controller
public class MainController {

    @Autowired private UserService userService;
    @Autowired private AdminLoginRepo adminLoginRepo;
    @Autowired private LostItemRepo lostItemRepo;
    @Autowired private FoundItemRepo foundItemRepo;
    @Autowired private PasswordResetTokenRepo tokenRepo;
    @Autowired private ContactMessageRepo contactMessageRepo;
    @Autowired private EmailService emailService;

    // ─── Home / Landing Page ─────────────────────────────────────────────
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("lostCount",  lostItemRepo.count());
        model.addAttribute("foundCount", foundItemRepo.count());
        model.addAttribute("recoveredCount", lostItemRepo.countByStatus("RECOVERED"));
        model.addAttribute("recentLost",  lostItemRepo.findRecentActive());
        model.addAttribute("recentFound", foundItemRepo.findRecentActive());
        return "index";
    }

    // ─── User Registration ────────────────────────────────────────────────
    @GetMapping("/register")
    public String showRegister(Model model, HttpSession session) {
        if (session.getAttribute("user") != null) return "redirect:/user/dashboard";
        model.addAttribute("udto", new UserDto());
        return "register";
    }

    @PostMapping("/register")
    public String saveUser(@ModelAttribute UserDto udto, HttpSession session, RedirectAttributes attrib) {
        if (userService.emailExists(udto.getEmail())) {
            attrib.addFlashAttribute("error", "Email already registered. Please login.");
            return "redirect:/register";
        }
        if (!udto.getPassword().equals(udto.getConfirmPassword())) {
            attrib.addFlashAttribute("error", "Passwords do not match.");
            return "redirect:/register";
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        User user = new User();
        user.setName(udto.getName());
        user.setEmail(udto.getEmail());
        user.setPassword(userService.encodePassword(udto.getPassword()));
        user.setPhone(udto.getPhone());
        user.setGender(udto.getGender());
        user.setCity(udto.getCity());
        user.setAddress(udto.getAddress());
        user.setRole("USER");
        user.setStatus("ACTIVE");
        user.setEmailVerified(false);
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        user.setRegDate(LocalDateTime.now());
        userService.saveUser(user);

        // Send OTP via real email
        emailService.sendOtpEmail(udto.getEmail(), udto.getName(), otp);

        session.setAttribute("pendingVerifyEmail", udto.getEmail());
        attrib.addFlashAttribute("msg", "Registration successful! Please check your email for the OTP.");
        return "redirect:/verify-email";
    }

    // ─── Email OTP Verification ───────────────────────────────────────────
    @GetMapping("/verify-email")
    public String showVerifyEmail(HttpSession session) {
        if (session.getAttribute("pendingVerifyEmail") == null) return "redirect:/register";
        return "verify-email";
    }

    @PostMapping("/verify-email")
    public String verifyEmail(@RequestParam String otp, HttpSession session, RedirectAttributes attrib) {
        String email = (String) session.getAttribute("pendingVerifyEmail");
        if (email == null) return "redirect:/register";

        User user = userService.findByEmail(email);
        if (user == null) {
            attrib.addFlashAttribute("error", "User not found.");
            return "redirect:/verify-email";
        }
        if (user.getOtp() == null || !user.getOtp().equals(otp.trim())) {
            attrib.addFlashAttribute("error", "Invalid OTP. Please try again.");
            return "redirect:/verify-email";
        }
        if (user.getOtpExpiry() != null && LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            attrib.addFlashAttribute("error", "OTP expired. Please register again.");
            return "redirect:/verify-email";
        }
        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userService.saveUser(user);
        session.removeAttribute("pendingVerifyEmail");

        attrib.addFlashAttribute("msg", "Email verified! Please login.");
        return "redirect:/login";
    }

    @PostMapping("/resend-otp")
    public String resendOtp(HttpSession session, RedirectAttributes attrib) {
        String email = (String) session.getAttribute("pendingVerifyEmail");
        if (email == null) return "redirect:/register";

        User user = userService.findByEmail(email);
        if (user == null) return "redirect:/register";

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        userService.saveUser(user);

        // Resend OTP via real email
        emailService.sendOtpEmail(email, user.getName(), otp);

        attrib.addFlashAttribute("msg", "New OTP sent! Please check your email.");
        return "redirect:/verify-email";
    }

    // ─── User Login ───────────────────────────────────────────────────────
    @GetMapping("/login")
    public String showLogin(HttpSession session) {
        if (session.getAttribute("user") != null) return "redirect:/user/dashboard";
        return "login";
    }

    @PostMapping("/login")
    public String loginUser(HttpSession session, RedirectAttributes attrib,
                            @RequestParam String email,
                            @RequestParam String password) {
        String cleanEmail = email != null ? email.trim() : "";
        User user = userService.findByEmail(cleanEmail);
        if (user == null || !userService.checkPassword(password, user.getPassword())) {
            attrib.addFlashAttribute("error", "Invalid email or password.");
            return "redirect:/login";
        }
        if ("BLOCKED".equals(user.getStatus())) {
            attrib.addFlashAttribute("error", "Your account has been blocked. Contact admin.");
            return "redirect:/login";
        }
        if (!user.isEmailVerified()) {
            session.setAttribute("pendingVerifyEmail", user.getEmail());
            attrib.addFlashAttribute("error", "Please verify your email first.");
            return "redirect:/verify-email";
        }
        user.setLastActive(LocalDateTime.now());
        userService.saveUser(user);
        session.setAttribute("user", user);
        attrib.addFlashAttribute("msg", "Welcome back, " + user.getName() + "!");
        return "redirect:/user/dashboard";
    }

    // ─── Direct OTP Login (Password-free Login via Gmail OTP) ──────────────
    @PostMapping("/login/otp/request")
    public String requestLoginOtp(@RequestParam String email,
                                  HttpSession session,
                                  RedirectAttributes attrib) {
        if (email == null || email.trim().isEmpty()) {
            attrib.addFlashAttribute("error", "Please enter your registered email address.");
            return "redirect:/login";
        }
        User user = userService.findByEmail(email.trim());
        if (user == null) {
            attrib.addFlashAttribute("error", "No account found with this email. Please register first.");
            return "redirect:/login";
        }
        if ("BLOCKED".equals(user.getStatus())) {
            attrib.addFlashAttribute("error", "Your account has been blocked. Contact admin.");
            return "redirect:/login";
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        userService.saveUser(user);

        emailService.sendOtpEmail(user.getEmail(), user.getName(), otp);
        session.setAttribute("otpLoginEmail", user.getEmail());

        attrib.addFlashAttribute("msg", "Login OTP sent to " + user.getEmail() + "! Enter the 6-digit OTP below to sign in.");
        return "redirect:/login?otpMode=1";
    }

    @PostMapping("/login/otp/verify")
    public String verifyLoginOtp(@RequestParam String otp,
                                 HttpSession session,
                                 RedirectAttributes attrib) {
        String email = (String) session.getAttribute("otpLoginEmail");
        if (email == null || email.isEmpty()) {
            attrib.addFlashAttribute("error", "Session expired. Please request OTP again.");
            return "redirect:/login";
        }

        User user = userService.findByEmail(email);
        if (user == null) {
            attrib.addFlashAttribute("error", "User not found.");
            return "redirect:/login";
        }
        if (user.getOtp() == null || !user.getOtp().equals(otp.trim())) {
            attrib.addFlashAttribute("error", "Invalid OTP. Please try again.");
            return "redirect:/login?otpMode=1";
        }
        if (user.getOtpExpiry() != null && LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            attrib.addFlashAttribute("error", "OTP has expired. Please request a new one.");
            return "redirect:/login?otpMode=1";
        }

        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setLastActive(LocalDateTime.now());
        userService.saveUser(user);

        session.removeAttribute("otpLoginEmail");
        session.setAttribute("user", user);

        attrib.addFlashAttribute("msg", "Welcome back, " + user.getName() + "! Logged in successfully.");
        return "redirect:/user/dashboard";
    }

    // ─── Logout ───────────────────────────────────────────────────────────
    @GetMapping("/logout")
    public String logout(HttpSession session, RedirectAttributes attrib) {
        session.invalidate();
        attrib.addFlashAttribute("msg", "Logged out successfully.");
        return "redirect:/login";
    }

    // ─── Forgot Password ──────────────────────────────────────────────────
    @GetMapping("/forgot-password")
    public String showForgotPassword(HttpSession session) {
        if (session.getAttribute("user") != null) return "redirect:/user/dashboard";
        return "forgot-password";
    }

    @PostMapping("/forgot-password")
    public String handleForgotPassword(@RequestParam String email,
                                       HttpServletRequest request,
                                       RedirectAttributes attrib) {
        User user = userService.findByEmail(email != null ? email.trim().toLowerCase() : "");
        if (user == null) {
            attrib.addFlashAttribute("msg", "If that email is registered, a 6-digit reset code has been sent. Please check your inbox and spam folder.");
            return "redirect:/reset-password?email=" + (email != null ? email.trim() : "") + "&sent=1";
        }

        // Delete old tokens for this user
        tokenRepo.deleteByUserId(user.getId());

        // Generate 6-digit OTP code as the token
        String otpCode = String.format("%06d", new Random().nextInt(999999));
        PasswordResetToken prt = new PasswordResetToken();
        prt.setToken(otpCode);
        prt.setUserId(user.getId());
        prt.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        tokenRepo.save(prt);

        // Dynamically determine live Base URL from incoming HTTP request
        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null || scheme.isEmpty()) scheme = request.getScheme();

        String host = request.getHeader("X-Forwarded-Host");
        if (host == null || host.isEmpty()) host = request.getHeader("Host");
        if (host == null || host.isEmpty()) {
            int port = request.getServerPort();
            host = request.getServerName() + (port == 80 || port == 443 ? "" : ":" + port);
        }

        String baseUrl = scheme + "://" + host;
        String resetLink = baseUrl + "/reset-password?token=" + otpCode;

        // Send password reset email with both OTP and dynamic link
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink, otpCode);

        attrib.addFlashAttribute("msg", "Password reset code sent to your Gmail! Check your inbox.");
        return "redirect:/reset-password?email=" + user.getEmail() + "&sent=1";
    }

    @GetMapping("/reset-password")
    public String showResetPassword(@RequestParam(required = false) String token,
                                    @RequestParam(required = false) String email,
                                    @RequestParam(required = false) String sent,
                                    Model model, 
                                    RedirectAttributes attrib) {
        if (token != null && !token.trim().isEmpty()) {
            PasswordResetToken prt = tokenRepo.findByToken(token.trim());
            if (prt == null || prt.isUsed() || LocalDateTime.now().isAfter(prt.getExpiresAt())) {
                attrib.addFlashAttribute("error", "Invalid or expired reset code / link. Please try again.");
                return "redirect:/forgot-password";
            }
            model.addAttribute("token", token.trim());
        }
        model.addAttribute("email", email);
        model.addAttribute("sent", sent);
        return "reset-password";
    }

    @PostMapping("/reset-password")
    public String handleResetPassword(@RequestParam String token,
                                      @RequestParam String newPassword,
                                      @RequestParam String confirmPassword,
                                      RedirectAttributes attrib) {
        if (token == null || token.trim().isEmpty()) {
            attrib.addFlashAttribute("error", "Please enter the 6-digit reset code sent to your email.");
            return "redirect:/reset-password";
        }
        String cleanToken = token.trim();
        PasswordResetToken prt = tokenRepo.findByToken(cleanToken);
        if (prt == null || prt.isUsed() || LocalDateTime.now().isAfter(prt.getExpiresAt())) {
            attrib.addFlashAttribute("error", "Invalid or expired reset code. Please check your email or request a new code.");
            return "redirect:/reset-password?token=" + cleanToken;
        }
        if (!newPassword.equals(confirmPassword)) {
            attrib.addFlashAttribute("error", "Passwords do not match.");
            return "redirect:/reset-password?token=" + cleanToken;
        }
        if (newPassword.length() < 6) {
            attrib.addFlashAttribute("error", "Password must be at least 6 characters.");
            return "redirect:/reset-password?token=" + cleanToken;
        }

        User user = userService.findById(prt.getUserId());
        if (user == null) {
            attrib.addFlashAttribute("error", "User account not found.");
            return "redirect:/forgot-password";
        }
        user.setPassword(userService.encodePassword(newPassword));
        userService.saveUser(user);

        prt.setUsed(true);
        tokenRepo.save(prt);

        attrib.addFlashAttribute("msg", "Password reset successful! Please login with your new password.");
        return "redirect:/login";
    }

    // ─── Admin Login ──────────────────────────────────────────────────────
    @GetMapping("/adminlogin")
    public String showAdminLogin(HttpSession session) {
        if (session.getAttribute("admin") != null) return "redirect:/admin/dashboard";
        return "adminlogin";
    }

    @PostMapping("/adminlogin")
    public String adminLogin(HttpSession session, RedirectAttributes attrib,
                             @RequestParam String adminid,
                             @RequestParam String password) {
        AdminLogin admin = adminLoginRepo.findByAdminidAndPassword(adminid, password);
        if (admin == null) {
            attrib.addFlashAttribute("error", "Invalid Admin ID or Password.");
            return "redirect:/adminlogin";
        }
        session.setAttribute("admin", admin);
        return "redirect:/admin/dashboard";
    }

    // ─── Admin Logout ─────────────────────────────────────────────────────
    @GetMapping("/admin/logout")
    public String adminLogout(HttpSession session, RedirectAttributes attrib) {
        session.invalidate();
        attrib.addFlashAttribute("msg", "Admin logged out successfully.");
        return "redirect:/adminlogin";
    }

    // ─── About ────────────────────────────────────────────────────────────
    @GetMapping("/about")
    public String about() {
        return "about";
    }

    // ─── Contact ──────────────────────────────────────────────────────────
    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }

    @PostMapping("/contact")
    public String submitContact(@RequestParam String name,
                                @RequestParam String email,
                                @RequestParam String subject,
                                @RequestParam String message,
                                RedirectAttributes attrib) {
        ContactMessage cm = new ContactMessage();
        cm.setName(name);
        cm.setEmail(email);
        cm.setSubject(subject);
        cm.setMessage(message);
        cm.setSubmittedAt(LocalDateTime.now());
        contactMessageRepo.save(cm);

        attrib.addFlashAttribute("contactMsg",
            "Thank you, " + name + "! Your message has been received. We'll reply to " + email + " shortly.");
        return "redirect:/contact";
    }
}
