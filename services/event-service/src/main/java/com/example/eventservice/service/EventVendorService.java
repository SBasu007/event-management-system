package com.example.eventservice.service;

import com.example.eventservice.model.EventVendor;
import com.example.eventservice.repository.EventVendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventVendorService {

    private final EventVendorRepository repo;

    //  Assign vendor to event
    public EventVendor assignVendor(Long eventId, Long vendorId) {
        EventVendor ev = new EventVendor();
        ev.setEventId(eventId);
        ev.setVendorId(vendorId);

        return repo.save(ev);
    }

    //  Get vendors for event
    public List<EventVendor> getVendorsForEvent(Long eventId) {
        return repo.findByEventId(eventId);
    }

    //  Get events for vendor
    public List<EventVendor> getEventsForVendor(Long vendorId) {
        return repo.findByVendorId(vendorId);
    }

    //  Remove mapping
    public void remove(Long id) {
        repo.deleteById(id);
    }
}