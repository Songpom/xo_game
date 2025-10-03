// src/main/java/com/example/xo_game_api/model/Move.java
package com.example.xo_game_api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "move", indexes = {
        @Index(name = "idx_history_turn", columnList = "history_id, turnNumber")
})
@Data @NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Move {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "history_id", nullable = false)
    @JsonIgnoreProperties({"moves"})
    private HistoryXO historyXO;

    @Column(nullable = false)
    private Integer turnNumber;

    @Column(nullable = false, length = 1)
    private String player;

    @Column(nullable = false)
    private Integer rowIdx;

    @Column(nullable = false)
    private Integer colIdx;

    @Lob @Column(columnDefinition = "TEXT")
    private String boardAfter;
}
