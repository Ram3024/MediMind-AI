package com.example.findx.controller;

import com.example.findx.dto.LostItemDto;
import com.example.findx.model.LostItem;
import com.example.findx.model.User;
import com.example.findx.repo.CategoryRepo;
import com.example.findx.repo.LostItemRepo;
import com.example.findx.service.AiMatchingService;
import com.example.findx.service.FileUploadService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Controller
public class LostItemController {

    @Autowired private LostItemRepo lostRepo;
    @Autowired private CategoryRepo categoryRepo;
    @Autowired private FileUploadService fileService;
    @Autowired private AiMatchingService aiService;

    // ─── Report Lost Item Form ────────────────────────────────────────────
    @GetMapping("/lost/report")
    public String showReportForm(Model model, HttpSession session, RedirectAttributes attrib) {
        if (session.getAttribute("user") == null) {
            attrib.addFlashAttribute("error", "Please login first.");
            return "redirect:/login";
        }
        model.addAttribute("ldto", new LostItemDto());
        model.addAttribute("categories", categoryRepo.findAll());
        return "lost/reportlost";
    }

    // ─── Save Lost Item ───────────────────────────────────────────────────
    @PostMapping("/lost/report")
    public String saveLostItem(@ModelAttribute LostItemDto ldto,
                               @RequestParam(value = "imageFiles", required = false) MultipartFile[] imageFiles,
                               HttpSession session,
                               RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";

        try {
            LostItem item = new LostItem();
            item.setUserId(user.getId());
            item.setItemName(ldto.getItemName());
            item.setCategory(ldto.getCategory());
            item.setSubCategory(ldto.getSubCategory());
            item.setDescription(ldto.getDescription());
            item.setBrand(ldto.getBrand());
            item.setModel(ldto.getModel());
            item.setColor(ldto.getColor());
            item.setUniqueFeatures(ldto.getUniqueFeatures());
            item.setLostLocation(ldto.getLostLocation());
            item.setCity(ldto.getCity());
            item.setLatitude(ldto.getLatitude());
            item.setLongitude(ldto.getLongitude());
            item.setLostDate(ldto.getLostDate());
            item.setLostTime(ldto.getLostTime());
            item.setAdditionalInfo(ldto.getAdditionalInfo());
            item.setStatus("ACTIVE");
            item.setReportDate(LocalDateTime.now());

            // Handle image upload
            if (imageFiles != null && imageFiles.length > 0) {
                String images = fileService.uploadMultipleFiles(imageFiles);
                item.setImages(images);
            }

            lostRepo.save(item);

            // Trigger AI Matching Engine
            aiService.runMatchingForLostItem(item);

            // Update user's lost count
            user.setLostCount(user.getLostCount() + 1);

            attrib.addFlashAttribute("msg", "Lost item reported successfully! AI is finding matches...");
            return "redirect:/user/dashboard";

        } catch (Exception e) {
            attrib.addFlashAttribute("error", "Error saving report: " + e.getMessage());
            return "redirect:/lost/report";
        }
    }

    // ─── View All Lost Items ──────────────────────────────────────────────
    @GetMapping("/lost/browse")
    public String viewLostItems(Model model,
                                @RequestParam(required = false) String keyword,
                                @RequestParam(required = false) String category,
                                @RequestParam(required = false) String city) {
        List<LostItem> items;
        if ((keyword != null && !keyword.isEmpty()) || (category != null && !category.isEmpty())
                || (city != null && !city.isEmpty())) {
            items = lostRepo.searchLostItems(
                    (keyword != null && !keyword.isEmpty()) ? keyword : null,
                    (category != null && !category.isEmpty()) ? category : null,
                    (city != null && !city.isEmpty()) ? city : null
            );
        } else {
            items = lostRepo.findByStatus("ACTIVE");
        }
        model.addAttribute("items", items);
        model.addAttribute("categories", categoryRepo.findAll());
        model.addAttribute("keyword", keyword);
        model.addAttribute("selectedCategory", category);
        model.addAttribute("searchCity", city);
        return "lost/viewlost";
    }

    // ─── Lost Item Detail ─────────────────────────────────────────────────
    @GetMapping("/lost/detail/{id}")
    public String lostDetail(@PathVariable Long id, Model model) {
        LostItem item = lostRepo.findById(id).orElse(null);
        if (item == null) return "redirect:/lost/browse";
        model.addAttribute("item", item);
        return "lost/lostdetail";
    }

    // ─── Mark as Recovered ────────────────────────────────────────────────
    @GetMapping("/lost/recovered/{id}")
    public String markRecovered(@PathVariable Long id, HttpSession session, RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";
        LostItem item = lostRepo.findById(id).orElse(null);
        if (item != null && item.getUserId().equals(user.getId())) {
            item.setStatus("RECOVERED");
            lostRepo.save(item);
            user.setRecoveredCount(user.getRecoveredCount() + 1);
            attrib.addFlashAttribute("msg", "Item marked as recovered! Great news!");
        }
        return "redirect:/user/dashboard";
    }
}
