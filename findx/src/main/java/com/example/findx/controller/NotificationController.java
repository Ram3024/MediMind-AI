package com.example.findx.controller;

import com.example.findx.model.*;
import com.example.findx.repo.*;
import com.example.findx.service.NotificationService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired private NotificationService notifService;

    @GetMapping
    public String viewNotifications(Model model, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";
        List<Notification> notifications = notifService.getUserNotifications(user.getId());
        notifService.markAllRead(user.getId());
        model.addAttribute("notifications", notifications);
        return "notifications";
    }

    @GetMapping("/read/{id}")
    public String markRead(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";
        notifService.markRead(id);
        return "redirect:/notifications";
    }

    @PostMapping("/mark-all-read")
    public String markAllRead(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";
        notifService.markAllRead(user.getId());
        return "redirect:/notifications";
    }
}
