import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listHistory } from "../services/historyService";
import { defaultKForN } from "./rules";

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("PVP"); // PVP | PVBOT
  const [size, setSize] = useState(3);     // N

  const onSizeChange = (e) => setSize(Number(e.target.value || 3));

  const startGame = () => {
    const k = defaultKForN(size);
    const first = Math.random() < 0.5 ? "X" : "O";
    navigate("/play", { state: { mode, size, k, first } });
  };

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

  const MiniBoard = ({ board, sizeBoard }) => {
    const N = Math.max(3, Number(sizeBoard) || 3);
    const parts = (board || "").split(",").map(s => s.trim().toUpperCase());
    while (parts.length < N*N) parts.push("");
    const gridStyle = {
      display: "grid",
      gridTemplateColumns: `repeat(${N}, 18px)`,
      gridTemplateRows: `repeat(${N}, 18px)`,
      gap: 2,
    };
    const cellStyle = {
      width: 18, height: 18, border: "1px solid #ddd",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, userSelect: "none",
    };
    return (
      <div style={gridStyle}>
        {parts.slice(0, N*N).map((v, i) => (
          <div key={i} style={cellStyle}>
            <span style={{ color: v === "X" ? "#1976d2" : v === "O" ? "#d32f2f" : "#9e9e9e" }}>
              {v || ""}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const card = { padding: 16, border: "1px solid #eee", borderRadius: 10, background: "#fff" };

  return (
    <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 16px" }}>
      <h1>XO Game</h1>

      {/* ตั้งค่าเกมใหม่ */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
        <div style={card}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>โหมดการเล่น</div>
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="radio" name="mode" checked={mode === "PVP"} onChange={() => setMode("PVP")} />
            PVP (คน vs คน)
          </label>
          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <input type="radio" name="mode" checked={mode === "PVBOT"} onChange={() => setMode("PVBOT")} />
            PVBOT (คน vs บอท)
          </label>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>ขนาดกระดาน (N×N)</div>
          <input type="number" min={3} max={19} value={size} onChange={onSizeChange} style={{ width: 120 }} />
          <div style={{ color: "#666", marginTop: 6 }}>
            กติกาอัตโนมัติ: {size}×{size} ⇒ เรียงชนะ {defaultKForN(size)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={startGame} style={{ padding: "10px 16px", fontWeight: 600 }}>
          เริ่มเกม
        </button>
      </div>

      {/* ประวัติการเล่น */}
      <div style={{ marginTop: 28, ...card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>ประวัติการเล่น</h2>
          <button onClick={loadHistory}>Refresh</button>
        </div>

        {loading && <div style={{ marginTop: 12 }}>Loading...</div>}
        {err && <div style={{ marginTop: 12, color: "crimson" }}>{err}</div>}

        {!loading && !err && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>ID</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Winner</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Mode</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Size</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Final Board</th>
              </tr>
            </thead>
            <tbody>
              {items.map((h) => (
                <tr key={h.historyId}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{h.historyId}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{h.winner}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{h.gameMode}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{h.sizeBoard}</td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    <MiniBoard board={h.board} sizeBoard={h.sizeBoard} />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 12, color: "#777" }}>ยังไม่มีประวัติ</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
