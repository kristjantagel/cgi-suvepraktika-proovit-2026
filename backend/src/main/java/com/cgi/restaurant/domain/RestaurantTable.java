package com.cgi.restaurant.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int capacity;
    private Zone zone;

    private double x;
    private double y;
    private double width;
    private double height;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private Set<TableFeature> features;
}
