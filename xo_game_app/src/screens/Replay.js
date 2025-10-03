import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHistory, getMoves } from "../services/historyService";
import BoardInteractive from "../component/Board";
import "../styles/Game.css"; 

export default function Replay() {
  const { id } = useParams();         
  const navigate = useNavigate();

  const [game, setGame] = useState(null); 
  const [moves, setMoves] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");


  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [g, m] = await Promise.all([getHistory(id), getMoves(id)]);
        setGame(g);
        setMoves(Array.isArray(m) ? m : []);
        setErr("");
        setStep(0);
      } catch (e) {
        console.error(e);
        setErr("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);


  const boardCells = useMemo(() => {
    const N = game?.sizeBoard ?? 3;
    const cells = Array(N * N).fill("");
    for (let i = 0; i < Math.min(step, moves.length); i++) {
      const mv = moves[i];
      const index = mv.rowIdx * N + mv.colIdx;
      cells[index] = mv.player;
    }
    return cells;
  }, [game, moves, step]);

  useEffect(() => {
    if (!playing) return;
    if (step >= moves.length) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setStep((s) => Math.min(s + 1, moves.length));
    }, 600);
    return () => clearTimeout(timerRef.current);
  }, [playing, step, moves.length]);

  const N = game?.sizeBoard ?? 3;

  const goFirst = () => { setPlaying(false); setStep(0); };
  const stepPrev = () => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); };
  const stepNext = () => { setPlaying(false); setStep((s) => Math.min(moves.length, s + 1)); };
  const goLast  = () => { setPlaying(false); setStep(moves.length); };
  const togglePlay = () => setPlaying((p) => !p);

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="btn btn-ghost" onClick={() => navigate("/home")}>← กลับ Home</button>
        {game && (
          <div className="game-meta">
            เกม #{game.id} · โหมด: <b>{game.mode}</b> · ขนาด: <b>{N}×{N}</b> · ผู้เริ่ม: <b>{game.firstPlayer}</b>
            {game.winner ? <> · ผู้ชนะ: <b>{game.winner}</b></> : null}
          </div>
        )}
      </div>

      {loading && <div className="status-row"><div className="status-badge turn">กำลังโหลด…</div></div>}
      {err && <div className="status-row"><div className="status-badge done" style={{background:'#fee2e2', color:'#991b1b'}}>{err}</div></div>}

      {!loading && !err && game && (
        <>
          <div className="status-row" style={{ gap: 8 }}>
            <button className="btn" onClick={goFirst} title="ไปตาเริ่มต้น">⏮</button>
            <button className="btn" onClick={stepPrev} title="ย้อนทีละตา">◀</button>
            <button className="btn" onClick={togglePlay} title="เล่น/หยุด">{playing ? "⏸" : "▶"}</button>
            <button className="btn" onClick={stepNext} title="เดินต่อทีละตา">▶</button>
            <button className="btn" onClick={goLast}  title="ไปตาสุดท้าย">⏭</button>

            <div style={{ marginLeft: 12 }}>
              ตาที่แสดง: <b>{step}</b> / {moves.length}
            </div>
          </div>

          <div className="board-wrap">
            <BoardInteractive
              size={N}
              cells={boardCells}
              onCellClick={() => {}}
              cellPx={N <= 5 ? 90 : N <= 10 ? 56 : 36}
              gap={N <= 10 ? 6 : 4}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <details>
              <summary>รายละเอียดลำดับการเดิน</summary>
              <ol>
                {moves.map((m, i) => (
                  <li key={m.id || i}>
                    #{m.turnNumber}: {m.player} → ({m.rowIdx},{m.colIdx})
                  </li>
                ))}
              </ol>
            </details>
          </div>
        </>
      )}
    </div>
  );
}
