package com.example.xo_game_api.repository;

import com.example.xo_game_api.model.HistoryXO;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoryRepository extends JpaRepository<HistoryXO,Long> {

}
