import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listHistory } from "../services/historyService";
import { defaultKForN } from "../component/rules";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("PVP");
  const [sizeInput, setSizeInput] = useState("3");

  // คำนวณ N แบบ real-time จาก input (และ clamp 3–19)
  const previewN = useMemo(() => {
    const n = parseInt(sizeInput, 10);
    if (isNaN(n)) return 3;
    return Math.max(3, Math.min(19, n));
  }, [sizeInput]);

  const kToWin = useMemo(() => defaultKForN(previewN), [previewN]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await listHistory();
      setItems(Array.isArray(data) ? data : []);
      setErr("");
    } catch {
      setErr("โหลดประวัติไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadHistory(); }, []);

  // พิมพ์ได้สูงสุด 2 หลัก และให้ preview อัปเดตทันที
  const onSizeChange = (e) => {
    const v = e.target.value;
    if (v === "" || /^\d{0,2}$/.test(v)) {
      setSizeInput(v);
    }
  };

  // ถ้า blur ว่างอยู่ ให้เด้งกลับมาเป็นค่าที่ clamp แล้ว
  const onSizeBlur = () => {
    const n = previewN; // clamp แล้วแน่ๆ
    setSizeInput(String(n));
  };

  // ปุ่ม − / +
  const stepSize = (delta) => {
    let n = previewN + delta;
    n = Math.max(3, Math.min(19, n));
    setSizeInput(String(n));
  };

  const startGame = () => {
    const n = previewN; // ใช้ค่าล่าสุดทันที
    const first = Math.random() < 0.5 ? "X" : "O";
    navigate("/play", { state: { mode, size: n, k: defaultKForN(n), first } });
  };

  const MiniBoard = ({ board, sizeBoard }) => {
    const N = Math.max(3, Number(sizeBoard) || 3);
    const cells = (board || "").split(",").map((s) => s.trim().toUpperCase());
    while (cells.length < N * N) cells.push("");
    return (
      <div
        className="mini-board"
        style={{
          gridTemplateColumns: `repeat(${N}, 18px)`,
          gridTemplateRows: `repeat(${N}, 18px)`,
        }}
        aria-label={`Board ${N} by ${N}`}
      >
        {cells.slice(0, N * N).map((v, i) => (
          <div key={i} className="mini-cell">
            <span className={`mini-mark ${v === "X" ? "x" : v === "O" ? "o" : ""}`}>{v || ""}</span>
          </div>
        ))}
      </div>
    );
  };

  const PreviewBoard = ({ N }) => (
    <div
      className="preview-board"
      style={{
        gridTemplateColumns: `repeat(${N}, 28px)`,
        gridTemplateRows: `repeat(${N}, 28px)`,
      }}
      aria-label={`Preview board ${N} by ${N}`}
    >
      {Array.from({ length: N * N }).map((_, i) => <div key={i} className="preview-cell" />)}
    </div>
  );

  return (
    <div className="page light">
      <header className="app-header">
        <div className="brand">
          <h1 className="brand-title">XO Game</h1>
          <p className="brand-subtitle">ตั้งค่าเกม ทดลองขนาดกระดาน และดูประวัติย้อนหลัง</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={loadHistory} aria-label="Refresh history">รีเฟรช</button>
          <button className="btn btn-primary" onClick={startGame} aria-label="Start game">เริ่มเกม</button>
        </div>
      </header>

      <section className="section">
        <div className="config-grid">
          <div className="card">
            <div className="card-head">
              <h3>โหมดการเล่น</h3>
              <p className="muted">เลือกว่าจะเล่นกับคน หรือกับบอท</p>
            </div>
            <div className="radio-grid">
              <label className={`radio-tile ${mode === "PVP" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "PVP"}
                  onChange={() => setMode("PVP")}
                />
                <div className="radio-body">
                  <div className="radio-title">🧑‍🤝‍🧑 PVP</div>
                  <div className="radio-desc">คน vs คน</div>
                </div>
              </label>

              <label className={`radio-tile ${mode === "PVBOT" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "PVBOT"}
                  onChange={() => setMode("PVBOT")}
                />
                <div className="radio-body">
                  <div className="radio-title">🤖 PVBOT</div>
                  <div className="radio-desc">คน vs บอท</div>
                </div>
              </label>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>ขนาดกระดาน</h3>
              <p className="muted">ระบุ N (3–19) แล้วดูตัวอย่างทันที</p>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="boardSize">N × N</label>

                <div className="input-stepper">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => stepSize(-1)}
                    disabled={previewN <= 3}
                    aria-label="ลดขนาดกระดาน"
                  >
                    −
                  </button>

                  <input
                    id="boardSize"
                    className="input"
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={sizeInput}
                    onChange={onSizeChange}
                    onBlur={onSizeBlur}
                    aria-label="กำหนดขนาดกระดาน"
                  />

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => stepSize(1)}
                    disabled={previewN >= 19}
                    aria-label="เพิ่มขนาดกระดาน"
                  >
                    +
                  </button>
                </div>

                <div className="hint">กติกาอัตโนมัติ: {previewN}×{previewN} ⇒ ชนะเมื่อเรียง {kToWin}</div>
              </div>

              <div className="preview-wrap">
                <PreviewBoard N={previewN} />
                <div className="preview-caption">ตัวอย่างกระดาน {previewN}×{previewN}</div>
              </div>
            </div>

            <div className="action-row">
              <button className="btn btn-primary" onClick={startGame}>เริ่มเกม</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <div className="table-head">
            <h2>ประวัติการเล่น</h2>
            <div className="toolbar">
              <button className="btn btn-ghost" onClick={loadHistory}>Refresh</button>
            </div>
          </div>

          {loading && <div className="status muted">กำลังโหลด…</div>}
          {err && <div className="status error">{err}</div>}

          {!loading && !err && (
            <div className="table-wrap" role="region" aria-label="History table" tabIndex={0}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Winner</th>
                    <th>Mode</th>
                    <th>Size</th>
                    <th>Final Board</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((h) => (
                    <tr key={h.id}>
                      <td>#{h.id}</td>
                      <td>
                        <span className={`badge ${h.winner === "X" ? "badge-x" : h.winner === "O" ? "badge-o" : ""}`}>
                          {h.winner || "-"}
                        </span>
                      </td>
                      <td>
                        <span className={`chip ${h.mode === "PVBOT" ? "chip-bot" : "chip-pvp"}`}>{h.mode}</span>
                      </td>
                      <td>{h.sizeBoard}</td>
                      <td><MiniBoard board={h.finalBoard} sizeBoard={h.sizeBoard} /></td>
                      <td>
                        <button
                          className="btn btn-ghost"
                          onClick={() => navigate(`/replay/${h.id}`)}
                          aria-label={`Replay #${h.id}`}
                        >
                          ▶ Replay
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty">ยังไม่มีประวัติ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
