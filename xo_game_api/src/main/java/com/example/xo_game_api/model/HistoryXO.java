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

    /** โหมดเกม: "PVP" | "PVBOT" */
    @Column(nullable = false, length = 10)
    private String mode;

    /** ขนาดกระดาน N (3..19) */
    @Column(nullable = false)
    private Integer sizeBoard;

    /** ใครเริ่ม "X" หรือ "O" */
    @Column(nullable = false, length = 1)
    private String firstPlayer;

    /** ผู้ชนะ "X" | "O" | "DRAW" */
    @Column(length = 10)
    private String winner;

    /** ประเภทบอท (null ถ้า PVP) */
    @Column(length = 10)
    private String botType;

    /** กระดานสุดท้าย (เผื่อโชว์ใน History โดยไม่ต้อง Replay) */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String finalBoard;

    /** ลำดับการเดินทั้งหมด */
    @OneToMany(mappedBy = "historyXO", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("turnNumber ASC")

    private List<Move> moves = new ArrayList<>();
}
