// src/main/java/com/example/xo_game_api/controller/HistoryController.java
package com.example.xo_game_api.controller;

import com.example.xo_game_api.model.HistoryXO;
import com.example.xo_game_api.model.Move;
import com.example.xo_game_api.repository.HistoryRepository;
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
    private final HistoryRepository historyRepo;

    @PostMapping
    public HistoryXO start(@RequestBody HistoryXO body) {
        HistoryXO h = new HistoryXO();
        h.setMode(body.getMode());
        h.setSizeBoard(body.getSizeBoard());
        h.setFirstPlayer(body.getFirstPlayer());
        h.setBotType(body.getBotType());
        h.setWinner(null);
        h.setFinalBoard(null);
        return service.start(h);
    }

    @PostMapping("/{id}/moves")
    public Move appendMove(@PathVariable Long id, @RequestBody Move body) {
        HistoryXO h = historyRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("History not found: " + id));
        Move m = new Move();
        m.setHistoryXO(h);
        m.setTurnNumber(body.getTurnNumber());
        m.setPlayer(body.getPlayer());
        m.setRowIdx(body.getRowIdx());
        m.setColIdx(body.getColIdx());
        m.setBoardAfter(body.getBoardAfter());
        return service.appendMove(m);
    }


    @PostMapping("/{id}/finish")
    public HistoryXO finish(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        HistoryXO h = historyRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("History not found: " + id));
        Object w = body.get("winner");
        Object fb = body.get("finalBoard");
        if (w != null)  h.setWinner(String.valueOf(w));
        if (fb != null) h.setFinalBoard(String.valueOf(fb));
        return service.finish(h);
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
