package com.example.eventservice.service;

import com.example.eventservice.model.Vendor;
import com.example.eventservice.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository repo;

    public Vendor createVendor(Vendor vendor) {
        return repo.save(vendor);
    }

    public List<Vendor> getAllVendors() {
        return repo.findAll();
    }

    public Vendor getVendorById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    public List<Vendor> getByType(String type) {
        return repo.findByType(type);
    }

    public Vendor updateVendor(Long id, Vendor updated) {
        Vendor existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setContact(updated.getContact());
        existing.setImgUrl(updated.getImgUrl());
        existing.setPrice(updated.getPrice());

        return repo.save(existing);
    }

    public void deleteVendor(Long id) {
        repo.deleteById(id);
    }
}