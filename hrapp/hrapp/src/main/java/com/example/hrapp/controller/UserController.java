package com.example.hrapp.controller;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.hrapp.dto.ResponseDto;
import com.example.hrapp.model.JobInfo;
import com.example.hrapp.model.JobSeeker;
import com.example.hrapp.model.Response;
import com.example.hrapp.repo.JobInfoRepo;
import com.example.hrapp.repo.JobSeekerRepo;
import com.example.hrapp.repo.ResponseRepo;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
public class UserController {

	@Autowired
	JobSeekerRepo jsrepo;
	@Autowired
	ResponseRepo rrepo;
	@Autowired
	JobInfoRepo jrepo;
	
	@GetMapping("/user/userdash")
	public String showUserDash(HttpSession session, RedirectAttributes attrib) {
		if(session.getAttribute("user")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/login";			
		}
		return "user/userdash";
	}
	@GetMapping("/user/logout")
	public String userLogout(HttpSession session, RedirectAttributes attrib) {
		if(session.getAttribute("user")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/login";			
		}
		session.invalidate();
		attrib.addFlashAttribute("msg", "You have logged-out successfully");
		return "redirect:/login";
	}
	@GetMapping("/user/changepwd")
	public String changePwd(HttpSession session, RedirectAttributes attrib) {
		if(session.getAttribute("user")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/login";			
		}
		return "/user/changepwd";
	}
	@PostMapping("/user/changepwd")
	public String changeUserPassword(HttpSession session, HttpServletRequest request, RedirectAttributes attrib) {
		if(session.getAttribute("user")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/login";			
		}
		String oldpassword=request.getParameter("oldpassword");
		String newpassword=request.getParameter("newpassword");
		String confirmpassword=request.getParameter("confirmpassword");
		if(!newpassword.equals(confirmpassword)) {
			attrib.addFlashAttribute("msg", "Newpassword and confirmpassword are not matched!!");
			return "redirect:/user/changepwd";
		}
		JobSeeker js=(JobSeeker)session.getAttribute("user");
		if(!oldpassword.equals(js.getPassword())) {
			attrib.addFlashAttribute("msg", "Oldpassword is not matched!!");
			return "redirect:/user/changepwd";
		}
		js.setPassword(newpassword);
		jsrepo.save(js);
		return "redirect:/user/logout";
		
	}
	@GetMapping("/user/viewprofile")
	public String viewProfile(HttpSession session, Model model, RedirectAttributes attrib) {
		if(session.getAttribute("user")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/login";			
		}
		JobSeeker js=(JobSeeker)session.getAttribute("user");
		model.addAttribute("js", js);
		return "/user/viewprofile";
	}
	@GetMapping("/user/giveresponse")
	public String giveResponse(HttpSession session, Model model, RedirectAttributes attrib) {
		if(session.getAttribute("user")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/login";			
		}		
		ResponseDto rdto=new ResponseDto();
		model.addAttribute("rdto", rdto);
		return "/user/giveresponse";
	}
	@PostMapping("/user/giveresponse")
	public String saveResponse(HttpSession session, @ModelAttribute ResponseDto rdto, RedirectAttributes attrib) {
		if(session.getAttribute("user")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/login";			
		}	
		JobSeeker js=(JobSeeker)session.getAttribute("user");
		Response res=new Response();
		res.setName(js.getName());
		res.setContactno(js.getContactno());
		res.setEmailaddress(js.getEmailaddress());
		res.setResponsetype(rdto.getResponsetype());
		res.setSubject(rdto.getSubject());
		res.setResponsetext(rdto.getResponsetext());
		Date dt=new Date();
		SimpleDateFormat df=new SimpleDateFormat("dd/MM/yyyy");
		String posteddate=df.format(dt);
		res.setPosteddate(posteddate);
		rrepo.save(res);
		attrib.addFlashAttribute("msg", "Your response is submitted");
		return "redirect:/user/giveresponse";
	}
	@GetMapping("/user/viewjobs")
	public String viewJobs(HttpSession session, RedirectAttributes attrib, Model model) {
		if(session.getAttribute("user")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/login";			
		}
		List<JobInfo> ji=jrepo.findAll();
		model.addAttribute("ji", ji);
		return "/user/viewjobs";
	}
}
