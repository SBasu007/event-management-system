package com.example.eventservice.controller;

import com.example.eventservice.model.Vendor;
import com.example.eventservice.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService service;

    @PostMapping
    public Vendor create(@RequestBody Vendor vendor) {
        return service.createVendor(vendor);
    }

    @GetMapping
    public List<Vendor> getAll() {
        return service.getAllVendors();
    }

    @GetMapping("/{id}")
    public Vendor getById(@PathVariable Long id) {
        return service.getVendorById(id);
    }

    // 🔥 filter by type
    @GetMapping("/type/{type}")
    public List<Vendor> getByType(@PathVariable String type) {
        return service.getByType(type);
    }

    @PutMapping("/{id}")
    public Vendor update(@PathVariable Long id, @RequestBody Vendor vendor) {
        return service.updateVendor(id, vendor);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteVendor(id);
    }
}