package com.example.hrapp.controller;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.hrapp.dto.AdminLoginDto;
import com.example.hrapp.dto.EnquiryDto;
import com.example.hrapp.dto.JobSeekerDto;
import com.example.hrapp.model.AdminLogin;
import com.example.hrapp.model.Enquiry;
import com.example.hrapp.model.JobSeeker;
import com.example.hrapp.repo.AdminLoginRepo;
import com.example.hrapp.repo.EnquiryRepo;
import com.example.hrapp.repo.JobSeekerRepo;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
public class MainController {

	@Autowired
	EnquiryRepo erepo;
	@Autowired
	JobSeekerRepo jsrepo;
	@Autowired
	AdminLoginRepo alrepo;
	
	@GetMapping("/")
	public String showIndex() {
		return "index";
	}
	@GetMapping("/aboutus")
	public String showAboutUs() {
		return "aboutus";
	}
	@GetMapping("/registration")
	public String registration(Model model) {
		JobSeekerDto jdto=new JobSeekerDto();
		model.addAttribute("jdto", jdto);
		return "registration";
	}
	@GetMapping("/login")
	public String login() {
		return "login";
	}
	@GetMapping("/contactus")
	public String contactus(Model model) {
		EnquiryDto edto=new EnquiryDto();
		model.addAttribute("edto", edto);
		return "contactus";
	}
	@PostMapping("/contactus")
	public String saveEnquiry(@ModelAttribute EnquiryDto edto, RedirectAttributes attrib) {
		Enquiry enq=new Enquiry();
		enq.setName(edto.getName());
		enq.setContactno(edto.getContactno());
		enq.setEmailaddress(edto.getEmailaddress());
		enq.setEnquirytext(edto.getEnquirytext());
		erepo.save(enq);
		attrib.addFlashAttribute("msg", "Enquiry is saved successfully");
		return "redirect:/contactus";
	}
	@PostMapping("/registration")
	public String saveJobSeeker(@ModelAttribute JobSeekerDto jdto, RedirectAttributes attrib) {
		JobSeeker js=new JobSeeker();
		js.setName(jdto.getName());
		js.setGender(jdto.getGender());
		js.setAddress(jdto.getAddress());
		js.setContactno(jdto.getContactno());
		js.setEmailaddress(jdto.getEmailaddress());
		js.setQualification(jdto.getQualification());
		js.setExperience(jdto.getExperience());
		js.setKeyskills(jdto.getKeyskills());
		js.setPassword(jdto.getPassword());
		Date dt=new Date();
		SimpleDateFormat df=new SimpleDateFormat("dd/MM/yyyy");
		String regdate=df.format(dt);
		js.setRegdate(regdate);
		jsrepo.save(js);
		attrib.addFlashAttribute("msg", "Jobseeker details is saved successfully");
		return "redirect:/registration";
	}
	@PostMapping("/login")
	public String loginUser(HttpServletRequest request, RedirectAttributes attrib, HttpSession session) {
		String emailaddress=request.getParameter("emailaddress");
		String password=request.getParameter("password");
		JobSeeker user=jsrepo.findByEmailaddressAndPassword(emailaddress, password);
		//select * from jobseeker where emailaddress=emailaddress and password=password;
		if(user!=null) {
			//attrib.addFlashAttribute("msg", "Valid User");
			session.setAttribute("user", user);
			return "redirect:/user/userdash";
		}
		else {
			attrib.addFlashAttribute("msg", "Invalid User");
			return "redirect:/login";
		}		
	}
	@GetMapping("/adminlogin")
	public String adminLogin(Model model) {
		AdminLoginDto aldto=new AdminLoginDto();
		model.addAttribute("aldto", aldto);
		return "adminlogin";
	}
	@PostMapping("/adminlogin")
	public String validateAdminLogin(@ModelAttribute AdminLoginDto aldto, RedirectAttributes attrib, HttpSession session) {
		
		String adminid=aldto.getAdminid();
		String password=aldto.getPassword();
		AdminLogin admin=alrepo.findByAdminidAndPassword(adminid, password);
		if(admin!=null) {
			//attrib.addFlashAttribute("msg", "Valid User");
			session.setAttribute("admin", admin);
			return "redirect:/admin/admindash";
		}
		else {
			attrib.addFlashAttribute("msg", "Invalid User");
			return "redirect:/adminlogin";
		}
		
	}
}
