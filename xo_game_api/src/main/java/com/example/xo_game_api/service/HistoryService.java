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
    public HistoryXO start(HistoryXO h) {
        return historyRepo.save(h);
    }


    @Transactional
    public Move appendMove(Move m) {
        return moveRepo.save(m);
    }


    @Transactional
    public HistoryXO finish(HistoryXO h) {
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
        moveRepo.deleteByHistoryXOId(historyId);
        historyRepo.deleteById(historyId);
    }
}
