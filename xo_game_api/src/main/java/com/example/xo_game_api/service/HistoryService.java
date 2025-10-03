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

    /** เริ่มเกม: รับ HistoryXO ตรง ๆ (อย่าส่ง id/moves มานะ) */
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

    /** เพิ่ม 1 เดิน: รับ Move ตรง ๆ (ต้อง set historyId ผ่าน path, ไม่รับจาก body) */
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

    /** จบเกม: อัปเดต winner + finalBoard (รับจาก Map ง่าย ๆ เพื่อหลีกเลี่ยง DTO) */
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

<<<<<<< HEAD

=======
    /** รายการทั้งหมด (ล่าสุดก่อน) */
    @Transactional
>>>>>>> parent of fc78412 (Update XOgame)
    public List<HistoryXO> listAll() {
        return historyRepo.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

<<<<<<< HEAD

=======
    /** รายการเดียว (รวม moves แบบ LAZY ถ้าจะ serialize ควรเปิด endpoint แยก moves) */
    @Transactional
>>>>>>> parent of fc78412 (Update XOgame)
    public HistoryXO getOne(Long id) {
        return historyRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("History not found: " + id));
    }

<<<<<<< HEAD

=======
    /** moves ของเกม */
    @Transactional
>>>>>>> parent of fc78412 (Update XOgame)
    public List<Move> getMoves(Long historyId) {
        return moveRepo.findByHistoryXOIdOrderByTurnNumberAsc(historyId);
    }

    /** ลบทั้งเกม + moves */
    @Transactional
    public void delete(Long historyId) {
        moveRepo.deleteByHistoryXOId(historyId); // safety
        historyRepo.deleteById(historyId);
    }
}
