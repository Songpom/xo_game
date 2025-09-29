package com.example.xo_game_api.service;

import com.example.xo_game_api.model.HistoryXO;
import com.example.xo_game_api.repository.HistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistoryService {
    private final HistoryRepository repo;

    public HistoryService(HistoryRepository repo) {
        this.repo = repo;
    }

    public List<HistoryXO> getAll() {
        return repo.findAll();
    }

    public HistoryXO save(HistoryXO history) {
        return repo.save(history);
    }
}
