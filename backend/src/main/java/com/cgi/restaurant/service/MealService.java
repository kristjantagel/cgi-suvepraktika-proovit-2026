package com.cgi.restaurant.service;

import com.cgi.restaurant.dto.MealSuggestionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MealService {

    private static final String MEAL_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php";

    private final RestTemplate restTemplate;

    public MealSuggestionDTO getRandomMealSuggestion() {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(MEAL_API_URL, Map.class);

            if (response == null || !response.containsKey("meals")) {
                return fallback();
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> meals = (List<Map<String, Object>>) response.get("meals");

            if (meals == null || meals.isEmpty()) {
                return fallback();
            }

            Map<String, Object> meal = meals.get(0);

            return MealSuggestionDTO.builder()
                    .name((String) meal.get("strMeal"))
                    .category((String) meal.get("strCategory"))
                    .area((String) meal.get("strArea"))
                    .thumbnailUrl((String) meal.get("strMealThumb"))
                    .build();

        } catch (Exception e) {
            log.warn("Failed to fetch meal suggestion from TheMealDB: {}", e.getMessage());
            return fallback();
        }
    }

    private MealSuggestionDTO fallback() {
        return MealSuggestionDTO.builder()
                .name("Chef's Special")
                .category("Today's Recommendation")
                .area("")
                .thumbnailUrl("")
                .build();
    }
}
