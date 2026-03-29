package com.example.eventservice.controller;

import com.example.eventservice.model.Venue;
import com.example.eventservice.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService service;

    @PostMapping
    public Venue create(@RequestBody Venue venue) {
        return service.createVenue(venue);
    }

    @GetMapping
    public List<Venue> getAll() {
        return service.getAllVenues();
    }

    @GetMapping("/{id}")
    public Venue getById(@PathVariable Long id) {
        return service.getVenueById(id);
    }

    @PutMapping("/{id}")
    public Venue update(@PathVariable Long id, @RequestBody Venue venue) {
        return service.updateVenue(id, venue);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteVenue(id);
    }
}