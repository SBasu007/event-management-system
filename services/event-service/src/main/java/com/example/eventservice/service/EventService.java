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
        if (event.getActive() == null) {
            event.setActive(true);
        }
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
        Event existing = getEventById(id);

        existing.setTitle(event.getTitle());
        existing.setDescription(event.getDescription());
        existing.setEventDate(event.getEventDate());
        existing.setEventTime(event.getEventTime());
        existing.setImgUrl(event.getImgUrl());
        existing.setVenueId(event.getVenueId());
        existing.setOrganizerId(event.getOrganizerId());

        if (event.getActive() != null) {
            existing.setActive(event.getActive());
        }

        return repo.save(existing);
    }

    public Event disableEvent(Long id) {
        Event existing = getEventById(id);
        existing.setActive(false);
        return repo.save(existing);
    }

    public Event enableEvent(Long id) {
        Event existing = getEventById(id);
        existing.setActive(true);
        return repo.save(existing);
    }

    public void deleteEvent(Long id) {
        repo.deleteById(id);
    }
}