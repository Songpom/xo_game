// src/main/java/com/example/xo_game_api/service/HistoryService.java
package com.example.xo_game_api.service;

import com.example.xo_game_api.model.HistoryXO;
import com.example.xo_game_api.model.Move;
import com.example.xo_game_api.repository.HistoryRepository;
import com.example.xo_game_api.repository.MoveRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final HistoryRepository historyRepo;
    private final MoveRepository moveRepo;


    @Transactional
    public HistoryXO start(HistoryXO body) {
        HistoryXO h = new HistoryXO();
        h.setMode(body.getMode());
        h.setSizeBoard(body.getSizeBoard());
        h.setFirstPlayer(body.getFirstPlayer());
        h.setBotType(body.getBotType());
        h.setWinner(null);
        h.setFinalBoard(null);
        return historyRepo.save(h);
    }


    @Transactional
    public Move appendMove(Long historyId, Move body) {
        HistoryXO h = historyRepo.findById(historyId)
                .orElseThrow(() -> new IllegalArgumentException("History not found: " + historyId));
        Move m = new Move();
        m.setHistoryXO(h);
        m.setTurnNumber(body.getTurnNumber());
        m.setPlayer(body.getPlayer());
        m.setRowIdx(body.getRowIdx());
        m.setColIdx(body.getColIdx());
        m.setBoardAfter(body.getBoardAfter());
        return moveRepo.save(m);
    }


    @Transactional
    public HistoryXO finish(Long historyId, Map<String, Object> body) {
        HistoryXO h = historyRepo.findById(historyId)
                .orElseThrow(() -> new IllegalArgumentException("History not found: " + historyId));
        Object w = body.get("winner");
        Object fb = body.get("finalBoard");
        if (w != null)  h.setWinner(String.valueOf(w));
        if (fb != null) h.setFinalBoard(String.valueOf(fb));
        return historyRepo.save(h);
    }


    @Transactional
    public List<HistoryXO> listAll() {
        return historyRepo.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }


    @Transactional
    public HistoryXO getOne(Long id) {
        return historyRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("History not found: " + id));
    }


    @Transactional
    public List<Move> getMoves(Long historyId) {
        return moveRepo.findByHistoryXOIdOrderByTurnNumberAsc(historyId);
    }


    @Transactional
    public void delete(Long historyId) {
        moveRepo.deleteByHistoryXOId(historyId); // safety
        historyRepo.deleteById(historyId);
    }
}
