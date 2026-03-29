package com.example.eventservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // e.g. catering, decoration, music
    @Column(nullable = false)
    private String type;

    private String contact;

    @Column(name = "img_url")
    private String imgUrl;

    private Double price;
}