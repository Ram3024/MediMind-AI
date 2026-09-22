package com.example.findx.controller;

import com.example.findx.dto.FoundItemDto;
import com.example.findx.model.FoundItem;
import com.example.findx.model.User;
import com.example.findx.repo.CategoryRepo;
import com.example.findx.repo.FoundItemRepo;
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
public class FoundItemController {

    @Autowired private FoundItemRepo foundRepo;
    @Autowired private CategoryRepo categoryRepo;
    @Autowired private FileUploadService fileService;
    @Autowired private AiMatchingService aiService;

    @GetMapping("/found/report")
    public String showFoundForm(Model model, HttpSession session, RedirectAttributes attrib) {
        if (session.getAttribute("user") == null) {
            attrib.addFlashAttribute("error", "Please login first.");
            return "redirect:/login";
        }
        model.addAttribute("fdto", new FoundItemDto());
        model.addAttribute("categories", categoryRepo.findAll());
        return "found/reportfound";
    }

    @PostMapping("/found/report")
    public String saveFoundItem(@ModelAttribute FoundItemDto fdto,
                                @RequestParam(value = "imageFiles", required = false) MultipartFile[] imageFiles,
                                HttpSession session,
                                RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";

        try {
            FoundItem item = new FoundItem();
            item.setUserId(user.getId());
            item.setItemName(fdto.getItemName());
            item.setCategory(fdto.getCategory());
            item.setDescription(fdto.getDescription());
            item.setBrand(fdto.getBrand());
            item.setModel(fdto.getModel());
            item.setColor(fdto.getColor());
            item.setUniqueFeatures(fdto.getUniqueFeatures());
            item.setFoundLocation(fdto.getFoundLocation());
            item.setCity(fdto.getCity());
            item.setLatitude(fdto.getLatitude());
            item.setLongitude(fdto.getLongitude());
            item.setFoundDate(fdto.getFoundDate());
            item.setFoundTime(fdto.getFoundTime());
            item.setAdditionalInfo(fdto.getAdditionalInfo());
            item.setStatus("ACTIVE");
            item.setReportDate(LocalDateTime.now());

            if (imageFiles != null && imageFiles.length > 0) {
                String images = fileService.uploadMultipleFiles(imageFiles);
                item.setImages(images);
            }

            foundRepo.save(item);

            // Trigger AI Matching Engine
            aiService.runMatchingForFoundItem(item);

            user.setFoundCount(user.getFoundCount() + 1);

            attrib.addFlashAttribute("msg", "Found item reported successfully! AI matching in progress...");
            return "redirect:/user/dashboard";

        } catch (Exception e) {
            attrib.addFlashAttribute("error", "Error saving report: " + e.getMessage());
            return "redirect:/found/report";
        }
    }

    @GetMapping("/found/browse")
    public String viewFoundItems(Model model,
                                 @RequestParam(required = false) String keyword,
                                 @RequestParam(required = false) String category,
                                 @RequestParam(required = false) String city) {
        List<FoundItem> items;
        if ((keyword != null && !keyword.isEmpty()) || (category != null && !category.isEmpty())
                || (city != null && !city.isEmpty())) {
            items = foundRepo.searchFoundItems(
                    (keyword != null && !keyword.isEmpty()) ? keyword : null,
                    (category != null && !category.isEmpty()) ? category : null,
                    (city != null && !city.isEmpty()) ? city : null
            );
        } else {
            items = foundRepo.findByStatus("ACTIVE");
        }
        model.addAttribute("items", items);
        model.addAttribute("categories", categoryRepo.findAll());
        model.addAttribute("keyword", keyword);
        model.addAttribute("selectedCategory", category);
        model.addAttribute("searchCity", city);
        return "found/viewfound";
    }

    @GetMapping("/found/detail/{id}")
    public String foundDetail(@PathVariable Long id, Model model) {
        FoundItem item = foundRepo.findById(id).orElse(null);
        if (item == null) return "redirect:/found/browse";
        model.addAttribute("item", item);
        return "found/founddetail";
    }
}
