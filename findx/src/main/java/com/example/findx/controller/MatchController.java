package com.example.findx.controller;

import com.example.findx.model.*;
import com.example.findx.repo.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.*;

@Controller
@RequestMapping("/matches")
public class MatchController {

    @Autowired private AiMatchRepo matchRepo;
    @Autowired private LostItemRepo lostRepo;
    @Autowired private FoundItemRepo foundRepo;

    // ─── My Matches ───────────────────────────────────────────────────────
    @GetMapping("/my")
    public String myMatches(Model model, HttpSession session, RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) { attrib.addFlashAttribute("error", "Login required."); return "redirect:/login"; }

        List<LostItem> myLostItems = lostRepo.findByUserId(user.getId());
        List<AiMatch> allMatches = new ArrayList<>();

        for (LostItem li : myLostItems) {
            allMatches.addAll(matchRepo.findByLostItemIdOrderByScoreDesc(li.getId()));
        }
        allMatches.sort(Comparator.comparingDouble(AiMatch::getOverallScore).reversed());

        // Build lookup maps for template
        Map<Long, LostItem> lostMap = new HashMap<>();
        Map<Long, FoundItem> foundMap = new HashMap<>();
        for (AiMatch m : allMatches) {
            lostRepo.findById(m.getLostItemId()).ifPresent(li -> lostMap.put(li.getId(), li));
            foundRepo.findById(m.getFoundItemId()).ifPresent(fi -> foundMap.put(fi.getId(), fi));
        }

        model.addAttribute("matches", allMatches);
        model.addAttribute("lostMap", lostMap);
        model.addAttribute("foundMap", foundMap);
        return "matches/mymatches";
    }

    // ─── Match Detail (AI Explainability) ────────────────────────────────
    @GetMapping("/detail/{id}")
    public String matchDetail(@PathVariable Long id, Model model,
                              HttpSession session, RedirectAttributes attrib) {
        User user = (User) session.getAttribute("user");
        if (user == null) return "redirect:/login";

        AiMatch match = matchRepo.findById(id).orElse(null);
        if (match == null) return "redirect:/matches/my";

        LostItem lostItem  = lostRepo.findById(match.getLostItemId()).orElse(null);
        FoundItem foundItem = foundRepo.findById(match.getFoundItemId()).orElse(null);

        // Build AI explanation points
        List<String> explanations = buildExplanations(match, lostItem, foundItem);

        model.addAttribute("match", match);
        model.addAttribute("lostItem", lostItem);
        model.addAttribute("foundItem", foundItem);
        model.addAttribute("explanations", explanations);
        return "matches/matchdetail";
    }

    // ─── All Matches (browse) ─────────────────────────────────────────────
    @GetMapping("/all")
    public String allMatches(Model model) {
        List<AiMatch> matches = matchRepo.findHighScoreMatches(60.0);
        matches.sort(Comparator.comparingDouble(AiMatch::getOverallScore).reversed());

        Map<Long, LostItem> lostMap = new HashMap<>();
        Map<Long, FoundItem> foundMap = new HashMap<>();
        for (AiMatch m : matches) {
            lostRepo.findById(m.getLostItemId()).ifPresent(li -> lostMap.put(li.getId(), li));
            foundRepo.findById(m.getFoundItemId()).ifPresent(fi -> foundMap.put(fi.getId(), fi));
        }
        model.addAttribute("matches", matches);
        model.addAttribute("lostMap", lostMap);
        model.addAttribute("foundMap", foundMap);
        return "matches/allmatches";
    }

    // ─── AI Explainability Builder ────────────────────────────────────────
    private List<String> buildExplanations(AiMatch match, LostItem lost, FoundItem found) {
        List<String> exp = new ArrayList<>();
        if (match.getTextScore() >= 70)
            exp.add("✓ Item descriptions are highly similar");
        else if (match.getTextScore() >= 45)
            exp.add("✓ Item descriptions show moderate similarity");

        if (match.getBrandScore() >= 90)
            exp.add("✓ Same brand confirmed");
        else if (match.getBrandScore() >= 70)
            exp.add("✓ Brand names are closely related");

        if (match.getColorScore() >= 90)
            exp.add("✓ Exact color match");
        else if (match.getColorScore() >= 60)
            exp.add("✓ Similar color range");

        if (match.getCategoryScore() >= 90)
            exp.add("✓ Same item category");
        else if (match.getCategoryScore() >= 50)
            exp.add("✓ Related item categories");

        if (match.getLocationScore() >= 80)
            exp.add("✓ Lost and found locations are very close");
        else if (match.getLocationScore() >= 50)
            exp.add("✓ Locations are in nearby areas");

        if (match.getDateScore() >= 80)
            exp.add("✓ Item found shortly after it was lost");
        else if (match.getDateScore() >= 50)
            exp.add("✓ Date range is reasonably close");

        if (match.getImageScore() >= 75)
            exp.add("✓ Visual appearance appears highly similar");
        else if (match.getImageScore() >= 50)
            exp.add("✓ Visual features show some similarity");

        if (exp.isEmpty()) exp.add("✓ Multiple factors suggest a possible match");
        return exp;
    }
}
