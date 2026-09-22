package com.example.hrapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="response")
public class Response {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	@Column(length = 50)
	private String name;
	@Column(length = 15)
	private String contactno;
	@Column(length=50)
	private String emailaddress;
	@Column(length=50)
	private String responsetype;
	@Column(length=100)
	private String subject;
	@Column(length=1000)
	private String responsetext;
	@Column(length=30)
	private String posteddate;
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
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
	public String getResponsetype() {
		return responsetype;
	}
	public void setResponsetype(String responsetype) {
		this.responsetype = responsetype;
	}
	public String getSubject() {
		return subject;
	}
	public void setSubject(String subject) {
		this.subject = subject;
	}
	public String getResponsetext() {
		return responsetext;
	}
	public void setResponsetext(String responsetext) {
		this.responsetext = responsetext;
	}
	public String getPosteddate() {
		return posteddate;
	}
	public void setPosteddate(String posteddate) {
		this.posteddate = posteddate;
	}
	
	
}
