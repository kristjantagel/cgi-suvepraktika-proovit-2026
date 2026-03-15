package com.cgi.restaurant.service;

import com.cgi.restaurant.domain.Reservation;
import com.cgi.restaurant.domain.RestaurantTable;
import com.cgi.restaurant.dto.ReservationRequest;
import com.cgi.restaurant.dto.ReservationResponseDTO;
import com.cgi.restaurant.exception.TableNotAvailableException;
import com.cgi.restaurant.repository.ReservationRepository;
import com.cgi.restaurant.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final RestaurantTableRepository restaurantTableRepository;
    private final ReservationRepository reservationRepository;

    public ReservationResponseDTO createReservation(ReservationRequest req) {
        RestaurantTable table = restaurantTableRepository.findById(req.getTableId())
                .orElseThrow(() -> new IllegalArgumentException("Table not found with id: " + req.getTableId()));

        if (req.getPartySize() > table.getCapacity()) {
            throw new IllegalArgumentException(
                    "Party size " + req.getPartySize() + " exceeds table capacity of " + table.getCapacity());
        }

        LocalTime endTime = req.getStartTime().plusHours(2);

        List<Reservation> conflicts = reservationRepository.findConflicting(
                table.getId(), req.getDate(), req.getStartTime(), endTime);

        if (!conflicts.isEmpty()) {
            throw new TableNotAvailableException(
                    "Table " + table.getId() + " is not available at the requested time");
        }

        Reservation reservation = Reservation.builder()
                .table(table)
                .date(req.getDate())
                .startTime(req.getStartTime())
                .endTime(endTime)
                .partySize(req.getPartySize())
                .guestName(req.getGuestName())
                .guestEmail(req.getGuestEmail())
                .randomlyGenerated(false)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        return ReservationResponseDTO.builder()
                .id(saved.getId())
                .tableId(table.getId())
                .tableCapacity(table.getCapacity())
                .tableZone(table.getZone().name())
                .date(saved.getDate())
                .startTime(saved.getStartTime())
                .endTime(saved.getEndTime())
                .partySize(saved.getPartySize())
                .guestName(saved.getGuestName())
                .guestEmail(saved.getGuestEmail())
                .build();
    }
}
