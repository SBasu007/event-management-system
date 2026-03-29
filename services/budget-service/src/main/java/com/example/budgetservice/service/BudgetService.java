package com.example.budgetservice.service;

import com.example.budgetservice.model.*;
import com.example.budgetservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepo;
    private final ExpenseRepository expenseRepo;

    // create/update budget
    public Budget setBudget(Budget budget) {
        budgetRepo.findByEventId(budget.getEventId()).ifPresent(existing -> {
            budget.setId(existing.getId());
        });
        return budgetRepo.save(budget);
    }

    public Budget getBudgetByEventId(Long eventId) {
        return budgetRepo.findByEventId(eventId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
    }

    // add expense
    public Expense addExpense(Expense expense) {
        return expenseRepo.save(expense);
    }

    @Transactional
    public Expense updateExpense(Long id, Expense expense) {
        Expense existing = expenseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        existing.setCategory(expense.getCategory());
        existing.setAmount(expense.getAmount());

        return expenseRepo.save(existing);
    }

    @Transactional
    public void deleteExpense(Long id) {
        expenseRepo.deleteById(id);
    }

    // get expenses
    public List<Expense> getExpenses(Long eventId) {
        return expenseRepo.findByEventId(eventId);
    }

    @Transactional
    public void clearAutoExpenses(Long eventId) {
        expenseRepo.deleteByEventIdAndCategory(eventId, "Venue");
        expenseRepo.deleteByEventIdAndCategoryStartingWith(eventId, "Vendor:");
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