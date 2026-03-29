package com.example.eventservice.repository;

import com.example.eventservice.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    // filter
    List<Vendor> findByType(String type);
}