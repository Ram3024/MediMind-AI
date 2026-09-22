package com.example.hrapp.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hrapp.model.JobSeeker;

public interface JobSeekerRepo extends JpaRepository<JobSeeker, String>{

	JobSeeker findByEmailaddressAndPassword(String emailaddress, String password);

}
