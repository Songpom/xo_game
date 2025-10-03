// src/screens/Game.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { checkWinner, makeEmptyBoard } from "./gamelogic";
import { defaultKForN } from "./rules";
import { getBestMove } from "./Ai"; // ใช้ตอนเลือก AI
import BoardInteractive, { cellsToString } from "./Board";
import {
  startHistory,
  appendMove,
  finishHistory,
  deleteHistory,
} from "../services/historyService";
import "../Game.css";

export default function Game() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};

  // ค่าที่ส่งมาจาก Home
  const mode  = state?.mode  ?? "PVP";
  const N     = state?.size  ?? 3;
  const K     = state?.k     ?? defaultKForN(N);
  const first = state?.first ?? "X";

  // สถานะบอท (เลือกได้เฉพาะโหมด PVBOT)
  const [botType, setBotType] = useState(mode === "PVBOT" ? "RANDOM" : null); // "RANDOM" | "AI" | null

  // ถ้าเข้าหน้านี้โดยไม่ผ่าน Home → เด้งกลับ
  useEffect(() => { if (!state) navigate("/home"); }, [state, navigate]);

  // สถานะกระดาน
  const [cells, setCells]   = useState(() => makeEmptyBoard(N));
  const [turn, setTurn]     = useState(first);              // "X" | "O"
  const [winner, setWinner] = useState(null);               // "X" | "O" | "DRAW" | null
  const [saved, setSaved]   = useState(false);              // แสดงผลว่าบันทึกแล้ว

  const isPvBot = mode === "PVBOT";

  // refs จัดการวงจรชีวิตเกมฝั่ง backend
  const historyIdRef   = useRef(null);   // id เกมใน DB
  const startedRef     = useRef(false);  // เริ่มเกมใน DB แล้วหรือยัง
  const turnCounterRef = useRef(0);      // จำนวน move ที่บันทึกไปแล้ว
  const finishedRef    = useRef(false);  // กัน finish ซ้ำซ้อน
  const deletingRef    = useRef(false);  // กันลบซ้ำ

  // เริ่มเกมใน DB (ครั้งแรกเมื่อมีการเดินจริง)
  async function ensureHistoryStarted() {
    if (startedRef.current) return;
    const created = await startHistory({
      mode,
      sizeBoard: N,
      firstPlayer: first,
      botType, // ส่งชนิดบอทตอนเริ่ม (ถ้าเปลี่ยนกลางเกม ฝั่ง DB จะเก็บค่าแรกไว้)
    });
    historyIdRef.current = created.id;
    startedRef.current = true;
  }

  // เมื่อผู้เล่นคลิกช่อง
  const onCellClick = async (index) => {
    if (winner || cells[index]) return;
    if (isPvBot && turn === "O") return; // ถึงตาบอท

    const nextBoard = [...cells];
    nextBoard[index] = turn;

    // 1) อัปเดต UI
    setCells(nextBoard);
    setTurn(turn === "X" ? "O" : "X");

    try {
      // 2) เริ่มเกมใน DB ถ้ายังไม่เริ่ม
      await ensureHistoryStarted();

      // 3) บันทึก move
      turnCounterRef.current += 1;
      const boardAfter = cellsToString(nextBoard, N);

      await appendMove(historyIdRef.current, {
        turnNumber: turnCounterRef.current,
        player: turn,
        rowIdx: Math.floor(index / N),
        colIdx: index % N,
        boardAfter,
      });

      // 4) ตรวจผู้ชนะ แล้ว finish ทันที
      const maybeWinner = checkWinner(nextBoard, N, K);
      if (maybeWinner && !finishedRef.current) {
        finishedRef.current = true;
        await finishHistory(historyIdRef.current, {
          winner: maybeWinner,
          finalBoard: boardAfter,
        });
        setWinner(maybeWinner);
        setSaved(true);
      }
    } catch (e) {
      console.error("appendMove (human) failed:", e);
    }
  };

  // =============================
  // บอทสุ่ม (Random) — ทำงานเมื่อ botType === "RANDOM"
  // =============================
  useEffect(() => {
    if (botType !== "RANDOM") return;         // ✅ ทำงานเฉพาะโหมด Random
    if (!isPvBot || winner || turn !== "O") return;

    const empties = cells.map((v, i) => (v ? null : i)).filter((x) => x !== null);
    if (!empties.length) return;

    const pick = empties[Math.floor(Math.random() * empties.length)];
    const t = setTimeout(async () => {
      const nextBoard = [...cells];
      if (nextBoard[pick]) return;
      nextBoard[pick] = "O";

      // 1) อัปเดต UI
      setCells(nextBoard);
      setTurn("X");

      try {
        // 2) เริ่มเกมถ้ายังไม่เริ่ม
        await ensureHistoryStarted();

        // 3) บันทึก move ของบอท
        turnCounterRef.current += 1;
        const boardAfter = cellsToString(nextBoard, N);

        await appendMove(historyIdRef.current, {
          turnNumber: turnCounterRef.current,
          player: "O",
          rowIdx: Math.floor(pick / N),
          colIdx: pick % N,
          boardAfter,
        });

        // 4) ตรวจผู้ชนะ & finish
        const maybeWinner = checkWinner(nextBoard, N, K);
        if (maybeWinner && !finishedRef.current) {
          finishedRef.current = true;
          await finishHistory(historyIdRef.current, {
            winner: maybeWinner,
            finalBoard: boardAfter,
          });
          setWinner(maybeWinner);
          setSaved(true);
        }
      } catch (e) {
        console.error("appendMove (bot RANDOM) failed:", e);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [botType, isPvBot, winner, turn, cells, N, K]);

  // =============================
  // บอท AI (Heuristic) — ทำงานเมื่อ botType === "AI"
  // =============================
  useEffect(() => {
    if (botType !== "AI") return;             // ✅ ทำงานเฉพาะโหมด AI
    if (mode !== "PVBOT" || winner || turn !== "O") return;

    const moveIndex = getBestMove(cells, N, K, "O", "X");
    if (moveIndex == null || cells[moveIndex]) return;

    const t = setTimeout(async () => {
      const nextBoard = [...cells];
      nextBoard[moveIndex] = "O";
      setCells(nextBoard);
      setTurn("X");
      try {
        await ensureHistoryStarted();
        turnCounterRef.current += 1;
        const boardAfter = cellsToString(nextBoard, N);

        await appendMove(historyIdRef.current, {
          turnNumber: turnCounterRef.current,
          player: "O",
          rowIdx: Math.floor(moveIndex / N),
          colIdx: moveIndex % N,
          boardAfter,
        });

        const maybeWinner = checkWinner(nextBoard, N, K);
        if (maybeWinner && !finishedRef.current) {
          finishedRef.current = true;
          await finishHistory(historyIdRef.current, {
            winner: maybeWinner,
            finalBoard: boardAfter,
          });
          setWinner(maybeWinner);
          setSaved(true);
        }
      } catch (e) {
        console.error("appendMove (bot AI) failed:", e);
      }
    }, 280);

    return () => clearTimeout(t);
  }, [botType, mode, winner, turn, cells, N, K]);

  // รีเซ็ตกระดาน (เฉพาะ UI)
  const reset = () => {
    setCells(makeEmptyBoard(N));
    setTurn(Math.random() < 0.5 ? "X" : "O");
    setWinner(null);
    setSaved(false);
    finishedRef.current = false;
    turnCounterRef.current = 0;
  };

  // ===== ลบเกมอัตโนมัติถ้า "เล่นไม่จบ" =====
  const handleBackToHome = async () => {
    if (startedRef.current && !finishedRef.current && historyIdRef.current && !deletingRef.current) {
      try {
        deletingRef.current = true;
        await deleteHistory(historyIdRef.current);
      } catch {}
    }
    navigate("/home");
  };

  useEffect(() => {
    const onBeforeUnload = () => {
      if (startedRef.current && !finishedRef.current) {
        navigator.sendBeacon?.(
          `${process.env.REACT_APP_API_URL}/history/${historyIdRef.current}`,
          new Blob([], { type: "application/json" })
        );
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    return () => {
      if (startedRef.current && !finishedRef.current && historyIdRef.current && !deletingRef.current) {
        deletingRef.current = true;
        deleteHistory(historyIdRef.current).catch(() => {});
      }
    };
  }, []);

  const statusText = useMemo(
    () => (!winner ? `ตาปัจจุบัน: ${turn}` : winner === "DRAW" ? "ผลลัพธ์: เสมอ" : `ผู้ชนะ: ${winner}`),
    [winner, turn]
  );

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="btn btn-ghost" onClick={handleBackToHome}>
          ← กลับหน้า Home
        </button>

        <div className="game-meta">
          โหมด: <b>{mode}</b> · กระดาน: <b>{N}×{N}</b> · ชนะเมื่อเรียง <b>{K}</b>
          {isPvBot && (
            <>
              {" "}· บอท:{" "}
              <span style={{ fontWeight: 800 }}>
                {botType === "AI" ? "AI" : "Random"}
              </span>
            </>
          )}
        </div>

        {/* ปุ่มสลับบอท (แสดงเฉพาะ PVBOT) */}
        {isPvBot && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`btn ${botType === "RANDOM" ? "btn-primary" : ""}`}
              onClick={() => setBotType("RANDOM")}
              aria-pressed={botType === "RANDOM"}
            >
              🤖 Random
            </button>
            <button
              className={`btn ${botType === "AI" ? "btn-primary" : ""}`}
              onClick={() => setBotType("AI")}
              aria-pressed={botType === "AI"}
            >
              🧠 AI
            </button>
          </div>
        )}
      </div>

      <div className="status-row">
        <div className={`status-badge ${winner ? "done" : "turn"}`}>{statusText}</div>
        {winner && (
          <div className={`save-indicator ${saved ? "saved" : "saving"}`}>
            {saved ? "บันทึกแล้ว" : "กำลังบันทึก…"}
          </div>
        )}
      </div>

      <div className="board-wrap">
        <BoardInteractive
          size={N}
          cells={cells}
          onCellClick={onCellClick}
          cellPx={N <= 5 ? 90 : N <= 10 ? 56 : 36}
          gap={N <= 10 ? 6 : 4}
        />
      </div>

      <div className="actions">
        <button className="btn" onClick={reset}>เริ่มใหม่ (สุ่มคนเริ่ม)</button>
        <button className="btn" onClick={handleBackToHome}>เปลี่ยนโหมด/ขนาด</button>
      </div>
    </div>
  );
}
