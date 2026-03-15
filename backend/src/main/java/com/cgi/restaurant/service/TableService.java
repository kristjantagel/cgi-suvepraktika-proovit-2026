package com.cgi.restaurant.service;

import com.cgi.restaurant.domain.RestaurantTable;
import com.cgi.restaurant.dto.Table;
import com.cgi.restaurant.repository.ReservationRepository;
import com.cgi.restaurant.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableService {

    private final RestaurantTableRepository restaurantTableRepository;
    private final ReservationRepository reservationRepository;

    public List<Table> getTablesWithStatus(LocalDate date, LocalTime start, LocalTime end) {
        List<RestaurantTable> tables = restaurantTableRepository.findAll();

        return tables.stream()
                .map(t -> {
                    boolean occupied = !reservationRepository
                            .findConflicting(t.getId(), date, start, end)
                            .isEmpty();

                    return Table.builder()
                            .id(t.getId())
                            .capacity(t.getCapacity())
                            .zone(t.getZone().name())
                            .x(t.getX())
                            .y(t.getY())
                            .width(t.getWidth())
                            .height(t.getHeight())
                            .features(t.getFeatures().stream()
                                    .map(Enum::name)
                                    .collect(Collectors.toSet()))
                            .status(occupied ? "OCCUPIED" : "AVAILABLE")
                            .build();
                })
                .collect(Collectors.toList());
    }
}
