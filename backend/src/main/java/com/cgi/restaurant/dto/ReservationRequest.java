package com.cgi.restaurant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {
    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime startTime;

    @Min(1)
    @Max(20)
    private int partySize;

    private String zone;

    private List<String> preferences;

    private Long tableId;

    private String guestName;

    @Email
    private String guestEmail;
}
