// src/screens/Game.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { checkWinner, makeEmptyBoard } from "./gamelogic";
import { defaultKForN } from "./rules";

// ถ้าไฟล์รวมกระดานชื่อ "board.js" อยู่ใน components:
// import BoardInteractive, { cellsToString } from "../components/board";
// ถ้าอยู่โฟลเดอร์เดียวกับ Game.js:
import BoardInteractive, { cellsToString } from "./Board"; 

import { createHistory } from "../services/historyService";

export default function Game() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};

  const mode  = state?.mode  ?? "PVP";
  const N     = state?.size  ?? 3;
  const K     = state?.k     ?? defaultKForN(N);
  const first = state?.first ?? "X";

  // ถ้าเข้าหน้านี้โดยไม่ผ่าน Home ให้เด้งกลับ
  useEffect(() => { if (!state) navigate("/home"); }, [state, navigate]);

  const [cells, setCells]   = useState(() => makeEmptyBoard(N));
  const [turn, setTurn]     = useState(first);           // "X" | "O"
  const [winner, setWinner] = useState(null);            // "X" | "O" | "DRAW" | null
  const [saved, setSaved]   = useState(false);           // กันโพสต์ซ้ำ
  const isPvBot = mode === "PVBOT";

  // เช็กผลทุกครั้งที่เดิน
  useEffect(() => {
    const w = checkWinner(cells, N, K);
    if (w && !winner) setWinner(w);
  }, [cells, N, K, winner]);

  // บอท (O) เดินแบบสุ่ม
  useEffect(() => {
    if (!isPvBot || winner || turn !== "O") return;
    const empties = cells.map((v, i) => (v ? null : i)).filter((x) => x !== null);
    if (!empties.length) return;

    const pick = empties[Math.floor(Math.random() * empties.length)];
    const t = setTimeout(() => {
      setCells((prev) => {
        if (prev[pick]) return prev;
        const next = [...prev];
        next[pick] = "O";
        return next;
      });
      setTurn("X");
    }, 300);

    return () => clearTimeout(t);
  }, [isPvBot, winner, turn, cells]);

  // คลิกช่อง
  const onCellClick = (i) => {
    if (winner || cells[i]) return;          // จบแล้ว/ช่องไม่ว่าง
    if (isPvBot && turn === "O") return;     // ถึงตาบอท

    setCells((prev) => {
      const next = [...prev];
      next[i] = turn;
      return next;
    });
    setTurn((t) => (t === "X" ? "O" : "X"));
  };

  // รีเซ็ตเกม
  const reset = () => {
    setCells(makeEmptyBoard(N));
    setTurn(Math.random() < 0.5 ? "X" : "O");
    setWinner(null);
    setSaved(false);
  };

  // จบเกมแล้วบันทึกอัตโนมัติ (โพสต์ครั้งเดียว)
  useEffect(() => {
    if (!winner || saved) return;

    const payload = {
      winner,            // "X" | "O" | "DRAW"
      gameMode: mode,    // "PVP" | "PVBOT"
      sizeBoard: N,      // ตรงกับ entity (Integer)
      board: cellsToString(cells, N),
    };

    (async () => {
      try {
        await createHistory(payload);
        setSaved(true);
      } catch (e) {
        console.error("Save history failed:", e);
        alert("บันทึกประวัติไม่สำเร็จ");
      }
    })();
  }, [winner, saved, mode, N, cells]);

  return (
    <div style={{ maxWidth: 920, margin: "24px auto", padding: "0 16px" }}>
      <button onClick={() => navigate("/home")} style={{ marginBottom: 12 }}>← กลับหน้า Home</button>
      <h2 style={{ marginTop: 0 }}>โหมด: {mode} | กระดาน: {N}×{N} | ชนะเมื่อเรียง {K}</h2>

      <div style={{ margin: "12px 0", fontSize: 18, fontWeight: 700 }}>
        {winner ? (winner === "DRAW" ? "ผลลัพธ์: เสมอ" : `ผู้ชนะ: ${winner}`) : `ตาปัจจุบัน: ${turn}`}
        {winner && (
          <span style={{ marginLeft: 12, color: saved ? "green" : "#999", fontWeight: 600 }}>
            {saved ? " (บันทึกแล้ว)" : " (กำลังบันทึก…)"}
          </span>
        )}
      </div>

      <BoardInteractive
        size={N}
        cells={cells}
        onCellClick={onCellClick}
        cellPx={N <= 5 ? 90 : N <= 10 ? 56 : 36}
        gap={N <= 10 ? 6 : 4}
      />

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button onClick={reset}>เริ่มใหม่ (สุ่มคนเริ่ม)</button>
        <button onClick={() => navigate("/home")}>เปลี่ยนโหมด/ขนาด</button>
      </div>
    </div>
  );
}
