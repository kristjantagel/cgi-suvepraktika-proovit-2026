package com.cgi.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponseDTO {
    private Long id;
    private Long tableId;
    private int tableCapacity;
    private String tableZone;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private int partySize;
    private String guestName;
    private String guestEmail;
}
