package com.example.findx.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ─── Send OTP Email ───────────────────────────────────────────────────
    public void sendOtpEmail(String toEmail, String userName, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("FindX — Email Verification OTP");

            String html = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;background:#f8faff;border-radius:16px;overflow:hidden;">
                  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
                    <h1 style="color:#fff;font-size:2rem;margin:0;letter-spacing:-1px;">Find<span style="color:#fde68a;">X</span></h1>
                    <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;">AI-Powered Lost & Found</p>
                  </div>
                  <div style="padding:32px;">
                    <h2 style="color:#1e293b;margin-top:0;">Hi %s! 👋</h2>
                    <p style="color:#64748b;">Use the OTP below to verify your email address. It expires in <strong>15 minutes</strong>.</p>
                    <div style="background:#ede9fe;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
                      <div style="font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#6366f1;">%s</div>
                      <p style="color:#7c3aed;font-size:0.85rem;margin:8px 0 0;">One-Time Password</p>
                    </div>
                    <p style="color:#94a3b8;font-size:0.85rem;">If you didn't create a FindX account, you can safely ignore this email.</p>
                  </div>
                  <div style="background:#f1f5f9;padding:16px;text-align:center;">
                    <p style="color:#94a3b8;font-size:0.75rem;margin:0;">© 2024 FindX. All rights reserved.</p>
                  </div>
                </div>
                """.formatted(userName, otp);

            helper.setText(html, true);
            mailSender.send(message);

            System.out.println("[FindX Email] OTP sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("[FindX Email ERROR] Failed to send OTP to " + toEmail + ": " + e.getMessage());
            // Print OTP to console as fallback
            System.out.println("============================================================");
            System.out.println("  [FindX FALLBACK OTP] Email: " + toEmail + "  |  OTP: " + otp);
            System.out.println("============================================================");
        }
    }

    // ─── Send Password Reset Email (with 6-digit OTP & Dynamic Link) ───
    public void sendPasswordResetEmail(String toEmail, String userName, String resetLink, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("FindX — Password Reset Code: " + otpCode);

            String html = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;background:#f8faff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
                  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;text-align:center;">
                    <h1 style="color:#fff;font-size:2rem;margin:0;letter-spacing:-1px;">Find<span style="color:#fde68a;">X</span></h1>
                    <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:0.95rem;">AI-Powered Lost & Found</p>
                  </div>
                  <div style="padding:28px 24px;">
                    <h2 style="color:#1e293b;margin-top:0;font-size:1.25rem;">Hi %s! 🔑</h2>
                    <p style="color:#64748b;font-size:0.95rem;line-height:1.5;">We received a request to reset your password. You can reset it easily using either option:</p>
                    
                    <!-- Option 1: 6-digit OTP Code -->
                    <div style="background:#ede9fe;border-radius:12px;padding:20px;text-align:center;margin:20px 0;border:1px dashed #a78bfa;">
                      <p style="color:#7c3aed;font-size:0.8rem;margin:0 0 6px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Option 1: 6-Digit Reset Code</p>
                      <div style="font-size:2.5rem;font-weight:800;letter-spacing:10px;color:#6366f1;">%s</div>
                      <p style="color:#64748b;font-size:0.8rem;margin:6px 0 0;">Enter this code on the website reset screen</p>
                    </div>

                    <!-- Option 2: Direct Reset Link -->
                    <div style="text-align:center;margin:22px 0 16px;">
                      <p style="color:#64748b;font-size:0.85rem;margin:0 0 10px;">Or click the button below directly:</p>
                      <a href="%s"
                         style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;
                                padding:12px 28px;border-radius:10px;font-weight:700;font-size:0.95rem;display:inline-block;box-shadow:0 4px 12px rgba(99,102,241,0.3);">
                        Reset Password Online →
                      </a>
                    </div>

                    <p style="color:#94a3b8;font-size:0.8rem;margin-top:20px;line-height:1.4;">Valid for <strong>30 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
                  </div>
                  <div style="background:#f1f5f9;padding:14px;text-align:center;">
                    <p style="color:#94a3b8;font-size:0.75rem;margin:0;">© 2024 FindX. All rights reserved.</p>
                  </div>
                </div>
                """.formatted(userName, otpCode, resetLink);

            helper.setText(html, true);
            mailSender.send(message);

            System.out.println("[FindX Email] Password reset email sent to: " + toEmail + " (OTP: " + otpCode + ")");
        } catch (Exception e) {
            System.err.println("[FindX Email ERROR] Failed to send reset email to " + toEmail + ": " + e.getMessage());
            System.out.println("============================================================");
            System.out.println("  [FindX FALLBACK RESET] Email: " + toEmail + " | OTP: " + otpCode);
            System.out.println("  Reset Link: " + resetLink);
            System.out.println("============================================================");
        }
    }
}
