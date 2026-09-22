package com.example.hrapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="jobseeker")
public class JobSeeker {

	@Column(length = 50)
	private String name; //name varchar(50)
	@Column(length=6)
	private String gender;
	@Column(length=500)
	private String address;
	@Column(length=15)
	private String contactno;
	@Id
	@Column(length=50)
	private String emailaddress;
	@Column(length = 50)
	private String qualification;
	@Column(length=50)
	private String experience;
	@Column(length = 500)
	private String keyskills;
	@Column(length = 30)
	private String regdate;
	@Column(length = 30)
	private String password;
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getGender() {
		return gender;
	}
	public void setGender(String gender) {
		this.gender = gender;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getContactno() {
		return contactno;
	}
	public void setContactno(String contactno) {
		this.contactno = contactno;
	}
	public String getEmailaddress() {
		return emailaddress;
	}
	public void setEmailaddress(String emailaddress) {
		this.emailaddress = emailaddress;
	}
	public String getQualification() {
		return qualification;
	}
	public void setQualification(String qualification) {
		this.qualification = qualification;
	}
	public String getExperience() {
		return experience;
	}
	public void setExperience(String experience) {
		this.experience = experience;
	}
	public String getKeyskills() {
		return keyskills;
	}
	public void setKeyskills(String keyskills) {
		this.keyskills = keyskills;
	}
	public String getRegdate() {
		return regdate;
	}
	public void setRegdate(String regdate) {
		this.regdate = regdate;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	
	
}
