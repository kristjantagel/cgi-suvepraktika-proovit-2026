package com.cgi.restaurant.service;

import com.cgi.restaurant.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationExpiryService {

    private final ReservationRepository reservationRepository;

    @Scheduled(fixedRate = 60000)
    public void expireOldReservations() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        reservationRepository.findAll().stream()
                .filter(r -> !r.isExpired())
                .filter(r -> r.getDate().isBefore(today) ||
                        (r.getDate().isEqual(today) && r.getEndTime() != null && r.getEndTime().isBefore(now)))
                .forEach(r -> {
                    r.setExpired(true);
                    reservationRepository.save(r);
                });
    }
}
