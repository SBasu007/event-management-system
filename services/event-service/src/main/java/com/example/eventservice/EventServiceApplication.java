package com.example.eventservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EventServiceApplication {

	public static void main(String[] args) {

		SpringApplication.run(EventServiceApplication.class, args);
		System.out.println("Server running on port 5002");
	}

}
