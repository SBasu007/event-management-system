package com.example.budgetservice.repository;

import com.example.budgetservice.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByEventId(Long eventId);
}