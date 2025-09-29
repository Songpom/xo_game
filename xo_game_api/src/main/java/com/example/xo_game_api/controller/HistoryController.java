package com.example.xo_game_api.controller;

import com.example.xo_game_api.model.HistoryXO;
import com.example.xo_game_api.service.HistoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService service;

    public HistoryController(HistoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<HistoryXO> getAll() {
        return service.getAll();
    }

    @PostMapping
    public HistoryXO create(@RequestBody HistoryXO body) {
        return service.save(body);
    }
}
