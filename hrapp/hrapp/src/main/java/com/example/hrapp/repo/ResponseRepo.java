package com.example.hrapp.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hrapp.model.Response;

public interface ResponseRepo extends JpaRepository<Response, Integer> {

	List<Response> findByResponsetype(String string);

}
