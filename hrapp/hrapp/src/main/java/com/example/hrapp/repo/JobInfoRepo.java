package com.example.hrapp.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hrapp.model.JobInfo;

public interface JobInfoRepo extends JpaRepository<JobInfo, Integer>{

}
