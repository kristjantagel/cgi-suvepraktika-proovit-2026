package com.cgi.restaurant.seeder;

import com.cgi.restaurant.domain.*;
import com.cgi.restaurant.repository.ReservationRepository;
import com.cgi.restaurant.repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Component
public class DataSeeder implements ApplicationRunner {

    @Autowired
    private RestaurantTableRepository restaurantTableRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {

        // --- INDOOR TABLES ---
        // Left column - window seats with views
        RestaurantTable i1 = RestaurantTable.builder()
                .capacity(2).zone(Zone.INDOOR)
                .x(5).y(10).width(8).height(6)
                .features(Set.of(TableFeature.WINDOW_SEAT))
                .build();
        RestaurantTable i2 = RestaurantTable.builder()
                .capacity(2).zone(Zone.INDOOR)
                .x(5).y(20).width(8).height(6)
                .features(Set.of(TableFeature.WINDOW_SEAT))
                .build();
        RestaurantTable i3 = RestaurantTable.builder()
                .capacity(4).zone(Zone.INDOOR)
                .x(5).y(30).width(8).height(6)
                .features(Set.of(TableFeature.WINDOW_SEAT))
                .build();

        // Middle section - standard indoor tables
        RestaurantTable i4 = RestaurantTable.builder()
                .capacity(4).zone(Zone.INDOOR)
                .x(20).y(10).width(8).height(6)
                .features(Set.of())
                .build();
        RestaurantTable i5 = RestaurantTable.builder()
                .capacity(4).zone(Zone.INDOOR)
                .x(20).y(20).width(8).height(6)
                .features(Set.of())
                .build();
        RestaurantTable i6 = RestaurantTable.builder()
                .capacity(4).zone(Zone.INDOOR)
                .x(20).y(30).width(8).height(6)
                .features(Set.of())
                .build();
        RestaurantTable i7 = RestaurantTable.builder()
                .capacity(6).zone(Zone.INDOOR)
                .x(20).y(40).width(8).height(6)
                .features(Set.of())
                .build();

        // Right column - quiet corner indoor tables
        RestaurantTable i8 = RestaurantTable.builder()
                .capacity(4).zone(Zone.INDOOR)
                .x(35).y(10).width(8).height(6)
                .features(Set.of(TableFeature.QUIET))
                .build();
        RestaurantTable i9 = RestaurantTable.builder()
                .capacity(4).zone(Zone.INDOOR)
                .x(35).y(20).width(8).height(6)
                .features(Set.of(TableFeature.QUIET))
                .build();
        RestaurantTable i10 = RestaurantTable.builder()
                .capacity(2).zone(Zone.INDOOR)
                .x(35).y(30).width(8).height(6)
                .features(Set.of(TableFeature.QUIET, TableFeature.NEAR_PLAY_AREA))
                .build();

        // --- TERRACE TABLES ---
        // Large group table with views
        RestaurantTable t1 = RestaurantTable.builder()
                .capacity(12).zone(Zone.TERRACE)
                .x(55).y(10).width(18).height(8)
                .features(Set.of(TableFeature.WINDOW_SEAT))
                .build();

        // Larger terrace tables with views
        RestaurantTable t2 = RestaurantTable.builder()
                .capacity(6).zone(Zone.TERRACE)
                .x(55).y(25).width(12).height(6)
                .features(Set.of(TableFeature.WINDOW_SEAT))
                .build();
        RestaurantTable t3 = RestaurantTable.builder()
                .capacity(6).zone(Zone.TERRACE)
                .x(55).y(35).width(12).height(6)
                .features(Set.of(TableFeature.WINDOW_SEAT))
                .build();

        // Smaller terrace tables
        RestaurantTable t4 = RestaurantTable.builder()
                .capacity(4).zone(Zone.TERRACE)
                .x(72).y(25).width(8).height(6)
                .features(Set.of(TableFeature.WINDOW_SEAT))
                .build();
        RestaurantTable t5 = RestaurantTable.builder()
                .capacity(4).zone(Zone.TERRACE)
                .x(72).y(35).width(8).height(6)
                .features(Set.of(TableFeature.WINDOW_SEAT))
                .build();
        RestaurantTable t6 = RestaurantTable.builder()
                .capacity(2).zone(Zone.TERRACE)
                .x(72).y(45).width(8).height(6)
                .features(Set.of(TableFeature.WINDOW_SEAT))
                .build();

        // --- PRIVATE ROOM TABLES ---
        RestaurantTable p1 = RestaurantTable.builder()
                .capacity(8).zone(Zone.PRIVATE_ROOM)
                .x(55).y(60).width(12).height(7)
                .features(Set.of(TableFeature.QUIET))
                .build();
        RestaurantTable p2 = RestaurantTable.builder()
                .capacity(6).zone(Zone.PRIVATE_ROOM)
                .x(72).y(60).width(10).height(7)
                .features(Set.of(TableFeature.QUIET))
                .build();
        RestaurantTable p3 = RestaurantTable.builder()
                .capacity(4).zone(Zone.PRIVATE_ROOM)
                .x(55).y(72).width(8).height(6)
                .features(Set.of(TableFeature.QUIET))
                .build();

        List<RestaurantTable> tables = restaurantTableRepository.saveAll(List.of(
                i1, i2, i3, i4, i5, i6, i7, i8, i9, i10,
                t1, t2, t3, t4, t5, t6,
                p1, p2, p3
        ));

        // --- RANDOM RESERVATIONS (~40% of tables) ---
        Random random = new Random(42);
        LocalDate today = LocalDate.now();
        int[] dayOffsets = {-2, -1, 0, 0, 1, 2};
        LocalTime[] slots = {
                LocalTime.of(11, 0),
                LocalTime.of(13, 0),
                LocalTime.of(15, 0),
                LocalTime.of(18, 0),
                LocalTime.of(20, 0)
        };

        for (RestaurantTable table : tables) {
            if (random.nextDouble() < 0.4) {
                LocalDate date = today.plusDays(dayOffsets[random.nextInt(dayOffsets.length)]);
                LocalTime start = slots[random.nextInt(slots.length)];
                LocalTime end = start.plusHours(2);

                Reservation r = Reservation.builder()
                        .table(table)
                        .date(date)
                        .startTime(start)
                        .endTime(end)
                        .partySize(random.nextInt(table.getCapacity()) + 1)
                        .guestName("Guest")
                        .guestEmail("guest@example.com")
                        .randomlyGenerated(true)
                        .build();

                reservationRepository.save(r);
            }
        }
    }
}
