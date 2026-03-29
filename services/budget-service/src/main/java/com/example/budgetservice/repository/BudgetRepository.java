package com.example.budgetservice.repository;

import com.example.budgetservice.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByEventId(Long eventId);
}