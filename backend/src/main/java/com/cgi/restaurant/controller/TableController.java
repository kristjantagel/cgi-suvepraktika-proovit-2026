package com.cgi.restaurant.controller;

import com.cgi.restaurant.dto.Table;
import com.cgi.restaurant.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @GetMapping
    public List<Table> getTables(
            @RequestParam LocalDate date,
            @RequestParam LocalTime start,
            @RequestParam LocalTime end) {
        return tableService.getTablesWithStatus(date, start, end);
    }
}
