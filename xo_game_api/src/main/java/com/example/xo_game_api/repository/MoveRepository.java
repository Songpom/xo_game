package com.example.xo_game_api.repository;


import com.example.xo_game_api.model.Move;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MoveRepository extends JpaRepository<Move, Long> {
    List<Move> findByHistoryXOIdOrderByTurnNumberAsc(Long historyId);
    void deleteByHistoryXOId(Long historyId);
}