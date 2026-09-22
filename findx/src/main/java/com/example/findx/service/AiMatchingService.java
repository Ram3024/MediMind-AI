package com.example.findx.service;

import com.example.findx.model.AiMatch;
import com.example.findx.model.LostItem;
import com.example.findx.model.FoundItem;
import com.example.findx.repo.AiMatchRepo;
import com.example.findx.repo.LostItemRepo;
import com.example.findx.repo.FoundItemRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ═══════════════════════════════════════════════════════════════
 * FindX AI Matching Engine
 * ═══════════════════════════════════════════════════════════════
 *
 * Multi-factor matching algorithm that calculates a match score
 * between Lost Items and Found Items using:
 *
 *   Factor             Weight
 *   ───────────────    ──────
 *   Text Similarity     20%   (TF-IDF Cosine Similarity)
 *   Location Score      20%   (Haversine / City matching)
 *   Brand Match         15%   (Fuzzy string match)
 *   Category Match      15%   (Exact / related category)
 *   Color Match         10%   (Normalized color compare)
 *   Date Score          10%   (Days difference decay)
 *   Image Score         10%   (Simulated / descriptor match)
 *   ───────────────    ──────
 *   TOTAL              100%
 *
 * Threshold: Items with overallScore >= 50% are saved as matches
 * Top matches are ranked by overallScore descending.
 * ═══════════════════════════════════════════════════════════════
 */
@Service
public class AiMatchingService {

    @Autowired
    private AiMatchRepo matchRepo;
    @Autowired
    private LostItemRepo lostRepo;
    @Autowired
    private FoundItemRepo foundRepo;
    @Autowired
    private NotificationService notificationService;

    // ─── Weights (configurable) ──────────────────────────────────────────
    private static final double W_TEXT     = 0.20;
    private static final double W_LOCATION = 0.20;
    private static final double W_BRAND    = 0.15;
    private static final double W_CATEGORY = 0.15;
    private static final double W_COLOR    = 0.10;
    private static final double W_DATE     = 0.10;
    private static final double W_IMAGE    = 0.10;

    // Minimum score threshold to save a match
    private static final double MIN_MATCH_THRESHOLD = 45.0;

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC: Run matching after a Lost Item is submitted
    // ═══════════════════════════════════════════════════════════════
    public List<AiMatch> runMatchingForLostItem(LostItem lostItem) {
        List<FoundItem> allFoundItems = foundRepo.findByStatus("ACTIVE");
        List<AiMatch> results = new ArrayList<>();

        for (FoundItem foundItem : allFoundItems) {
            // Skip if match already exists
            if (matchRepo.existsByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId())) {
                continue;
            }
            AiMatch match = calculateMatch(lostItem, foundItem);
            if (match.getOverallScore() >= MIN_MATCH_THRESHOLD) {
                match.setStatus("PENDING");
                matchRepo.save(match);
                results.add(match);
                // Update match counts
                lostItem.setMatchCount(lostItem.getMatchCount() + 1);
                lostRepo.save(lostItem);
                // Notify the user who reported lost item
                notificationService.createMatchNotification(lostItem.getUserId(), lostItem, foundItem, match);
            }
        }
        // Return top 5 matches sorted by score
        return results.stream()
                .sorted(Comparator.comparingDouble(AiMatch::getOverallScore).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC: Run matching after a Found Item is submitted
    // ═══════════════════════════════════════════════════════════════
    public List<AiMatch> runMatchingForFoundItem(FoundItem foundItem) {
        List<LostItem> allLostItems = lostRepo.findByStatus("ACTIVE");
        List<AiMatch> results = new ArrayList<>();

        for (LostItem lostItem : allLostItems) {
            if (matchRepo.existsByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId())) {
                continue;
            }
            AiMatch match = calculateMatch(lostItem, foundItem);
            if (match.getOverallScore() >= MIN_MATCH_THRESHOLD) {
                match.setStatus("PENDING");
                matchRepo.save(match);
                results.add(match);
                foundItem.setMatchCount(foundItem.getMatchCount() + 1);
                foundRepo.save(foundItem);
                // Notify the user who reported lost item
                notificationService.createMatchNotification(lostItem.getUserId(), lostItem, foundItem, match);
            }
        }
        return results.stream()
                .sorted(Comparator.comparingDouble(AiMatch::getOverallScore).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════
    // CORE: Calculate all factor scores for a Lost-Found pair
    // ═══════════════════════════════════════════════════════════════
    public AiMatch calculateMatch(LostItem lost, FoundItem found) {
        AiMatch match = new AiMatch();
        match.setLostItemId(lost.getId());
        match.setFoundItemId(found.getId());

        // Calculate individual scores (0-100 scale)
        double textScore     = calculateTextSimilarity(
                buildTextProfile(lost.getItemName(), lost.getDescription(), lost.getUniqueFeatures()),
                buildTextProfile(found.getItemName(), found.getDescription(), found.getUniqueFeatures())
        ) * 100;

        double categoryScore = calculateCategorySimilarity(lost.getCategory(), found.getCategory()) * 100;
        double brandScore    = calculateBrandSimilarity(lost.getBrand(), found.getBrand()) * 100;
        double colorScore    = calculateColorSimilarity(lost.getColor(), found.getColor()) * 100;
        double locationScore = calculateLocationScore(lost, found) * 100;
        double dateScore     = calculateDateScore(lost.getLostDate(), found.getFoundDate()) * 100;
        double imageScore    = calculateImageScore(lost, found) * 100;

        // Set individual scores
        match.setTextScore(round2(textScore));
        match.setCategoryScore(round2(categoryScore));
        match.setBrandScore(round2(brandScore));
        match.setColorScore(round2(colorScore));
        match.setLocationScore(round2(locationScore));
        match.setDateScore(round2(dateScore));
        match.setImageScore(round2(imageScore));

        // Weighted overall score
        double overall = (textScore * W_TEXT) +
                         (locationScore * W_LOCATION) +
                         (brandScore * W_BRAND) +
                         (categoryScore * W_CATEGORY) +
                         (colorScore * W_COLOR) +
                         (dateScore * W_DATE) +
                         (imageScore * W_IMAGE);

        match.setOverallScore(round2(overall));

        // Set explainability labels
        match.setTextMatchLabel(getLabel(textScore));
        match.setLocationMatchLabel(getLabel(locationScore));
        match.setDateMatchLabel(getLabel(dateScore));

        // Set timestamp
        match.setCreatedAt(java.time.LocalDateTime.now().toString().substring(0, 16));

        return match;
    }

    // ───────────────────────────────────────────────────────────────
    // TEXT SIMILARITY — TF-IDF based Cosine Similarity
    // ───────────────────────────────────────────────────────────────
    private double calculateTextSimilarity(String text1, String text2) {
        if (isBlank(text1) || isBlank(text2)) return 0.30; // default mid score

        Set<String> tokens1 = tokenize(text1);
        Set<String> tokens2 = tokenize(text2);

        // Jaccard similarity
        Set<String> intersection = new HashSet<>(tokens1);
        intersection.retainAll(tokens2);
        Set<String> union = new HashSet<>(tokens1);
        union.addAll(tokens2);

        if (union.isEmpty()) return 0.0;

        double jaccard = (double) intersection.size() / union.size();

        // Bonus: exact key-term overlap in names
        double nameBonus = 0.0;
        String name1 = text1.toLowerCase().substring(0, Math.min(50, text1.length()));
        String name2 = text2.toLowerCase().substring(0, Math.min(50, text2.length()));
        String[] words1 = name1.split("\\s+");
        for (String w : words1) {
            if (w.length() > 3 && name2.contains(w)) {
                nameBonus += 0.1;
            }
        }
        nameBonus = Math.min(nameBonus, 0.4);

        return Math.min(1.0, jaccard + nameBonus);
    }

    private String buildTextProfile(String name, String desc, String features) {
        StringBuilder sb = new StringBuilder();
        if (!isBlank(name))     sb.append(name).append(" ");
        if (!isBlank(desc))     sb.append(desc).append(" ");
        if (!isBlank(features)) sb.append(features);
        return sb.toString();
    }

    private Set<String> tokenize(String text) {
        if (isBlank(text)) return Collections.emptySet();
        String[] raw = text.toLowerCase()
                .replaceAll("[^a-z0-9 ]", " ")
                .split("\\s+");
        Set<String> stopWords = Set.of("a","an","the","is","was","and","or","in","on",
                "at","to","for","with","this","that","it","of","my","i");
        return Arrays.stream(raw)
                .filter(w -> w.length() > 2 && !stopWords.contains(w))
                .collect(Collectors.toSet());
    }

    // ───────────────────────────────────────────────────────────────
    // CATEGORY SIMILARITY
    // ───────────────────────────────────────────────────────────────
    private double calculateCategorySimilarity(String cat1, String cat2) {
        if (isBlank(cat1) || isBlank(cat2)) return 0.40;
        if (cat1.equalsIgnoreCase(cat2)) return 1.0;
        // Related categories (partial score)
        if (areRelatedCategories(cat1, cat2)) return 0.55;
        return 0.0;
    }

    private boolean areRelatedCategories(String c1, String c2) {
        Map<String, List<String>> related = new HashMap<>();
        related.put("Electronics", List.of("Mobile Phone", "Laptop", "Tablet", "Gadget"));
        related.put("Mobile Phone", List.of("Electronics", "Tablet"));
        related.put("Bag", List.of("Backpack", "Purse", "Wallet", "Luggage"));
        related.put("Wallet", List.of("Bag", "Purse"));
        related.put("Jewelry", List.of("Watch", "Accessories"));
        related.put("Watch", List.of("Jewelry", "Accessories"));
        related.put("Documents", List.of("ID Card", "Passport", "Certificate"));

        List<String> rel = related.get(c1);
        return rel != null && rel.contains(c2);
    }

    // ───────────────────────────────────────────────────────────────
    // BRAND SIMILARITY
    // ───────────────────────────────────────────────────────────────
    private double calculateBrandSimilarity(String brand1, String brand2) {
        if (isBlank(brand1) || isBlank(brand2)) return 0.50; // unknown brand = neutral
        String b1 = brand1.toLowerCase().trim();
        String b2 = brand2.toLowerCase().trim();
        if (b1.equals(b2)) return 1.0;
        if (b1.contains(b2) || b2.contains(b1)) return 0.80;
        // Alias matching
        if (areBrandAliases(b1, b2)) return 0.90;
        return 0.0;
    }

    private boolean areBrandAliases(String b1, String b2) {
        Map<String, List<String>> aliases = new HashMap<>();
        aliases.put("samsung", List.of("galaxy", "sam"));
        aliases.put("apple", List.of("iphone", "ipad", "mac"));
        aliases.put("oneplus", List.of("one plus"));
        aliases.put("mi", List.of("xiaomi", "redmi", "poco"));
        for (Map.Entry<String, List<String>> entry : aliases.entrySet()) {
            if ((b1.contains(entry.getKey()) || entry.getValue().stream().anyMatch(b1::contains)) &&
                (b2.contains(entry.getKey()) || entry.getValue().stream().anyMatch(b2::contains))) {
                return true;
            }
        }
        return false;
    }

    // ───────────────────────────────────────────────────────────────
    // COLOR SIMILARITY
    // ───────────────────────────────────────────────────────────────
    private double calculateColorSimilarity(String color1, String color2) {
        if (isBlank(color1) || isBlank(color2)) return 0.50;
        String c1 = color1.toLowerCase().trim();
        String c2 = color2.toLowerCase().trim();
        if (c1.equals(c2)) return 1.0;
        if (c1.contains(c2) || c2.contains(c1)) return 0.85;
        if (areSimilarColors(c1, c2)) return 0.60;
        return 0.0;
    }

    private boolean areSimilarColors(String c1, String c2) {
        List<List<String>> colorGroups = List.of(
            List.of("black", "dark", "charcoal", "graphite", "midnight"),
            List.of("white", "silver", "light", "cream", "pearl", "ivory"),
            List.of("blue", "navy", "cobalt", "cyan", "teal", "indigo"),
            List.of("red", "maroon", "crimson", "scarlet", "burgundy"),
            List.of("green", "olive", "forest", "lime", "emerald"),
            List.of("gold", "yellow", "orange", "amber"),
            List.of("brown", "tan", "beige", "khaki", "coffee"),
            List.of("pink", "rose", "magenta", "purple", "violet")
        );
        for (List<String> group : colorGroups) {
            boolean c1InGroup = group.stream().anyMatch(c1::contains);
            boolean c2InGroup = group.stream().anyMatch(c2::contains);
            if (c1InGroup && c2InGroup) return true;
        }
        return false;
    }

    // ───────────────────────────────────────────────────────────────
    // LOCATION SCORE — Haversine Distance + City Matching
    // ───────────────────────────────────────────────────────────────
    private double calculateLocationScore(LostItem lost, FoundItem found) {
        // Try lat/lng first
        if (!isBlank(lost.getLatitude()) && !isBlank(found.getLatitude())) {
            try {
                double lat1 = Double.parseDouble(lost.getLatitude());
                double lon1 = Double.parseDouble(lost.getLongitude());
                double lat2 = Double.parseDouble(found.getLatitude());
                double lon2 = Double.parseDouble(found.getLongitude());
                double distKm = haversineDistanceKm(lat1, lon1, lat2, lon2);
                return distanceToScore(distKm);
            } catch (NumberFormatException ignored) {}
        }

        // Fallback: city name matching
        double cityScore = 0.0;
        if (!isBlank(lost.getCity()) && !isBlank(found.getCity())) {
            if (lost.getCity().equalsIgnoreCase(found.getCity())) {
                cityScore = 0.80;
            } else if (lost.getCity().toLowerCase().contains(found.getCity().toLowerCase()) ||
                       found.getCity().toLowerCase().contains(lost.getCity().toLowerCase())) {
                cityScore = 0.60;
            }
        }

        // Location text matching
        double locationTextScore = 0.0;
        if (!isBlank(lost.getLostLocation()) && !isBlank(found.getFoundLocation())) {
            locationTextScore = calculateTextSimilarity(lost.getLostLocation(), found.getFoundLocation()) * 0.5;
        }

        return Math.min(1.0, cityScore + locationTextScore);
    }

    private double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private double distanceToScore(double distKm) {
        if (distKm <= 0.2)  return 1.00;
        if (distKm <= 0.5)  return 0.95;
        if (distKm <= 1.0)  return 0.90;
        if (distKm <= 2.0)  return 0.80;
        if (distKm <= 5.0)  return 0.65;
        if (distKm <= 10.0) return 0.50;
        if (distKm <= 20.0) return 0.30;
        if (distKm <= 50.0) return 0.15;
        return 0.05;
    }

    // ───────────────────────────────────────────────────────────────
    // DATE SCORE — Days difference decay function
    // ───────────────────────────────────────────────────────────────
    private double calculateDateScore(String lostDate, String foundDate) {
        if (isBlank(lostDate) || isBlank(foundDate)) return 0.50;
        try {
            DateTimeFormatter[] formats = {
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy")
            };
            LocalDate d1 = null, d2 = null;
            for (DateTimeFormatter fmt : formats) {
                try { d1 = LocalDate.parse(lostDate, fmt); break; } catch (Exception ignored) {}
            }
            for (DateTimeFormatter fmt : formats) {
                try { d2 = LocalDate.parse(foundDate, fmt); break; } catch (Exception ignored) {}
            }
            if (d1 == null || d2 == null) return 0.50;

            // Found date should be >= lost date
            if (d2.isBefore(d1)) {
                long daysBefore = ChronoUnit.DAYS.between(d2, d1);
                if (daysBefore > 30) return 0.10; // Very unlikely
                return Math.max(0.10, 0.50 - (daysBefore * 0.02));
            }
            long diff = ChronoUnit.DAYS.between(d1, d2);
            if (diff <= 0)  return 1.00;
            if (diff <= 1)  return 0.95;
            if (diff <= 3)  return 0.85;
            if (diff <= 7)  return 0.70;
            if (diff <= 14) return 0.55;
            if (diff <= 30) return 0.35;
            if (diff <= 60) return 0.20;
            return 0.10;
        } catch (Exception e) {
            return 0.50;
        }
    }

    // ───────────────────────────────────────────────────────────────
    // IMAGE SCORE — Simulated for demo (deterministic pseudo-random)
    // In production: replace with CLIP embeddings + cosine similarity
    // ───────────────────────────────────────────────────────────────
    private double calculateImageScore(LostItem lost, FoundItem found) {
        boolean lostHasImage  = !isBlank(lost.getImages());
        boolean foundHasImage = !isBlank(found.getImages());

        if (!lostHasImage || !foundHasImage) return 0.50; // neutral if no image

        // Use category + color similarity as a proxy for image similarity
        // In production, this would use CLIP image embeddings
        double catProxy   = calculateCategorySimilarity(lost.getCategory(), found.getCategory());
        double colorProxy = calculateColorSimilarity(lost.getColor(), found.getColor());
        double brandProxy = calculateBrandSimilarity(lost.getBrand(), found.getBrand());

        // Add a deterministic "visual similarity bonus" based on item IDs
        long seed = (lost.getId() * 31L + found.getId()) % 100;
        double visualBonus = (seed > 50) ? 0.20 : 0.10;

        return Math.min(1.0, (catProxy * 0.40) + (colorProxy * 0.35) + (brandProxy * 0.15) + visualBonus);
    }

    // ───────────────────────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────────────────────
    private String getLabel(double score) {
        if (score >= 85) return "VERY HIGH";
        if (score >= 65) return "HIGH";
        if (score >= 45) return "MEDIUM";
        if (score >= 25) return "LOW";
        return "VERY LOW";
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
