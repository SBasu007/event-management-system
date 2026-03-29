package com.example.budgetservice.service;

import com.example.budgetservice.model.*;
import com.example.budgetservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepo;
    private final ExpenseRepository expenseRepo;

    // create/update budget
    public Budget setBudget(Budget budget) {
        return budgetRepo.save(budget);
    }

    // add expense
    public Expense addExpense(Expense expense) {
        return expenseRepo.save(expense);
    }

    // get expenses
    public List<Expense> getExpenses(Long eventId) {
        return expenseRepo.findByEventId(eventId);
    }

    // remaining budget
    public Double getRemainingBudget(Long eventId) {
        Budget budget = budgetRepo.findByEventId(eventId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        List<Expense> expenses = expenseRepo.findByEventId(eventId);

        double totalSpent = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        return budget.getTotalAmount() - totalSpent;
    }
}