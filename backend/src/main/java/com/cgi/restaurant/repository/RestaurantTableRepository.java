package com.cgi.restaurant.repository;

import com.cgi.restaurant.domain.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
}
