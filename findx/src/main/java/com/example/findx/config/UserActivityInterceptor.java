package com.example.findx.config;

import com.example.findx.model.User;
import com.example.findx.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
public class UserActivityInterceptor implements HandlerInterceptor {

    @Autowired
    private UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            User user = (User) session.getAttribute("user");
            if (user != null && user.getId() != null) {
                // Throttle updates: only update DB if lastActive was > 1 minute ago or null
                LocalDateTime now = LocalDateTime.now();
                if (user.getLastActive() == null || user.getLastActive().isBefore(now.minusMinutes(1))) {
                    user.setLastActive(now);
                    userService.updateLastActiveById(user.getId());
                    session.setAttribute("user", user);
                }
            }
        }
        return true;
    }
}
