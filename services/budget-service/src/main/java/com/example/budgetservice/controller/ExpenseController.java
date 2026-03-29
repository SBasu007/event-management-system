package com.example.budgetservice.controller;

import com.example.budgetservice.model.Expense;
import com.example.budgetservice.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final BudgetService service;

    @PostMapping
    public Expense add(@RequestBody Expense expense) {
        return service.addExpense(expense);
    }

    @PutMapping("/{id}")
    public Expense update(@PathVariable Long id, @RequestBody Expense expense) {
        return service.updateExpense(id, expense);
    }

    @GetMapping("/{eventId}")
    public List<Expense> get(@PathVariable Long eventId) {
        return service.getExpenses(eventId);
    }

    @DeleteMapping("/{eventId}/auto")
    public void clearAuto(@PathVariable Long eventId) {
        service.clearAutoExpenses(eventId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteExpense(id);
    }
}