package com.cgi.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Table {
    private Long id;
    private int capacity;
    private String zone;
    private double x;
    private double y;
    private double width;
    private double height;
    private Set<String> features;
    private String status;
}
