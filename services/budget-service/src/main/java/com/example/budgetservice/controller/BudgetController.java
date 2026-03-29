package com.example.budgetservice.controller;

import com.example.budgetservice.model.Budget;
import com.example.budgetservice.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService service;

    @PostMapping
    public Budget setBudget(@RequestBody Budget budget) {
        return service.setBudget(budget);
    }

    @GetMapping("/{eventId}/remaining")
    public Double remaining(@PathVariable Long eventId) {
        return service.getRemainingBudget(eventId);
    }
}