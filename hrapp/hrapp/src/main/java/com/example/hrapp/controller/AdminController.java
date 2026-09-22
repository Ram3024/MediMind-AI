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

import com.example.hrapp.dto.JobInfoDto;
import com.example.hrapp.model.Enquiry;
import com.example.hrapp.model.JobInfo;
import com.example.hrapp.model.JobSeeker;
import com.example.hrapp.model.Response;
import com.example.hrapp.repo.EnquiryRepo;
import com.example.hrapp.repo.JobInfoRepo;
import com.example.hrapp.repo.JobSeekerRepo;
import com.example.hrapp.repo.ResponseRepo;

import jakarta.servlet.http.HttpSession;

@Controller
public class AdminController {
	@Autowired
	JobSeekerRepo jsrepo;
	@Autowired
	EnquiryRepo erepo;
	@Autowired
	ResponseRepo rrepo;
	@Autowired
	JobInfoRepo jrepo;

	@GetMapping("/admin/admindash")
	public String showAdminDash(HttpSession session, RedirectAttributes attrib) {
		
		if(session.getAttribute("admin")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/adminlogin";
		}
		return "/admin/admindash";
	}
	@GetMapping("/admin/logout")
	public String logout(HttpSession session, RedirectAttributes attrib) {
		if(session.getAttribute("admin")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/adminlogin";
		}
		session.invalidate();
		attrib.addFlashAttribute("msg", "You have logged-out successfully!!");
		return "redirect:/adminlogin";
	}
	@GetMapping("/admin/viewjobseekers")
	public String viewJobSeekers(HttpSession session, RedirectAttributes attrib, Model model) {
		if(session.getAttribute("admin")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/adminlogin";
		}
		List<JobSeeker> js=jsrepo.findAll(); // select * from jobseeker;
		model.addAttribute("js", js);
		return "/admin/viewjobseekers";
		
	}
	@GetMapping("/admin/viewenquiries")
	public String viewEnquiries(HttpSession session, RedirectAttributes attrib, Model model) {
		if(session.getAttribute("admin")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/adminlogin";
		}
		List<Enquiry> enq=erepo.findAll();
		model.addAttribute("enq", enq);
		return "/admin/viewenquiries";
	}
	@GetMapping("/admin/viewfeedbacks")
	public String viewFeedbacks(HttpSession session, RedirectAttributes attrib, Model model) {
		if(session.getAttribute("admin")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/adminlogin";
		}
		//select * from response where responsetype='feed'
		List<Response> res=rrepo.findByResponsetype("feed");
		model.addAttribute("res", res);
		return "/admin/viewfeedbacks";
	}
	@GetMapping("/admin/viewcomplaints")
	public String viewComplaints(HttpSession session, RedirectAttributes attrib, Model model) {
		if(session.getAttribute("admin")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/adminlogin";
		}
		//select * from response where responsetype='comp'
		List<Response> res=rrepo.findByResponsetype("comp");
		model.addAttribute("res", res);
		return "/admin/viewcomplaints";
	}
	@GetMapping("/admin/addjob")
	public String addJob(HttpSession session, RedirectAttributes attrib, Model model) {
		if(session.getAttribute("admin")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/adminlogin";
		}
		JobInfoDto jdto=new JobInfoDto();
		model.addAttribute("jdto", jdto);
		return "/admin/addjob";
	}
	@PostMapping("/admin/addjob")
	public String saveJob(HttpSession session, RedirectAttributes attrib, @ModelAttribute JobInfoDto jdto) {
		if(session.getAttribute("admin")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/adminlogin";
		}
		JobInfo ji=new JobInfo();
		ji.setTitle(jdto.getTitle());
		ji.setDescription(jdto.getDescription());
		ji.setLocation(jdto.getLocation());
		ji.setJobtype(jdto.getJobtype());
		ji.setSalary(jdto.getSalary());
		ji.setLastdate(jdto.getLastdate());
		Date dt=new Date();
		SimpleDateFormat df=new SimpleDateFormat("dd-MM-yyyy");
		String posteddate=df.format(dt);
		ji.setPosteddate(posteddate);
		jrepo.save(ji);
		attrib.addFlashAttribute("msg", "New Job is added successfully");
		return "redirect:/admin/addjob";
	}
	@GetMapping("/admin/viewpostedjobs")
	public String viewPostedJobs(HttpSession session, RedirectAttributes attrib, Model model) {
		if(session.getAttribute("admin")==null) {
			attrib.addFlashAttribute("msg", "First do login!!");
			return "redirect:/adminlogin";
		}
		List<JobInfo> ji=jrepo.findAll();
		model.addAttribute("ji", ji);
		return "/admin/viewpostedjobs";
	}
}
