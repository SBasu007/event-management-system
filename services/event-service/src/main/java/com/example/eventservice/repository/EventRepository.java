package com.example.eventservice.repository;

import com.example.eventservice.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, Long> {
	List<Event> findByOrganizerId(UUID organizerId);
}