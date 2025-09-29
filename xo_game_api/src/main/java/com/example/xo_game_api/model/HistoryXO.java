package com.example.xo_game_api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "history")
@AllArgsConstructor
@NoArgsConstructor
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HistoryXO {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "historyId")
    private Integer historyId;

    @Column(nullable = false)
    private String winner;

    @Column(nullable = false)
    private String gameMode;

    @Column(nullable = false)
    private Integer sizeBoard;

    @Lob
    private String board;
}
