package com.example.xo_game_api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "history_xo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HistoryXO {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String mode;

    @Column(nullable = false)
    private Integer sizeBoard;

    @Column(nullable = false, length = 1)
    private String firstPlayer;

    @Column(length = 10)
    private String winner;

    @Column(length = 10)
    private String botType;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String finalBoard;

    @OneToMany(mappedBy = "historyXO", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("turnNumber ASC")

    private List<Move> moves = new ArrayList<>();
}
