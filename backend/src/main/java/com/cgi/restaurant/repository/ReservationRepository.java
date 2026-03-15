package com.cgi.restaurant.repository;

import com.cgi.restaurant.domain.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r WHERE r.table.id = :tableId " +
           "AND r.date = :date " +
           "AND r.startTime < :end " +
           "AND r.endTime > :start " +
           "AND r.expired = false")
    List<Reservation> findConflicting(
        @Param("tableId") Long tableId,
        @Param("date") LocalDate date,
        @Param("start") LocalTime start,
        @Param("end") LocalTime end
    );
}
