package com.example.eventservice.repository;

import com.example.eventservice.model.EventVendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventVendorRepository extends JpaRepository<EventVendor, Long> {

    List<EventVendor> findByEventId(Long eventId);
    List<EventVendor> findByVendorId(Long vendorId);
}