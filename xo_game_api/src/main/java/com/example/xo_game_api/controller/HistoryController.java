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

    /** เริ่มเกมใหม่ (รับ HistoryXO ตรง ๆ: mode, sizeBoard, firstPlayer, botType) */
    @PostMapping
    public HistoryXO start(@RequestBody HistoryXO body) {
        return service.start(body);
    }

    /** เพิ่ม 1 เดิน (รับ Move ตรง ๆ: turnNumber, player, rowIdx, colIdx[, boardAfter]) */
    @PostMapping("/{id}/moves")
    public Move appendMove(@PathVariable Long id, @RequestBody Move body) {
        return service.appendMove(id, body);
    }

    /** จบเกม (winner + finalBoard) */
    @PostMapping("/{id}/finish")
    public HistoryXO finish(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return service.finish(id, body);
    }

    /** รายการทั้งหมด (ล่าสุดก่อน) */
    @GetMapping
    public List<HistoryXO> list() {
        return service.listAll();
    }

    /** รายการเดียว */
    @GetMapping("/{id}")
    public HistoryXO one(@PathVariable Long id) {
        return service.getOne(id);
    }

    /** moves ทั้งหมดของเกม */
    @GetMapping("/{id}/moves")
    public List<Move> moves(@PathVariable Long id) {
        return service.getMoves(id);
    }

    /** ลบทั้งเกม */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
