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

    @GetMapping("/{eventId}")
    public List<Expense> get(@PathVariable Long eventId) {
        return service.getExpenses(eventId);
    }
}