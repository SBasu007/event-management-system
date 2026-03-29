package com.example.eventservice.service;

import com.example.eventservice.model.Event;
import com.example.eventservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository repo;

    public Event createEvent(Event event) {
        return repo.save(event);
    }

    public List<Event> getAllEvents() {
        return repo.findAll();
    }

    public List<Event> getEventsByOrganizerId(UUID organizerId) {
        return repo.findByOrganizerId(organizerId);
    }

    public Event getEventById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Event updateEvent(Long id, Event event) {
        event.setId(id);
        return repo.save(event);
    }

    public void deleteEvent(Long id) {
        repo.deleteById(id);
    }
}