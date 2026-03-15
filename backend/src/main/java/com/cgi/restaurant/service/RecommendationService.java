package com.cgi.restaurant.service;

import com.cgi.restaurant.dto.RecommendationResponse;
import com.cgi.restaurant.dto.ReservationRequest;
import com.cgi.restaurant.dto.Table;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final TableService tableService;

    public RecommendationResponse recommend(ReservationRequest req) {
        LocalTime endTime = req.getStartTime().plusHours(2);

        List<Table> tables = tableService.getTablesWithStatus(
                req.getDate(), req.getStartTime(), endTime);

        String zone = req.getZone();

        Long recommendedTableId = tables.stream()
                .filter(t -> "AVAILABLE".equals(t.getStatus()))
                .filter(t -> zone == null || zone.isBlank() || zone.equals(t.getZone()))
                .max(Comparator.comparingInt(t -> score(t, req)))
                .filter(t -> score(t, req) > -1000)
                .map(Table::getId)
                .orElse(null);

        return RecommendationResponse.builder()
                .tables(tables)
                .recommendedTableId(recommendedTableId)
                .build();
    }

    int score(Table table, ReservationRequest req) {
        int surplus = table.getCapacity() - req.getPartySize();
        int score = 0;

        // Capacity fit (highest weight)
        if (surplus < 0) return -1000;
        else if (surplus == 0) score += 40;
        else if (surplus == 1) score += 35;
        else if (surplus == 2) score += 25;
        else if (surplus == 3) score += 15;
        else score += 5;

        // Preference match
        if (req.getPreferences() != null) {
            for (String pref : req.getPreferences()) {
                if (table.getFeatures().contains(pref)) score += 15;
            }
        }

        // Zone match
        if (req.getZone() != null && req.getZone().equals(table.getZone())) score += 10;

        return score;
    }
}
