package com.cgi.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealSuggestionDTO {
    private String name;
    private String category;
    private String area;
    private String thumbnailUrl;
}
