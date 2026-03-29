package com.example.eventservice.controller;

import com.example.eventservice.model.Event;
import com.example.eventservice.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService service;

    @PostMapping
    public Event create(@RequestBody Event event) {
        return service.createEvent(event);
    }

    @GetMapping
    public List<Event> getAll() {
        return service.getAllEvents();
    }

    @GetMapping("/organizer/{organizerId}")
    public List<Event> getByOrganizerId(@PathVariable UUID organizerId) {
        return service.getEventsByOrganizerId(organizerId);
    }

    @GetMapping("/{id}")
    public Event getById(@PathVariable Long id) {
        return service.getEventById(id);
    }

    @PutMapping("/{id}")
    public Event update(@PathVariable Long id, @RequestBody Event event) {
        return service.updateEvent(id, event);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteEvent(id);
    }
}