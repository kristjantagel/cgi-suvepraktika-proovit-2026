package com.cgi.restaurant.controller;

import com.cgi.restaurant.dto.RecommendationResponse;
import com.cgi.restaurant.dto.ReservationRequest;
import com.cgi.restaurant.service.RecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping
    public RecommendationResponse recommend(@RequestBody @Valid ReservationRequest request) {
        return recommendationService.recommend(request);
    }
}
