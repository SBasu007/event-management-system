package com.example.eventservice.controller;

import com.example.eventservice.model.EventVendor;
import com.example.eventservice.service.EventVendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/event-vendors")
@RequiredArgsConstructor
public class EventVendorController {

    private final EventVendorService service;

    // assign vendor to event
    @PostMapping
    public EventVendor assign(
            @RequestParam Long eventId,
            @RequestParam Long vendorId
    ) {
        return service.assignVendor(eventId, vendorId);
    }

    // get vendors for event
    @GetMapping("/event/{eventId}")
    public List<EventVendor> getByEvent(@PathVariable Long eventId) {
        return service.getVendorsForEvent(eventId);
    }

    // get events for vendor
    @GetMapping("/vendor/{vendorId}")
    public List<EventVendor> getByVendor(@PathVariable Long vendorId) {
        return service.getEventsForVendor(vendorId);
    }

    // remove mapping
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.remove(id);
    }
}
