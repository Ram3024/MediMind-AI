package com.example.hrapp.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hrapp.model.Enquiry;

public interface EnquiryRepo extends JpaRepository<Enquiry, Integer> {

}
