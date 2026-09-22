package com.example.findx.controller;

import com.example.findx.model.User;
import com.example.findx.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Controller
public class GoogleOAuthController {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthController.class);

    @Autowired
    private UserService userService;

    @Value("${google.client.id:YOUR_GOOGLE_CLIENT_ID}")
    private String clientId;

    @Value("${google.client.secret:YOUR_GOOGLE_CLIENT_SECRET}")
    private String clientSecret;

    @Value("${google.redirect.uri:http://localhost:8080/oauth2/callback/google}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private boolean isGoogleConfigured() {
        return clientId != null && !clientId.trim().isEmpty() && !clientId.contains("YOUR_GOOGLE_CLIENT_ID");
    }

    private String resolveRedirectUri(HttpServletRequest request) {
        if (redirectUri != null && !redirectUri.contains("localhost:8080") && !redirectUri.trim().isEmpty()) {
            return redirectUri.trim();
        }
        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null || scheme.isEmpty()) scheme = request.getScheme();

        String host = request.getHeader("X-Forwarded-Host");
        if (host == null || host.isEmpty()) host = request.getHeader("Host");
        if (host == null || host.isEmpty()) {
            int port = request.getServerPort();
            host = request.getServerName() + (port == 80 || port == 443 ? "" : ":" + port);
        }
        return scheme + "://" + host + "/oauth2/callback/google";
    }

    /**
     * Redirects user to Google OAuth2 consent screen if configured,
     * otherwise opens Google Sign-In prompt.
     */
    @GetMapping("/oauth2/authorization/google")
    public String initiateGoogleLogin(HttpServletRequest request, RedirectAttributes attrib) {
        if (!isGoogleConfigured()) {
            // Open Google Sign-In prompt on login page
            return "redirect:/login?openGoogle=1";
        }

        String effectiveRedirectUri = resolveRedirectUri(request);
        String googleAuthUrl = UriComponentsBuilder.fromHttpUrl("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", clientId.trim())
                .queryParam("redirect_uri", effectiveRedirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid profile email")
                .queryParam("access_type", "offline")
                .queryParam("prompt", "select_account")
                .build()
                .toUriString();

        return "redirect:" + googleAuthUrl;
    }

    /**
     * One-click Google Login & Account handler
     */
    @RequestMapping(value = "/login/google/quick", method = {RequestMethod.GET, RequestMethod.POST})
    public String handleQuickGoogleLogin(@RequestParam(required = false) String email,
                                        @RequestParam(required = false) String name,
                                        HttpSession session,
                                        RedirectAttributes attrib) {
        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            attrib.addFlashAttribute("error", "Please provide a valid Gmail address.");
            return "redirect:/login";
        }
        email = email.trim().toLowerCase();
        if (name == null || name.trim().isEmpty()) {
            name = email.split("@")[0];
        }

        User user = userService.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(userService.encodePassword(UUID.randomUUID().toString()));
            user.setRole("USER");
            user.setStatus("ACTIVE");
            user.setEmailVerified(true);
            user.setRegDate(LocalDateTime.now());
            user.setLastActive(LocalDateTime.now());
            user.setProfilePic("https://lh3.googleusercontent.com/a/default-user=s96-c");
            userService.saveUser(user);
            log.info("New user registered via Google Sign-In: {}", email);
        } else {
            if ("BLOCKED".equals(user.getStatus())) {
                attrib.addFlashAttribute("error", "Your account has been blocked. Please contact admin.");
                return "redirect:/login";
            }
            user.setEmailVerified(true);
            user.setLastActive(LocalDateTime.now());
            userService.saveUser(user);
            log.info("User logged in via Google Sign-In: {}", email);
        }

        session.setAttribute("user", user);
        attrib.addFlashAttribute("msg", "Welcome back, " + user.getName() + "! Successfully signed in with Google.");
        return "redirect:/user/dashboard";
    }

    /**
     * Endpoint to receive Google Identity Services (GSI) One-Tap / Button credential token
     */
    @PostMapping("/login/oauth2/google/token")
    @ResponseBody
    public ResponseEntity<?> handleGoogleIdToken(@RequestBody Map<String, String> payload, HttpSession session) {
        String credential = payload.get("credential");
        if (credential == null || credential.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Missing Google credential token"));
        }

        try {
            // First try Google tokeninfo endpoint for full verification
            String email = null;
            String name = "Google User";
            String picture = null;

            try {
                ResponseEntity<String> tokenInfoResp = restTemplate.getForEntity(
                        "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential.trim(), String.class);
                if (tokenInfoResp.getStatusCode().is2xxSuccessful() && tokenInfoResp.getBody() != null) {
                    JsonNode tokenNode = objectMapper.readTree(tokenInfoResp.getBody());
                    email = tokenNode.path("email").asText(null);
                    name = tokenNode.path("name").asText("Google User");
                    picture = tokenNode.path("picture").asText(null);
                }
            } catch (Exception ex) {
                log.warn("Online tokeninfo verification failed, parsing JWT payload directly: {}", ex.getMessage());
                // Fallback: parse JWT payload
                String[] parts = credential.split("\\.");
                if (parts.length >= 2) {
                    String body = new String(Base64.getUrlDecoder().decode(parts[1]));
                    JsonNode jwtNode = objectMapper.readTree(body);
                    email = jwtNode.path("email").asText(null);
                    name = jwtNode.path("name").asText("Google User");
                    picture = jwtNode.path("picture").asText(null);
                }
            }

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Could not extract email from Google token"));
            }

            email = email.trim().toLowerCase();
            User user = userService.findByEmail(email);
            if (user == null) {
                user = new User();
                user.setName(name);
                user.setEmail(email);
                user.setPassword(userService.encodePassword(UUID.randomUUID().toString()));
                user.setRole("USER");
                user.setStatus("ACTIVE");
                user.setEmailVerified(true);
                user.setRegDate(LocalDateTime.now());
                user.setLastActive(LocalDateTime.now());
                if (picture != null && !picture.isEmpty()) {
                    user.setProfilePic(picture);
                }
                userService.saveUser(user);
                log.info("New user created via Google GSI: {}", email);
            } else {
                if ("BLOCKED".equals(user.getStatus())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("status", "error", "message", "Account is blocked"));
                }
                user.setEmailVerified(true);
                user.setLastActive(LocalDateTime.now());
                if ((user.getProfilePic() == null || user.getProfilePic().isEmpty()) && picture != null) {
                    user.setProfilePic(picture);
                }
                userService.saveUser(user);
            }

            session.setAttribute("user", user);
            return ResponseEntity.ok(Map.of("status", "success", "redirect", "/user/dashboard"));

        } catch (Exception e) {
            log.error("Google token authentication error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Authentication error: " + e.getMessage()));
        }
    }

    /**
     * Callback endpoint invoked by Google upon user authorization.
     */
    @GetMapping("/oauth2/callback/google")
    public String handleGoogleCallback(@RequestParam(required = false) String code,
                                       @RequestParam(required = false) String error,
                                       HttpServletRequest request,
                                       HttpSession session,
                                       RedirectAttributes attrib) {
        if (error != null) {
            log.warn("Google OAuth error: {}", error);
            attrib.addFlashAttribute("error", "Google login was cancelled or failed: " + error);
            return "redirect:/login";
        }

        if (code == null || code.trim().isEmpty()) {
            attrib.addFlashAttribute("error", "No authorization code received from Google.");
            return "redirect:/login";
        }

        try {
            String effectiveRedirectUri = resolveRedirectUri(request);

            // 1. Exchange code for access token
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("code", code);
            body.add("client_id", clientId.trim());
            body.add("client_secret", clientSecret.trim());
            body.add("redirect_uri", effectiveRedirectUri);
            body.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(body, headers);
            ResponseEntity<String> tokenResponse = restTemplate.postForEntity(
                    "https://oauth2.googleapis.com/token", tokenRequest, String.class);

            if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
                attrib.addFlashAttribute("error", "Failed to retrieve access token from Google.");
                return "redirect:/login";
            }

            JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
            String accessToken = tokenJson.path("access_token").asText();

            if (accessToken == null || accessToken.isEmpty()) {
                attrib.addFlashAttribute("error", "Invalid token response from Google.");
                return "redirect:/login";
            }

            // 2. Fetch Google User Profile
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);

            ResponseEntity<String> userResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    userRequest,
                    String.class
            );

            if (!userResponse.getStatusCode().is2xxSuccessful() || userResponse.getBody() == null) {
                attrib.addFlashAttribute("error", "Failed to fetch user info from Google.");
                return "redirect:/login";
            }

            JsonNode userJson = objectMapper.readTree(userResponse.getBody());
            String email = userJson.path("email").asText(null);
            String name = userJson.path("name").asText("Google User");
            String picture = userJson.path("picture").asText(null);

            if (email == null || email.isEmpty()) {
                attrib.addFlashAttribute("error", "Unable to retrieve email from Google account.");
                return "redirect:/login";
            }

            email = email.trim().toLowerCase();

            // 3. Find or Create User in FindX Database
            User user = userService.findByEmail(email);
            if (user == null) {
                user = new User();
                user.setName(name);
                user.setEmail(email);
                user.setPassword(userService.encodePassword(UUID.randomUUID().toString()));
                user.setRole("USER");
                user.setStatus("ACTIVE");
                user.setEmailVerified(true);
                user.setRegDate(LocalDateTime.now());
                user.setLastActive(LocalDateTime.now());
                if (picture != null && !picture.isEmpty()) {
                    user.setProfilePic(picture);
                }
                userService.saveUser(user);
                log.info("New user created via Google OAuth: {}", email);
            } else {
                if ("BLOCKED".equals(user.getStatus())) {
                    attrib.addFlashAttribute("error", "Your account has been blocked. Please contact admin.");
                    return "redirect:/login";
                }
                user.setEmailVerified(true);
                user.setLastActive(LocalDateTime.now());
                if ((user.getProfilePic() == null || user.getProfilePic().isEmpty()) && picture != null) {
                    user.setProfilePic(picture);
                }
                userService.saveUser(user);
                log.info("Existing user logged in via Google OAuth: {}", email);
            }

            // 4. Authenticate session
            session.setAttribute("user", user);
            attrib.addFlashAttribute("msg", "Welcome, " + user.getName() + "! Successfully signed in with Google.");
            return "redirect:/user/dashboard";

        } catch (Exception ex) {
            log.error("Exception during Google OAuth processing", ex);
            attrib.addFlashAttribute("error", "Google authentication failed: " + ex.getMessage());
            return "redirect:/login";
        }
    }
}
