// src/main/java/com/example/xo_game_api/controller/HistoryController.java
package com.example.xo_game_api.controller;

import com.example.xo_game_api.model.HistoryXO;
import com.example.xo_game_api.model.Move;
import com.example.xo_game_api.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService service;


    @PostMapping
    public HistoryXO start(@RequestBody HistoryXO body) {
        return service.start(body);
    }

    @PostMapping("/{id}/moves")
    public Move appendMove(@PathVariable Long id, @RequestBody Move body) {
        return service.appendMove(id, body);
    }


    @PostMapping("/{id}/finish")
    public HistoryXO finish(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return service.finish(id, body);
    }


    @GetMapping
    public List<HistoryXO> list() {
        return service.listAll();
    }


    @GetMapping("/{id}")
    public HistoryXO one(@PathVariable Long id) {
        return service.getOne(id);
    }

    @GetMapping("/{id}/moves")
    public List<Move> moves(@PathVariable Long id) {
        return service.getMoves(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
