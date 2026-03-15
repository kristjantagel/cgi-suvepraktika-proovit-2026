package com.cgi.restaurant.controller;

import com.cgi.restaurant.dto.MealSuggestionDTO;
import com.cgi.restaurant.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @GetMapping("/suggestion")
    public MealSuggestionDTO getSuggestion() {
        return mealService.getRandomMealSuggestion();
    }
}
