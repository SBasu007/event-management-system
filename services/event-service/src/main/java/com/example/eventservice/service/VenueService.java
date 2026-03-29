package com.example.eventservice.service;

import com.example.eventservice.model.Venue;
import com.example.eventservice.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository repo;

    public Venue createVenue(Venue venue) {
        return repo.save(venue);
    }

    public List<Venue> getAllVenues() {
        return repo.findAll();
    }

    public Venue getVenueById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
    }

    public Venue updateVenue(Long id, Venue updated) {
        Venue existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        existing.setName(updated.getName());
        existing.setLocation(updated.getLocation());
        existing.setCapacity(updated.getCapacity());
        existing.setPrice(updated.getPrice());

        return repo.save(existing);
    }

    public void deleteVenue(Long id) {
        repo.deleteById(id);
    }
}