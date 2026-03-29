package com.example.eventservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    private LocalDate eventDate;   //  date only
    private LocalTime eventTime;   //  time only

    private String imgUrl;
    private Long venueId;
    private UUID organizerId;
}