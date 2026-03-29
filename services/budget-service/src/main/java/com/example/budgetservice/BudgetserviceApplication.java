package com.example.budgetservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BudgetserviceApplication {

	public static void main(String[] args) {

		SpringApplication.run(BudgetserviceApplication.class, args);
		System.out.println("Server running on 5003");
	}

}
