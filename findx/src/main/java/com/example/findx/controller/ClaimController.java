package com.example.findx.controller;

import com.example.findx.dto.ClaimDto;
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
@RequestMapping("/claims")
public class ClaimController {

    @Autowired private ClaimRepo claimRepo;
    @Autowired private LostItemRepo lostRepo;
    @Autowired private FoundItemRepo foundRepo;
    @Autowired private AiMatchRepo matchRepo;
    @Autowired private NotificationService notifService;

    // ─── Submit Claim Form ────────────────────────────────────────────────
    @GetMapping("/submit/{matchId}")
    public String showClaimForm(@PathVariable Long matchId, Model model,
                                HttpSession session, RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";

        AiMatch match = matchRepo.findById(matchId).orElse(null);
        if (match == null) return "redirect:/matches/my";

        LostItem lostItem  = lostRepo.findById(match.getLostItemId()).orElse(null);
        FoundItem foundItem = foundRepo.findById(match.getFoundItemId()).orElse(null);

        // Only the owner of the lost item can claim
        if (lostItem == null || !lostItem.getUserId().equals(user.getId())) {
            attrib.addFlashAttribute("error", "You can only claim your own lost items.");
            return "redirect:/matches/my";
        }

        // Check duplicate claim
        if (claimRepo.existsByLostItemIdAndClaimantId(lostItem.getId(), user.getId())) {
            attrib.addFlashAttribute("error", "You have already submitted a claim for this item.");
            return "redirect:/claims/my";
        }

        model.addAttribute("match", match);
        model.addAttribute("lostItem", lostItem);
        model.addAttribute("foundItem", foundItem);
        model.addAttribute("cdto", new ClaimDto());
        return "claims/submitclaim";
    }

    // ─── Save Claim ───────────────────────────────────────────────────────
    @PostMapping("/submit")
    public String saveClaim(@ModelAttribute ClaimDto cdto,
                            HttpSession session, RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";

        Claim claim = new Claim();
        claim.setLostItemId(cdto.getLostItemId());
        claim.setFoundItemId(cdto.getFoundItemId());
        claim.setAiMatchId(cdto.getAiMatchId());
        claim.setClaimantId(user.getId());
        claim.setUniqueMark(cdto.getUniqueMark());
        claim.setSerialNumber(cdto.getSerialNumber());
        claim.setPurchaseInfo(cdto.getPurchaseInfo());
        claim.setAdditionalInfo(cdto.getAdditionalInfo());
        claim.setStatus("PENDING");
        claim.setClaimDate(LocalDateTime.now());
        claimRepo.save(claim);

        // Update lost item status
        lostRepo.findById(cdto.getLostItemId()).ifPresent(li -> {
            li.setStatus("MATCHED");
            lostRepo.save(li);
        });

        // Notify admin or finder
        foundRepo.findById(cdto.getFoundItemId()).ifPresent(fi -> {
            notifService.createClaimNotification(fi.getUserId(),
                    fi.getItemName(),
                    "A user has submitted a claim for the item you found: '" + fi.getItemName() + "'. Awaiting verification.",
                    "/claims/status/" + claim.getId());
        });

        attrib.addFlashAttribute("msg", "Claim submitted! Pending admin verification.");
        return "redirect:/claims/my";
    }

    // ─── My Claims ────────────────────────────────────────────────────────
    @GetMapping("/my")
    public String myClaims(Model model, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";
        List<Claim> claims = claimRepo.findByClaimantId(user.getId());
        model.addAttribute("claims", claims);

        java.util.Map<Long, LostItem> lostMap = new java.util.HashMap<>();
        java.util.Map<Long, FoundItem> foundMap = new java.util.HashMap<>();
        for (Claim c : claims) {
            lostRepo.findById(c.getLostItemId()).ifPresent(li -> lostMap.put(li.getId(), li));
            foundRepo.findById(c.getFoundItemId()).ifPresent(fi -> foundMap.put(fi.getId(), fi));
        }
        model.addAttribute("lostMap", lostMap);
        model.addAttribute("foundMap", foundMap);
        return "claims/myclaims";
    }

    // ─── Claim Status Detail ──────────────────────────────────────────────
    @GetMapping("/status/{id}")
    public String claimStatus(@PathVariable Long id, Model model, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";
        Claim claim = claimRepo.findById(id).orElse(null);
        if (claim == null) return "redirect:/claims/my";
        model.addAttribute("claim", claim);
        lostRepo.findById(claim.getLostItemId()).ifPresent(li -> model.addAttribute("lostItem", li));
        foundRepo.findById(claim.getFoundItemId()).ifPresent(fi -> model.addAttribute("foundItem", fi));
        return "claims/claimstatus";
    }
}
