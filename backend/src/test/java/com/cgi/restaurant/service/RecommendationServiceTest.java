package com.cgi.restaurant.service;

import com.cgi.restaurant.dto.RecommendationResponse;
import com.cgi.restaurant.dto.ReservationRequest;
import com.cgi.restaurant.dto.Table;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private TableService tableService;

    @InjectMocks
    private RecommendationService recommendationService;

    private ReservationRequest buildRequest(int partySize, String zone, List<String> preferences) {
        return ReservationRequest.builder()
                .date(LocalDate.of(2026, 3, 15))
                .startTime(LocalTime.of(18, 0))
                .partySize(partySize)
                .zone(zone)
                .preferences(preferences)
                .build();
    }

    private Table buildTable(Long id, int capacity, String zone, Set<String> features, String status) {
        return Table.builder()
                .id(id)
                .capacity(capacity)
                .zone(zone)
                .x(0).y(0).width(8).height(6)
                .features(features)
                .status(status)
                .build();
    }

    @Test
    void partyOf2_scoresHigherOn2SeatTable_thanOn6SeatTable() {
        Table twoSeat = buildTable(1L, 2, "INDOOR", Set.of(), "AVAILABLE");
        Table sixSeat = buildTable(2L, 6, "INDOOR", Set.of(), "AVAILABLE");
        ReservationRequest req = buildRequest(2, null, null);

        when(tableService.getTablesWithStatus(any(), any(), any()))
                .thenReturn(List.of(twoSeat, sixSeat));

        RecommendationResponse response = recommendationService.recommend(req);

        assertEquals(1L, response.getRecommendedTableId());

        // Verify scores directly
        int scoreTwoSeat = recommendationService.score(twoSeat, req);
        int scoreSixSeat = recommendationService.score(sixSeat, req);
        assertTrue(scoreTwoSeat > scoreSixSeat,
                "2-seat table score (" + scoreTwoSeat + ") should be higher than 6-seat (" + scoreSixSeat + ")");
    }

    @Test
    void tableWithCapacityLessThanPartySize_isNeverRecommended() {
        Table smallTable = buildTable(1L, 2, "INDOOR", Set.of(), "AVAILABLE");
        ReservationRequest req = buildRequest(4, null, null);

        int score = recommendationService.score(smallTable, req);
        assertEquals(-1000, score);

        when(tableService.getTablesWithStatus(any(), any(), any()))
                .thenReturn(List.of(smallTable));

        RecommendationResponse response = recommendationService.recommend(req);
        assertNull(response.getRecommendedTableId());
    }

    @Test
    void windowSeatPreference_adds15Points_whenTableHasFeature() {
        Table withFeature = buildTable(1L, 4, "INDOOR", Set.of("WINDOW_SEAT"), "AVAILABLE");
        Table withoutFeature = buildTable(2L, 4, "INDOOR", Set.of(), "AVAILABLE");
        ReservationRequest req = buildRequest(4, null, List.of("WINDOW_SEAT"));

        int scoreWith = recommendationService.score(withFeature, req);
        int scoreWithout = recommendationService.score(withoutFeature, req);

        assertEquals(15, scoreWith - scoreWithout,
                "WINDOW_SEAT preference should add exactly 15 points");
    }

    @Test
    void perfectCapacityFit_scores40CapacityPoints() {
        Table perfectFit = buildTable(1L, 4, "INDOOR", Set.of(), "AVAILABLE");
        ReservationRequest req = buildRequest(4, null, null);

        int score = recommendationService.score(perfectFit, req);
        assertEquals(40, score, "Perfect capacity fit (surplus=0) should score 40");
    }
}
